import { notFound } from "next/navigation";
import AdminPage from "@/components/admin/Page";
import BlogForm from "@/components/admin/BlogForm";
import { getPostBySlug } from "@/lib/store/blog";

interface Props { params: Promise<{ slug: string }> }

export default async function EditBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return (
    <AdminPage title={`Edit · ${post.title}`} subtitle={`/blog/${post.slug}`}>
      <BlogForm initial={post} isNew={false} />
    </AdminPage>
  );
}
