import AdminPage from "@/components/admin/Page";
import { getAllLeads } from "@/lib/store/leads";
import LeadsTable from "@/components/admin/LeadsTable";

export default async function AdminLeadsPage() {
  const leads = await getAllLeads();

  return (
    <AdminPage title="Leads" subtitle={`${leads.length} total registered users`}>
      <LeadsTable initialLeads={leads} />
    </AdminPage>
  );
}
