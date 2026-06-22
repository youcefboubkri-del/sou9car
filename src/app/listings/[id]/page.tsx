import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { ListingDetailClient } from "@/components/listings/listing-detail-client";
import { RelatedListings } from "@/components/listings/related-listings";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://sou9car.ma";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    });
    if (!listing) return {};

    const price = listing.price.toLocaleString("fr-MA");
    const title = `${listing.brand} ${listing.model} ${listing.year} — ${price} DH | Sou9Car`;
    const description = `${listing.brand} ${listing.model} ${listing.year}, ${listing.mileage.toLocaleString()} km, ${listing.fuelType === "DIESEL" ? "Diesel" : listing.fuelType === "GASOLINE" ? "Essence" : listing.fuelType}, ${listing.city}. À vendre pour ${price} DH sur Sou9Car — marketplace automobile au Maroc.`;
    const image = listing.images[0]?.url ?? `${BASE_URL}/og-image.png`;

    return {
      title,
      description,
      keywords: `${listing.brand} ${listing.model} ${listing.year} occasion ${listing.city}, voiture occasion maroc, ${listing.brand.toLowerCase()} ${listing.model.toLowerCase()} maroc`,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/listings/${id}`,
        siteName: "Sou9Car",
        images: [{ url: image, width: 1200, height: 630, alt: `${listing.brand} ${listing.model} ${listing.year}` }],
        type: "website",
        locale: "fr_MA",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
      alternates: { canonical: `${BASE_URL}/listings/${id}` },
    };
  } catch {
    return {};
  }
}

async function getListingJsonLd(id: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    });
    if (!listing) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Car",
      name: `${listing.brand} ${listing.model} ${listing.year}`,
      brand: { "@type": "Brand", name: listing.brand },
      model: listing.model,
      modelDate: listing.year.toString(),
      mileageFromOdometer: { "@type": "QuantitativeValue", value: listing.mileage, unitCode: "KMT" },
      fuelType: listing.fuelType === "DIESEL" ? "Diesel" : listing.fuelType === "GASOLINE" ? "Essence" : listing.fuelType,
      vehicleTransmission: listing.transmission === "AUTOMATIC" ? "Automatique" : "Manuelle",
      bodyType: listing.bodyType,
      color: listing.color ?? undefined,
      numberOfDoors: listing.doors ?? undefined,
      seatingCapacity: listing.seats ?? undefined,
      offers: {
        "@type": "Offer",
        priceCurrency: "MAD",
        price: listing.price,
        availability: "https://schema.org/InStock",
        url: `${BASE_URL}/listings/${id}`,
        seller: { "@type": "Organization", name: "Sou9Car", url: BASE_URL },
      },
      image: listing.images.map((img) => img.url),
      description: listing.description,
      url: `${BASE_URL}/listings/${id}`,
    };
  } catch {
    return null;
  }
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jsonLd = await getListingJsonLd(id);

  return (
    <MainLayout>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ListingDetailClient id={id} />
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <RelatedListings listingId={id} />
      </div>
    </MainLayout>
  );
}
