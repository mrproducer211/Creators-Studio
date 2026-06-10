import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SavedPageClient from "@/components/saved/SavedPageClient";
import { getAllProperties } from "@/lib/store/properties";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Saved Properties — NHP Bangkok",
  description: "Your saved Bangkok properties.",
};

export default async function SavedPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=%2Fsaved");
  }

  const properties = await getAllProperties();
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "56px", minHeight: "100vh", background: "#F7F3EC" }}>
        <SavedPageClient allProperties={properties} />
      </main>
      <Footer />
    </>
  );
}
