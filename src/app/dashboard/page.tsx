import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getAllProperties } from "@/lib/store/properties";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Dashboard — NHP Bangkok",
  description: "Access your personalized Bangkok property dashboard. Manage saved condos, plan daily commutes, track viewing appointments, and collaborate on shortlists.",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=%2Fdashboard");
  }

  const properties = await getAllProperties();
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "56px", minHeight: "100vh", background: "#F7F3EC" }}>
        <DashboardClient allProperties={properties} session={session} />
      </main>
      <Footer />
    </>
  );
}
