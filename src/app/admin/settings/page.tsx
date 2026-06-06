import AdminPage from "@/components/admin/Page";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import SettingsForm from "@/components/admin/SettingsForm";
import TelegramWebhookSetup from "@/components/admin/TelegramWebhookSetup";
import { getSystemSettings } from "@/lib/store/settings";

async function checkDatabaseStatus() {
  const start = Date.now();
  try {
    const dbUrl = process.env.DATABASE_URL || "";
    const isDbValid = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
    if (!isDbValid) return { status: "Unconfigured", latency: 0, error: "DATABASE_URL is not set or invalid." };

    // Run simple query to test connection
    await db.execute(sql`SELECT 1`);
    const latency = Date.now() - start;
    return { status: "Connected", latency, error: null };
  } catch (err) {
    return {
      status: "Error",
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export default async function SettingsPage() {
  const dbStatus = await checkDatabaseStatus();
  const settings = await getSystemSettings();
  
  const cloudinaryConfigured =
    !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.startsWith("your_");

  const telegramConfigured =
    (!!process.env.TELEGRAM_BOT_TOKEN && !process.env.TELEGRAM_BOT_TOKEN.startsWith("your_")) ||
    (!!process.env.TELEGRAM_CHANNEL_BOT_TOKEN && !process.env.TELEGRAM_CHANNEL_BOT_TOKEN.startsWith("your_")) ||
    (!!process.env.TELEGRAM_NOTIFICATIONS_BOT_TOKEN && !process.env.TELEGRAM_NOTIFICATIONS_BOT_TOKEN.startsWith("your_"));

  const borderStyle = "1px solid #E5E0D8";

  return (
    <AdminPage title="Settings" subtitle="Manage configuration and system services.">
      <div className="flex flex-col gap-6 max-w-4xl">
        
        {/* Connection Status Panel */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: borderStyle }}>
          <h3 className="text-[15px] font-bold mb-4" style={{ color: "#1C3A2F" }}>System Integration Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* DB */}
            <div className="p-4 rounded-xl border flex flex-col justify-between" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
              <div>
                <span className="text-xs font-bold uppercase tracking-[1px] text-[#999]">PostgreSQL Database</span>
                <p className="text-[18px] font-bold mt-1" style={{ color: dbStatus.status === "Connected" ? "#2E7D4F" : "#E05252" }}>
                  {dbStatus.status}
                </p>
              </div>
              <div className="mt-4 text-[11px] text-[#666]">
                {dbStatus.status === "Connected" ? (
                  <span>Latency: <strong className="text-[#1C3A2F]">{dbStatus.latency}ms</strong></span>
                ) : (
                  <span className="text-[#E05252] truncate block">{dbStatus.error || "No active connection"}</span>
                )}
              </div>
            </div>

            {/* Cloudinary */}
            <div className="p-4 rounded-xl border flex flex-col justify-between" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
              <div>
                <span className="text-xs font-bold uppercase tracking-[1px] text-[#999]">Cloudinary Assets</span>
                <p className="text-[18px] font-bold mt-1" style={{ color: cloudinaryConfigured ? "#2E7D4F" : "#E05252" }}>
                  {cloudinaryConfigured ? "Configured" : "Unconfigured"}
                </p>
              </div>
              <div className="mt-4 text-[11px] text-[#666]">
                {cloudinaryConfigured ? (
                  <span>Cloud: <strong className="text-[#1C3A2F]">{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}</strong></span>
                ) : (
                  <span>Add keys in <code className="bg-white px-1 border rounded">.env.local</code></span>
                )}
              </div>
            </div>

            {/* Telegram */}
            <div className="p-4 rounded-xl border flex flex-col justify-between" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
              <div>
                <span className="text-xs font-bold uppercase tracking-[1px] text-[#999]">Telegram Bot</span>
                <p className="text-[18px] font-bold mt-1" style={{ color: telegramConfigured ? "#2E7D4F" : "#C9A84C" }}>
                  {telegramConfigured ? "Active" : "Disabled"}
                </p>
              </div>
              <div className="mt-4 text-[11px] text-[#666] flex flex-col gap-0.5">
                {telegramConfigured ? (
                  <>
                    {(process.env.TELEGRAM_CHANNEL_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN) && (
                      <span>Posting Bot: <strong className="text-[#2E7D4F]">Active</strong></span>
                    )}
                    {(process.env.TELEGRAM_NOTIFICATIONS_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN) && (
                      <span>Enquiries Bot: <strong className="text-[#2E7D4F]">Active</strong></span>
                    )}
                    {process.env.TELEGRAM_CHAT_ID && (
                      <span>Chat ID: <strong className="text-[#1C3A2F]">{process.env.TELEGRAM_CHAT_ID}</strong></span>
                    )}
                  </>
                ) : (
                  <span>Not initialized</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Database Exporter / Backups */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: borderStyle }}>
          <h3 className="text-[15px] font-bold mb-1" style={{ color: "#1C3A2F" }}>Data Exporter & Bulk Import</h3>
          <p className="text-[12px] text-[#888] mb-4">Export all properties as JSON backup file or upload property arrays to database.</p>
          <div className="flex gap-3">
            <a
              href="/api/admin/properties/bulk"
              download
              className="py-2.5 px-4 rounded-xl text-[12px] font-semibold cursor-pointer border border-[#E5E0D8] text-[#1C3A2F] hover:bg-[#FAF8F3] transition-all no-underline"
            >
              📥 Export Listings JSON
            </a>
          </div>
        </div>

        {/* Telegram Auto-Posting Setup */}
        <TelegramWebhookSetup />

        {/* System Settings Form */}
        <SettingsForm initialSettings={settings} />

      </div>
    </AdminPage>
  );
}
