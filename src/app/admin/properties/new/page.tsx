import AdminPage from "@/components/admin/Page";
import PropertyForm from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  return (
    <AdminPage title="New Property" subtitle="Add a new listing to the platform.">
      <PropertyForm isNew />
    </AdminPage>
  );
}
