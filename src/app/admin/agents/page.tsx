import AdminPage from "@/components/admin/Page";
import { getAllAgents } from "@/lib/store/leads";
import AgentsTable from "@/components/admin/AgentsTable";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminAgentsPage() {
  // Guard the page to allow admin access only
  await requireAdmin();

  const agents = await getAllAgents();

  return (
    <AdminPage title="Agent Verification" subtitle={`${agents.length} total registered agent partners`}>
      <AgentsTable initialAgents={agents} />
    </AdminPage>
  );
}
