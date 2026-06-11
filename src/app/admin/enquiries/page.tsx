import AdminPage from "@/components/admin/Page";
import { getDbEnquiries } from "@/lib/db/dbLoader";
import { getAllLeads } from "@/lib/store/leads";
import EnquiriesList from "@/components/admin/EnquiriesList";

export default async function AdminEnquiriesPage() {
  const enquiries = await getDbEnquiries();
  const leads = await getAllLeads();
  const newCount  = enquiries.filter((e) => e.status === "new").length;

  return (
    <AdminPage title="Enquiries" subtitle={`${enquiries.length} total · ${newCount} unread`}>
      <EnquiriesList enquiries={enquiries as any} leads={leads} />
    </AdminPage>
  );
}
