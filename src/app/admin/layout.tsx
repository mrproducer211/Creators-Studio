import { requireAdmin } from "@/lib/auth-helpers";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "NHP Admin",
  robots: "noindex,nofollow",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F7F3EC" }}>
      <AdminSidebar userName={user.name} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
