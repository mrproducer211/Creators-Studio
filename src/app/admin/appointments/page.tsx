import AdminPage from "@/components/admin/Page";
import AppointmentsList, { AppointmentRecord } from "@/components/admin/AppointmentsList";
import { getDbAppointments } from "@/lib/db/dbLoader";
import { getAllLocalAppointments } from "@/lib/store/appointments";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminAppointmentsPage() {
  // Guard the page to allow admin access only
  await requireAdmin();

  // Load from Postgres DB
  const dbAppointments = await getDbAppointments();

  // Load from local store file (fallback or merged view)
  const localAppointments = await getAllLocalAppointments();

  // Combine and de-duplicate (prefer database records if duplicate ids occur)
  const combined: AppointmentRecord[] = dbAppointments.map((a) => ({
    ...a,
    status: a.status as "pending" | "confirmed" | "cancelled",
  }));

  // Merge in local files that don't match numeric database IDs
  for (const item of localAppointments) {
    if (!combined.some((a) => String(a.id) === String(item.id))) {
      combined.push({
        id: item.id,
        propertyId: item.propertyId || null,
        name: item.name,
        email: item.email,
        phone: item.phone,
        date: item.date,
        timeSlot: item.timeSlot,
        status: item.status,
        message: item.message || null,
        createdAt: new Date(item.createdAt),
        propertyName: item.propertyName || null,
        propertySlug: item.propertySlug || null,
      });
    }
  }

  // Sort by date descending
  combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AdminPage
      title="Scheduled Bookings"
      subtitle="View, confirm, and manage user scheduled property tour appointments."
    >
      <AppointmentsList initialAppointments={combined} />
    </AdminPage>
  );
}
