import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SearchFilters } from "@/components/rooms/search-filters";
import { RoomCard } from "@/components/rooms/room-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { Building2, Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-3xl overflow-hidden bg-white shadow-lg">
          <Skeleton className="aspect-4/3" />
          <div className="p-6 space-y-3">
            <Skeleton className="h-6 w-3/4" />
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-violet-950 to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-100 h-100 bg-violet-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-indigo-500/20 rounded-full blur-[100px]" />
        </div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="container relative z-10 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Sparkles className="h-3 w-3 mr-1" />
              {total} properties available
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
                Place to Stay
              </span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl">
              Browse our curated collection of verified properties. Filter by
              location, price, and amenities to find exactly what you need.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="container -mt-8 pb-24 relative z-20">
        {/* Filters Card */}
        <Suspense
          fallback={<Skeleton className="h-24 w-full rounded-2xl shadow-lg" />}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-10 border border-gray-100">
            <SearchFilters cities={cities} />
          </div>
        </Suspense>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              {total > 0 ? (
                <>
                  {total} {total === 1 ? "property" : "properties"} found
                </>
              ) : (
                "No properties found"
              )}
            </h2>
            {params.city && params.city !== "all" && (
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                Showing results in {params.city}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none">
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
              <option>Top Rated</option>
            </select>
          </div>
        </div>

        {/* Rooms Grid */}
        <Suspense fallback={<RoomsSkeleton />}>
          {rooms.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 pointer-events-none"
                        : "bg-white text-gray-700 hover:bg-violet-50 hover:text-violet-600 border border-gray-200"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first, last, current, and pages near current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, arr) => {
                        // Add ellipsis
                        const prevPage = arr[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && (
                              <span className="px-3 py-2 text-gray-400">
                                ...
                              </span>
                            )}
                            <Link
                              href={buildPageUrl(page)}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all ${
                                page === currentPage
                                  ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                                  : "bg-white text-gray-700 hover:bg-violet-50 hover:text-violet-600 border border-gray-200"
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
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 pointer-events-none"
                        : "bg-white text-gray-700 hover:bg-violet-50 hover:text-violet-600 border border-gray-200"
                    }`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl shadow-sm">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <Building2 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No properties found
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                We couldn&apos;t find any properties matching your criteria. Try
                adjusting your filters or search for a different location.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/rooms">
                  <Button
                    variant="outline"
                    className="rounded-full px-6 border-gray-300"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="rounded-full px-6 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
                    <Search className="h-4 w-4 mr-2" />
                    Search Again
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

