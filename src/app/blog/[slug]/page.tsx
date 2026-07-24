import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllPosts, getPostBySlug } from "@/lib/store/blog";
import BlogPostClient from "@/components/blog/BlogPostClient";

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
  // Get posts in the same category first (excluding current post)
  let related = all.filter((p) => p.category === post.category && p.slug !== post.slug);
  // If we have fewer than 3, pad with other categories
  if (related.length < 3) {
    const otherPosts = all.filter((p) => p.category !== post.category && p.slug !== post.slug);
    related = [...related, ...otherPosts].slice(0, 3);
  } else {
    related = related.slice(0, 3);
  }

  // Build the absolute image URL for schema
  const siteBase = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");
  const imageUrl = post.image.startsWith("http") ? post.image : `${siteBase}${post.image.startsWith("/") ? "" : "/"}${post.image}`;
  const currentUrl = `${siteBase}/blog/${post.slug}`;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDesc,
    image: imageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
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
      <Navbar />
      <BlogPostClient post={post} currentUrl={currentUrl} relatedPosts={related} />
      <Footer />
    </>
  );
}
