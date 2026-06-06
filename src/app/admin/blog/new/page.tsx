import AdminPage from "@/components/admin/Page";
import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPostPage() {
  return (
    <AdminPage title="New Blog Post" subtitle="Add a new article to the local guides section.">
      <BlogForm isNew />
    </AdminPage>
  );
}
