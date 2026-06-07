import AdminPage from "@/components/admin/Page";
import { getAllPosts } from "@/lib/store/blog";
import BlogTable from "@/components/admin/BlogTable";
import BlogControls from "@/components/admin/BlogControls";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();
  return (
    <AdminPage
      title="Blog"
      subtitle={`${posts.length} posts`}
    >
      <BlogControls />
      <BlogTable posts={posts} />
    </AdminPage>
  );
}
