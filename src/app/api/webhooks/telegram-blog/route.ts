import { NextRequest, NextResponse } from "next/server";
import {
  fetchThailandTrends,
  generateBlogDraft,
  saveBlogDraft,
  getBlogDraft,
  deleteBlogDraft,
  BlogDraft
} from "@/lib/blog-generator";
import { createPost } from "@/lib/store/blog";
import { submitToGoogleIndexing } from "@/lib/google-indexing";

interface TelegramCallbackQuery {
  id: string;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  message?: {
    message_id: number;
    chat: {
      id: number;
    };
    text?: string;
    caption?: string;
  };
  data: string; // callback_data
}

interface TelegramPhoto {
  file_id: string;
}

interface TelegramMessage {
  message_id: number;
  text?: string;
  caption?: string;
  photo?: TelegramPhoto[];
  chat?: {
    id: number;
    type?: string;
  };
  from?: {
    id: number;
    first_name: string;
    username?: string;
  };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

/**
 * Sends a HTML message to Telegram.
 */
async function sendTelegramMessage(botToken: string, chatId: number | string, text: string, replyToMessageId?: number) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_to_message_id: replyToMessageId,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });
  } catch (err) {
    console.error("Error sending message to Telegram:", err);
  }
}

/**
 * Sends a photo to Telegram with caption and inline markup.
 */
async function sendTelegramPhoto(botToken: string, chatId: number | string, photoUrl: string, caption: string, replyMarkup?: any) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup
      })
    });
  } catch (err) {
    console.error("Error sending photo to Telegram:", err);
  }
}

/**
 * Edits an existing Telegram photo's caption.
 */
async function editTelegramCaption(botToken: string, chatId: number | string, messageId: number, caption: string, replyMarkup?: any) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/editMessageCaption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        caption: caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup
      })
    });
  } catch (err) {
    console.error("Error editing Telegram caption:", err);
  }
}

/**
 * Answers a Telegram callback query to clear loading spinner.
 */
async function answerCallbackQuery(botToken: string, callbackQueryId: string, text?: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text
      })
    });
  } catch (err) {
    console.error("Error answering callback query:", err);
  }
}

