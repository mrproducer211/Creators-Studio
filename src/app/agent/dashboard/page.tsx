import { requireAgent } from "@/lib/auth-helpers";
import { findLeadByEmail } from "@/lib/store/leads";
import { getAllProperties } from "@/lib/store/properties";
import AgentDashboardClient from "@/components/agent/AgentDashboardClient";

export default async function AgentDashboardPage() {
  // Guard the page to allow agent access only
  const sessionUser = await requireAgent();

  // Load the live agent status from leads JSON store
  const agent = await findLeadByEmail(sessionUser.email);
  if (!agent) {
    throw new Error("Agent account not found in database.");
  }

  // Fetch all properties and filter those uploaded by this agent
  const allProperties = await getAllProperties();
  const agentProperties = allProperties.filter(
    (p) => (p as any).agentEmail?.toLowerCase() === sessionUser.email.toLowerCase()
  );

  return (
    <AgentDashboardClient
      agent={{
        id: agent.id,
        name: agent.name,
        email: agent.email,
        agentStatus: agent.agentStatus,
        createdAt: agent.createdAt,
      }}
      initialProperties={agentProperties}
    />
  );
}
