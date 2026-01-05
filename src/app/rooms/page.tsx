import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SearchFilters } from "@/components/rooms/search-filters";
import { RoomCard } from "@/components/rooms/room-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { MapPin, ChevronLeft, ChevronRight, SlidersHorizontal, Search } from "lucide-react";

interface SearchParams {
  city?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  minGuests?: string;
  amenities?: string;
  page?: string;
}

async function getRooms(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;

  const where: Record<string, unknown> = {
    isActive: true,
    status: "AVAILABLE",
  };

  if (searchParams.city && searchParams.city !== "all") {
    where.city = { contains: searchParams.city, mode: "insensitive" };
  }
  if (searchParams.type && searchParams.type !== "all") {
    where.type = searchParams.type;
  }
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) {
      (where.price as Record<string, number>).gte = parseFloat(
        searchParams.minPrice
      );
    }
    if (searchParams.maxPrice) {
      (where.price as Record<string, number>).lte = parseFloat(
        searchParams.maxPrice
      );
    }
  }
  if (searchParams.minGuests) {
    where.maxGuests = { gte: parseInt(searchParams.minGuests) };
  }
  if (searchParams.amenities) {
    where.amenities = { hasEvery: searchParams.amenities.split(",") };
  }

  const [rooms, total, cities] = await Promise.all([
    prisma.room.findMany({
      where,
      include: {
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.room.count({ where }),
    prisma.room.findMany({
      where: { isActive: true, status: "AVAILABLE" },
      select: { city: true },
      distinct: ["city"],
    }),
  ]);

  return {
    rooms,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    cities: cities.map((c) => c.city),
  };
}

function RoomsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-white border border-stone-200">
          <Skeleton className="aspect-4/3" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { rooms, total, totalPages, currentPage, cities } = await getRooms(
    params
  );

  const buildPageUrl = (page: number) => {
    const urlParams = new URLSearchParams();
    urlParams.set("page", page.toString());
    if (params.city) urlParams.set("city", params.city);
    if (params.type) urlParams.set("type", params.type);
    if (params.minPrice) urlParams.set("minPrice", params.minPrice);
    if (params.maxPrice) urlParams.set("maxPrice", params.maxPrice);
    return `/rooms?${urlParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-20">
        {/* Background */}
        <div className="absolute inset-0 h-100">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920"
            alt="Explore spaces"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-stone-900/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="text-sm text-white/60 tracking-widest uppercase mb-4 block">
              {total} spaces available
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
              Explore our collection
            </h1>
            <p className="text-lg text-white/70">
              Discover verified spaces that match your style and needs.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 -mt-12 relative z-20 pb-24">
        {/* Filters Card */}
        <Suspense
          fallback={<Skeleton className="h-20 w-full rounded-xl" />}
        >
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 mb-10">
            <SearchFilters cities={cities} />
          </div>
        </Suspense>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-medium text-stone-900">
              {total > 0 ? (
                <>
                  {total} {total === 1 ? "space" : "spaces"} found
                </>
              ) : (
                "No spaces found"
              )}
            </h2>
            {params.city && params.city !== "all" && (
              <p className="text-stone-500 flex items-center gap-1.5 mt-1 text-sm">
                <MapPin className="h-4 w-4" />
                Showing results in {params.city}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">Sort by:</span>
            <select className="px-4 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none">
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {/* Rooms Grid */}
        <Suspense fallback={<RoomsSkeleton />}>
          {rooms.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-16">
                  {/* Previous */}
                  <Link
                    href={
                      currentPage > 1
                        ? buildPageUrl(currentPage - 1)
                        : buildPageUrl(1)
                    }
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? "bg-stone-100 text-stone-400 pointer-events-none"
                        : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, arr) => {
                        const prevPage = arr[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && (
                              <span className="px-3 py-2 text-stone-400">
                                ...
                              </span>
                            )}
                            <Link
                              href={buildPageUrl(page)}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                page === currentPage
                                  ? "bg-stone-900 text-white"
                                  : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                              }`}
                            >
                              {page}
                            </Link>
                          </div>
                        );
                      })}
                  </div>

                  {/* Next */}
                  <Link
                    href={
                      currentPage < totalPages
                        ? buildPageUrl(currentPage + 1)
                        : buildPageUrl(totalPages)
                    }
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? "bg-stone-100 text-stone-400 pointer-events-none"
                        : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                    }`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-6">
                <Search className="h-8 w-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-medium text-stone-900 mb-2">
                No spaces found
              </h3>
              <p className="text-stone-500 mb-8 max-w-md mx-auto">
                We couldn&apos;t find any spaces matching your criteria. Try
                adjusting your filters.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/rooms">
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Suspense>
      </section>

      <Footer />
    </div>
  );
}
