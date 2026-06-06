import AdminPage, { PrimaryLink } from "@/components/admin/Page";
import { getAllPosts } from "@/lib/store/blog";
import BlogTable from "@/components/admin/BlogTable";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();
  return (
    <AdminPage
      title="Blog"
      subtitle={`${posts.length} posts`}
      action={<PrimaryLink href="/admin/blog/new">+ New Post</PrimaryLink>}
    >
      <BlogTable posts={posts} />
    </AdminPage>
  );
}
