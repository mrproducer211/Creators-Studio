import AdminPage from "@/components/admin/Page";
import { getAllEnquiries } from "@/lib/store/enquiries";
import EnquiriesList from "@/components/admin/EnquiriesList";

export default async function AdminEnquiriesPage() {
  const enquiries = await getAllEnquiries();
  const newCount  = enquiries.filter((e) => e.status === "new").length;

  return (
    <AdminPage title="Enquiries" subtitle={`${enquiries.length} total · ${newCount} unread`}>
      <EnquiriesList enquiries={enquiries} />
    </AdminPage>
  );
}
