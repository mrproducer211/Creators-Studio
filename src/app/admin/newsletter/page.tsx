import AdminPage from "@/components/admin/Page";
import { getSubscribers } from "@/lib/store/newsletter";
import NewsletterTable from "@/components/admin/NewsletterTable";

export default async function AdminNewsletterPage() {
  const subscribers = await getSubscribers();

  return (
    <AdminPage
      title="Newsletter Subscribers"
      subtitle={`${subscribers.length} total subscribers subscribed to Bangkok lifestyle & property guides`}
    >
      <NewsletterTable initialSubscribers={subscribers} />
    </AdminPage>
  );
}
