import AdminPage from "@/components/admin/Page";
import ReviewsTable from "@/components/admin/ReviewsTable";
import { getAllReviews } from "@/lib/store/reviews";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <AdminPage
      title="Property Reviews & Ratings"
      subtitle={`${reviews.length} total tenant and client reviews. Approving a review publishes it to the property page and updates Google's aggregate rating schema.`}
    >
      <ReviewsTable />
    </AdminPage>
  );
}
