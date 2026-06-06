import AdminPage, { PrimaryLink } from "@/components/admin/Page";
import { getDbProperties } from "@/lib/db/dbLoader";
import PropertiesTable from "@/components/admin/PropertiesTable";

export default async function AdminPropertiesPage() {
  const properties = await getDbProperties();

  return (
    <AdminPage
      title="Properties"
      subtitle={`${properties.length} listings`}
      action={<PrimaryLink href="/admin/properties/new">+ New Property</PrimaryLink>}
    >
      <PropertiesTable properties={properties} />
    </AdminPage>
  );
}
