import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Footer from "@/components/Footer";
import { getAllPosts, getPostBySlug } from "@/lib/store/blog";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found — NHP Blog" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

  let imageUrl = post.image || "/images/homepage_hero_v2.webp";
  if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
    imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  }
  // Convert Cloudinary WebP to JPG for better social platform link preview support
  if (imageUrl.includes("cloudinary.com") && imageUrl.endsWith(".webp")) {
    imageUrl = imageUrl.slice(0, -5) + ".jpg";
  }

  return {
    title:       post.metaTitle,
    description: post.metaDesc,
    keywords:    post.keywords.join(", "),
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug.toLowerCase()}`,
    },
    openGraph: {
      title:       post.metaTitle,
      description: post.metaDesc,
      images:      [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.metaTitle,
        }
      ],
      type:        "article",
    },
    twitter: {
      card: "summary_large_image",
      title:       post.metaTitle,
      description: post.metaDesc,
      images:      [imageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const all     = await getAllPosts();
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const headerFont = post.headerFontFamily || "Outfit";
  const bodyFont = post.fontFamily || "Inter";
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(headerFont)}:wght@400;600;700&family=${encodeURIComponent(bodyFont)}:wght@300;400;500;600&display=swap`;

  // Build the absolute image URL for schema
  const siteBase = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");
  const imageUrl = post.image.startsWith("http") ? post.image : `${siteBase}${post.image.startsWith("/") ? "" : "/"}${post.image}`;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDesc,
    image: imageUrl,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author || "NHP Bangkok Team",
      url: siteBase,
    },
    publisher: {
      "@type": "Organization",
      name: "NHP Bangkok",
      logo: {
        "@type": "ImageObject",
        url: `${siteBase}/images/nhp-logo.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteBase}/blog/${post.slug}`,
    },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    inLanguage: "en",
  };

  const blogBreadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteBase
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${siteBase}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `${siteBase}/blog/${post.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogBreadcrumbJsonLd) }}
      />
      <link rel="stylesheet" href={fontUrl} />
      <Navbar />
      <main style={{ paddingTop: 56, background: "#F7F3EC", fontFamily: `${bodyFont}, sans-serif` }}>

        {/* ── Hero ── */}
        <div className="relative overflow-hidden" style={{ height: "clamp(280px, 40vw, 480px)", background: "#1C3A2F" }}>
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-8 max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold mb-3" style={{ background: "#C9A84C", color: "#1C3A2F" }}>
              {post.category}
            </span>
            <h1 className="text-[22px] md:text-[32px] font-bold leading-[1.2] mb-3" style={{ color: "#FFFFFF", letterSpacing: "-0.5px", fontFamily: `${headerFont}, sans-serif` }}>
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              <span>{post.author}</span>
              <span>·</span>
              <span>{formattedDate}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>

        {/* ── Article body ── */}
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[12px] mb-8" style={{ color: "#999" }}>
            <Link href="/" className="no-underline hover:underline" style={{ color: "#999" }}>Home</Link>
            <span>/</span>
            <Link href="/blog" className="no-underline hover:underline" style={{ color: "#999" }}>Guides</Link>
            <span>/</span>
            <span style={{ color: "#1C3A2F" }}>{post.category}</span>
          </nav>

          {/* Intro */}
          <p
            className="text-[16px] md:text-[17px] leading-[1.8] mb-8 font-light"
            style={{ color: "#333", borderLeft: "3px solid #C9A84C", paddingLeft: 20 }}
          >
            {post.intro}
          </p>

          {/* Sections */}
          {post.sections.map((section, i) => (
            <div key={i} className="mb-8">
              <h2
                className="text-[18px] md:text-[22px] font-bold mb-4"
                style={{ color: "#1C3A2F", letterSpacing: "-0.3px", fontFamily: `${headerFont}, sans-serif` }}
              >
                {section.heading}
              </h2>
              {section.body.map((para, j) => (
                <p
                  key={j}
                  className="text-[15px] leading-[1.8] mb-4 font-light"
                  style={{ color: "#444" }}
                >
                  {para}
                </p>
              ))}
            </div>
          ))}

          {/* CTA box */}
          <div
            className="rounded-2xl p-6 mt-10 mb-10"
            style={{ background: "#1C3A2F" }}
          >
            <h3 className="text-[18px] font-bold mb-2" style={{ color: "#E2C97E" }}>
              {post.cta.heading}
            </h3>
            <p className="text-[14px] font-light mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>
              {post.cta.body}
            </p>
            <a
              href={post.cta.href}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold no-underline transition-opacity hover:opacity-90"
              style={{ background: "#C9A84C", color: "#1C3A2F" }}
            >
              {post.cta.label} →
            </a>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {post.keywords.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1 rounded-full text-[11px] font-medium"
                style={{ background: "#EDE8DF", color: "#555" }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* ── Related posts ── */}
        {related.length > 0 && (
          <div
            className="px-4 md:px-8 py-10"
            style={{ background: "#FFFFFF", borderTop: "1px solid #EDE8DF" }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-[18px] font-bold mb-6" style={{ color: "#1C3A2F" }}>
                More guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((p) => (
                  <a
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="group no-underline rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200"
                    style={{ background: "#F7F3EC", border: "1px solid #E5E0D8" }}
                  >
                    <div className="relative overflow-hidden" style={{ height: 140 }}>
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.8px]" style={{ color: "#C9A84C" }}>
                        {p.category}
                      </span>
                      <h3 className="text-[13px] font-semibold leading-[1.4] mt-1 line-clamp-2" style={{ color: "#1A1A1A" }}>
                        {p.title}
                      </h3>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