export async function POST(req: NextRequest) {
  // Webhook Signature verification
  const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
  const expectedSecret = process.env.TELEGRAM_BLOG_WEBHOOK_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret && secretToken !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized request signature." }, { status: 401 });
  }

  // Determine Bot Token
  const botToken = process.env.TELEGRAM_BLOG_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_BLOG_BOT_TOKEN or TELEGRAM_BOT_TOKEN env variable is missing." }, { status: 500 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 200 });
  }

  // 1. Handle Callback Query (e.g. clicking Publish or Cancel buttons)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat.id;
    const messageId = cb.message?.message_id;
    const callbackQueryId = cb.id;

    if (!chatId || !messageId) {
      return NextResponse.json({ ok: true });
    }

    // Authenticate Chat ID
    const allowedChatId = process.env.TELEGRAM_BLOG_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
    if (allowedChatId && String(chatId) !== String(allowedChatId)) {
      await answerCallbackQuery(botToken, callbackQueryId, "Unauthorized access.");
      return NextResponse.json({ ok: true });
    }

    const [action, draftId] = cb.data.split(":");
    if (!action || !draftId) {
      await answerCallbackQuery(botToken, callbackQueryId, "Invalid callback data.");
      return NextResponse.json({ ok: true });
    }

    const draft = await getBlogDraft(draftId);
    if (!draft) {
      await answerCallbackQuery(botToken, callbackQueryId, "Draft not found or already published.");
      await editTelegramCaption(botToken, chatId, messageId, "❌ <i>This draft has expired or is no longer available.</i>");
      return NextResponse.json({ ok: true });
    }

    if (action === "publish") {
      try {
        await answerCallbackQuery(botToken, callbackQueryId, "Publishing blog...");
        
        // Save to blog.json
        await createPost(draft);
        
        // Remove from drafts
        await deleteBlogDraft(draftId);

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const blogUrl = `${baseUrl}/blog/${draft.slug}`;

        // Ping Google Indexing API
        await submitToGoogleIndexing(blogUrl);

        // Edit original preview message caption
        const successText = `🚀 <b>Blog Post Published Successfully!</b>\n\n📌 <b>Title:</b> ${draft.title}\n🔗 <a href="${blogUrl}">View Live Post</a>\n\n<i>Google Indexing API has been notified.</i>`;
        await editTelegramCaption(botToken, chatId, messageId, successText);
      } catch (err) {
        console.error("Publish action failed:", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        await sendTelegramMessage(botToken, chatId, `❌ <b>Failed to publish blog:</b> ${errMsg}`);
      }
    } else if (action === "cancel") {
      await answerCallbackQuery(botToken, callbackQueryId, "Draft cancelled.");
      await deleteBlogDraft(draftId);
      await editTelegramCaption(botToken, chatId, messageId, `❌ <b>Draft blog cancelled.</b>\nTopic: <i>${draft.title}</i>`);
    }

    return NextResponse.json({ ok: true });
  }

  // 2. Handle standard Text Commands
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    const messageId = msg.message_id;
    const text = msg.text || "";

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    // Authenticate Chat ID
    const allowedChatId = process.env.TELEGRAM_BLOG_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
    if (allowedChatId && String(chatId) !== String(allowedChatId)) {
      console.log(`Unauthorized Blog Bot access: Chat ID ${chatId}`);
      return NextResponse.json({ ok: true });
    }

    const trimmedText = text.trim();

    // Command: /start or /help
    if (trimmedText.startsWith("/start") || trimmedText.startsWith("/help")) {
      const helpText = `📝 <b>NHP Automated Blog Writer Bot</b>\n\n` +
        `Write SEO-friendly real estate blogs from your phone in a helpful, conversational, human-like voice.\n\n` +
        `<b>Available Commands:</b>\n` +
        `• <code>/blog [topic or script]</code> — Generates a draft blog post with an iPhone-shot style cover photo and sends a preview.\n` +
        `• <code>/blog_trend</code> — Fetches trending topics in Thailand for content ideas.\n` +
        `• <code>/blog_confirm [draft_id]</code> — Fallback manual publishing command.`;
      await sendTelegramMessage(botToken, chatId, helpText, messageId);
      return NextResponse.json({ ok: true });
    }

    // Command: /blog_trend
    if (trimmedText.startsWith("/blog_trend")) {
      await sendTelegramMessage(botToken, chatId, "🔍 Scoping trending search terms in Thailand...", messageId);
      const trends = await fetchThailandTrends();
      
      if (trends.length === 0) {
        await sendTelegramMessage(botToken, chatId, "⚠️ Could not retrieve search trends at the moment. Try writing a custom topic!", messageId);
        return NextResponse.json({ ok: true });
      }

      const trendList = trends.map((t, i) => `${i + 1}. <b>${t}</b>`).join("\n");
      const responseText = `🇹🇭 <b>Current Trending Search Topics (Thailand):</b>\n\n${trendList}\n\n` +
        `<i>To write a blog on one, type:</i>\n<code>/blog [trend topic]</code>`;
      await sendTelegramMessage(botToken, chatId, responseText, messageId);
      return NextResponse.json({ ok: true });
    }

    // Command: /blog [topic]
    if (trimmedText.startsWith("/blog")) {
      const topicPart = trimmedText.substring(5).trim();
      if (!topicPart) {
        await sendTelegramMessage(botToken, chatId, "⚠️ Please specify a blog topic or paste your script/outline, e.g.:\n<code>/blog MRT Yellow line condo options</code>", messageId);
        return NextResponse.json({ ok: true });
      }

      await sendTelegramMessage(botToken, chatId, `✍️ <b>Drafting your blog post:</b>\n"${topicPart}"\n\n<i>This will take 15-30 seconds to write the content and create the realistic cover image...</i>`, messageId);
      
      try {
        const { post, imagePrompt } = await generateBlogDraft(topicPart);
        const draftId = `draft_${Math.random().toString(36).substring(2, 9)}`;

        const draft: BlogDraft = {
          ...post,
          id: draftId,
          imagePrompt,
          createdAt: new Date().toISOString()
        };

        // Cache the draft
        await saveBlogDraft(draft);

        // Format the preview description
        const previewText = `📝 <b>Draft Blog Preview Ready!</b>\n\n` +
          `📌 <b>Title:</b> ${draft.title}\n` +
          `📂 <b>Category:</b> ${draft.category}\n` +
          `⏱️ <b>Read Time:</b> ${draft.readTime}\n` +
          `🔑 <b>Keywords:</b> ${draft.keywords.join(", ")}\n\n` +
          `📖 <b>Excerpt:</b> ${draft.excerpt}\n\n` +
          `<i>Review the generated iPhone-shot style cover photo. Press Publish below to commit it live.</i>`;

        // Send photo with inline buttons
        const inlineKeyboard = {
          inline_keyboard: [
            [
              { text: "✅ Publish Blog", callback_data: `publish:${draftId}` },
              { text: "❌ Cancel", callback_data: `cancel:${draftId}` }
            ]
          ]
        };

        await sendTelegramPhoto(botToken, chatId, draft.image, previewText, inlineKeyboard);
      } catch (err) {
        console.error("Failed to generate blog draft:", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        await sendTelegramMessage(botToken, chatId, `❌ <b>Drafting failed:</b>\n${errMsg}`, messageId);
      }
      return NextResponse.json({ ok: true });
    }

    // Command: /blog_confirm [draft_id] (fallback)
    if (trimmedText.startsWith("/blog_confirm")) {
      const draftId = trimmedText.substring(13).trim();
      if (!draftId) {
        await sendTelegramMessage(botToken, chatId, "⚠️ Please specify a draft ID, e.g.:\n<code>/blog_confirm draft_x1y2z3</code>", messageId);
        return NextResponse.json({ ok: true });
      }

      const draft = await getBlogDraft(draftId);
      if (!draft) {
        await sendTelegramMessage(botToken, chatId, "❌ Draft not found or already published.", messageId);
        return NextResponse.json({ ok: true });
      }

      try {
        await createPost(draft);
        await deleteBlogDraft(draftId);

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const blogUrl = `${baseUrl}/blog/${draft.slug}`;
        
        await submitToGoogleIndexing(blogUrl);
        await sendTelegramMessage(botToken, chatId, `🚀 <b>Blog Published Successfully!</b>\n\n🔗 <a href="${blogUrl}">View Live Post</a>`, messageId);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        await sendTelegramMessage(botToken, chatId, `❌ Failed to publish: ${errMsg}`, messageId);
      }
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ ok: true });
}
