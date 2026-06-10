import { redirect } from "next/navigation";

export default function SavedPage() {
  redirect("/dashboard?tab=saved");
}

