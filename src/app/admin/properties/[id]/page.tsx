import { notFound } from "next/navigation";
import AdminPage from "@/components/admin/Page";
import PropertyForm from "@/components/admin/PropertyForm";
import { getPropertyById } from "@/lib/store/properties";

interface Props { params: Promise<{ id: string }> }

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const numId  = Number(id);
  if (!Number.isFinite(numId)) notFound();

  const property = await getPropertyById(numId);
  if (!property) notFound();

  return (
    <AdminPage title={`Edit · ${property.name}`} subtitle={`ID NHP-${String(property.id).padStart(7, "0")}`}>
      <PropertyForm initial={property} isNew={false} />
    </AdminPage>
  );
}
