import { MainLayout } from "@/components/layout/main-layout";
import { ListingDetailClient } from "@/components/listings/listing-detail-client";
import { RelatedListings } from "@/components/listings/related-listings";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <MainLayout>
      <ListingDetailClient id={id} />
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <RelatedListings listingId={id} />
      </div>
    </MainLayout>
  );
}
