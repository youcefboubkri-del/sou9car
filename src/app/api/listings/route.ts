import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const brand = searchParams.get("brand");
    const model = searchParams.get("model");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minYear = searchParams.get("minYear");
    const maxYear = searchParams.get("maxYear");
    const fuelType = searchParams.get("fuelType");
    const transmission = searchParams.get("transmission");
    const bodyType = searchParams.get("bodyType");
    const city = searchParams.get("city");
    const minMileage = searchParams.get("minMileage");
    const maxMileage = searchParams.get("maxMileage");
    const sort = searchParams.get("sort") || "newest";
    const searchQuery = searchParams.get("q");
    const sellerId = searchParams.get("sellerId");

    // Show ACTIVE + SOLD so sold listings are visible (social proof for new visitors)
    const where: Prisma.ListingWhereInput = sellerId
      ? { sellerId }
      : { status: { in: ["ACTIVE", "SOLD"] } };

    if (brand) where.brand = brand;
    if (model) where.model = { contains: model };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (minYear || maxYear) {
      where.year = {};
      if (minYear) where.year.gte = parseInt(minYear);
      if (maxYear) where.year.lte = parseInt(maxYear);
    }
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    if (bodyType) where.bodyType = bodyType;
    if (city) where.city = city;
    if (minMileage || maxMileage) {
      where.mileage = {};
      if (minMileage) where.mileage.gte = parseInt(minMileage);
      if (maxMileage) where.mileage.lte = parseInt(maxMileage);
    }
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } },
        { brand: { contains: searchQuery } },
        { model: { contains: searchQuery } },
      ];
    }

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      sort === "price_asc" ? { price: "asc" } :
      sort === "price_desc" ? { price: "desc" } :
      sort === "year_desc" ? { year: "desc" } :
      sort === "year_asc" ? { year: "asc" } :
      sort === "mileage_asc" ? { mileage: "asc" } :
      sort === "mileage_desc" ? { mileage: "desc" } :
      { createdAt: "desc" };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          seller: { select: { id: true, name: true, city: true, avatarUrl: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings: listings.map((l) => ({
        ...l,
        thumbnail: l.images[0]?.url || null,
        images: undefined,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Listings fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = await req.json();
    const listing = await prisma.listing.create({
      data: {
        sellerId: session.userId,
        title: data.title,
        description: data.description,
        brand: data.brand,
        model: data.model,
        year: parseInt(data.year),
        mileage: parseInt(data.mileage),
        price: parseFloat(data.price),
        fuelType: data.fuelType,
        transmission: data.transmission,
        bodyType: data.bodyType,
        color: data.color,
        engineSize: data.engineSize,
        power: data.power,
        doors: data.doors ? parseInt(data.doors) : null,
        seats: data.seats ? parseInt(data.seats) : null,
        city: data.city,
        isVintage: data.isVintage || false,
        isImport: data.isImport || false,
        isDamaged: data.isDamaged || false,
        hasWarranty: data.hasWarranty || false,
        creditEnabled: data.creditEnabled || false,
        creditDownPayment: data.creditDownPayment ? parseInt(data.creditDownPayment) : null,
        creditMonths: data.creditMonths ? parseInt(data.creditMonths) : null,
        creditInterestRate: data.creditInterestRate ? parseFloat(data.creditInterestRate) : 0,
      },
    });

    if (data.images?.length) {
      await prisma.listingImage.createMany({
        data: data.images.map((url: string, index: number) => ({
          listingId: listing.id,
          url,
          order: index,
        })),
      });
    }

    if (data.vinNumber) {
      await prisma.vehicleHistory.create({
        data: {
          listingId: listing.id,
          vinNumber: data.vinNumber,
          registrationNumber: data.registrationNumber,
          previousOwners: data.previousOwners ? parseInt(data.previousOwners) : null,
          importedFrom: data.importedFrom,
          customsCleared: data.customsCleared || false,
          mileageVerified: false,
        },
      });
    }

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Listing create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
