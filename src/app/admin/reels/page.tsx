import AdminPage from "@/components/admin/Page";
import ReelsManager from "@/components/admin/ReelsManager";
import { getDbProperties } from "@/lib/db/dbLoader";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminReelsPage() {
  // Guard the page to allow admin access only
  await requireAdmin();

  // Fetch properties from database or fallback mock properties
  const properties = await getDbProperties();

  return (
    <AdminPage
      title="Reels Manager"
      subtitle="Manage property video tours and configure video reels display settings."
    >
      <ReelsManager initialProperties={properties} />
    </AdminPage>
  );
}
