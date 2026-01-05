import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSearch } from "@/components/home/hero-search";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import {
  ArrowRight,
  Star,
  Shield,
  Clock,
  MapPin,
  Users,
  Bed,
  Bath,
} from "lucide-react";

interface FeaturedRoom {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  images: string[];
  featured: boolean;
  reviews: { rating: number }[];
}

async function getFeaturedRooms(): Promise<FeaturedRoom[]> {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        status: "AVAILABLE",
        isActive: true,
      },
      take: 6,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });
    return rooms;
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [roomCount, userCount, bookingCount] = await Promise.all([
      prisma.room.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
    ]);
    return { roomCount, userCount, bookingCount };
  } catch {
    return { roomCount: 0, userCount: 0, bookingCount: 0 };
  }
}

async function getCities(): Promise<string[]> {
  try {
    const cities = await prisma.room.findMany({
      where: { isActive: true, status: "AVAILABLE" },
      select: { city: true },
      distinct: ["city"],
    });
    return cities.map((c) => c.city);
  } catch {
    return [];
  }
}

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Remote Worker",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    content:
      "The attention to detail in every listing gave me confidence to book. Found my perfect workspace apartment within days.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Photographer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    content:
      "Clean interface, verified properties, and seamless booking. Exactly what I needed for my location shoots.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Property Owner",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    content:
      "As a host, the platform made managing my properties effortless. Professional presentation that attracts quality guests.",
    rating: 5,
  },
];

export default async function HomePage() {
  const [featuredRooms, stats, cities] = await Promise.all([
    getFeaturedRooms(),
    getStats(),
    getCities(),
  ]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-dvh flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920"
            alt="Luxury interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-stone-950/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full pt-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Text */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-white/80">{stats.roomCount}+ spaces available now</span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white leading-[1.05] tracking-tight">
                  Find where
                  <span className="block text-white/60">you belong</span>
                </h1>

                <p className="mt-8 text-lg text-white/50 max-w-md leading-relaxed">
                  Discover curated spaces from verified hosts. From cozy studios to luxury apartments — your next chapter starts here.
                </p>

                {/* Search Box */}
                <HeroSearch cities={cities} />

                {/* Trust Indicators */}
                <div className="mt-10 flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-white/40" />
                    <span className="text-sm text-white/50">Verified hosts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-white/40" />
                    <span className="text-sm text-white/50">Instant booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-white/40" />
                    <span className="text-sm text-white/50">Quality assured</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Visual Stack */}
              <div className="hidden lg:block">
                <div className="relative">
                  {/* Feature card */}
                  <div className="absolute -top-10 -left-4 w-72 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-2xl p-6">
                    <div className="text-xs uppercase tracking-wide text-white/70 mb-2">Featured stay</div>
                    <div className="text-2xl font-serif text-white leading-snug mb-3">Sunset Loft, NYC</div>
                    <div className="flex items-center gap-3 text-sm text-white/70 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>Manhattan</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Up to 4</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-serif text-white">$240</div>
                        <div className="text-xs text-white/60">per night</div>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm text-white">4.9</span>
                      </div>
                    </div>
                  </div>

                  {/* Community card */}
                  <div className="absolute top-28 right-0 bg-white rounded-2xl p-6 shadow-2xl w-64">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-stone-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-serif text-stone-900">{stats.userCount}+</div>
                        <div className="text-xs text-stone-500">Active members</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-stone-500">
                      <span>Happy stays</span>
                      <span className="text-stone-900 font-semibold">{stats.bookingCount}+</span>
                    </div>
                  </div>

                  {/* Rating badge */}
                  <div className="absolute bottom-0 left-8 bg-emerald-500 rounded-2xl p-5 shadow-2xl text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Star className="h-5 w-5 fill-white text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-medium">4.9 Rating</div>
                        <div className="text-sm text-white/80">Guest satisfaction</div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Background */}
                  <div className="w-80 h-80 rounded-full border border-white/10 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-xl mb-16">
            <span className="text-sm text-stone-500 tracking-widest uppercase">Why RentSpace</span>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mt-4">
              A thoughtful approach to finding your space
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Shield,
                title: "Verified Properties",
                description:
                  "Every listing is personally reviewed. Accurate photos, honest descriptions, and reliable hosts.",
              },
              {
                icon: Clock,
                title: "Instant Booking",
                description:
                  "No waiting for approvals. Book your perfect space in seconds with instant confirmation.",
              },
              {
                icon: Star,
                title: "Quality Assured",
                description:
                  "Our rigorous standards ensure exceptional stays. If something's not right, we make it right.",
              },
            ].map((feature) => (
              <div key={feature.title} className="group">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-6 group-hover:bg-stone-900 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-stone-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-medium text-stone-900 mb-3">{feature.title}</h3>
                <p className="text-stone-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-24 md:py-32 bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-sm text-stone-500 tracking-widest uppercase">Featured</span>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mt-4">
                Handpicked properties
              </h2>
            </div>
            <Link href="/rooms">
              <Button variant="outline" className="gap-2 border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all">
                View all spaces
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Rooms Grid */}
          {featuredRooms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRooms.map((room: FeaturedRoom) => {
                const avgRating =
                  room.reviews.length > 0
                    ? room.reviews.reduce((acc, r) => acc + r.rating, 0) / room.reviews.length
                    : 0;

                return (
                  <Link key={room.id} href={`/rooms/${room.id}`} className="group">
                    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                      {/* Image */}
                      <div className="relative aspect-4/3 overflow-hidden">
                        <Image
                          src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
                          alt={room.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {avgRating > 0 && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-1.5 text-stone-500 text-sm mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{room.city}, {room.state}</span>
                        </div>
                        <h3 className="text-lg font-medium text-stone-900 mb-4 line-clamp-1 group-hover:text-stone-600 transition-colors">
                          {room.title}
                        </h3>
                        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                          <div className="flex items-center gap-4 text-sm text-stone-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {room.maxGuests}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              {room.bedrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="h-4 w-4" />
                              {room.bathrooms}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-medium text-stone-900">${room.price}</span>
                            <span className="text-sm text-stone-500">/night</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl">
              <p className="text-stone-500">No featured rooms available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 md:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Image */}
            <div className="relative aspect-4/5 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
                alt="Modern interior"
                fill
                className="object-cover"
              />
            </div>

            {/* Right - Content */}
            <div>
              <span className="text-sm text-stone-500 tracking-widest uppercase">How it works</span>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mt-4 mb-12">
                Three simple steps to your perfect stay
              </h2>

              <div className="space-y-10">
                {[
                  {
                    step: "01",
                    title: "Search & Discover",
                    description: "Browse our curated collection. Filter by location, amenities, and style to find your match.",
                  },
                  {
                    step: "02",
                    title: "Review & Compare",
                    description: "Read verified reviews, explore detailed photos, and compare options at your own pace.",
                  },
                  {
                    step: "03",
                    title: "Book & Enjoy",
                    description: "Secure your space with instant booking. Enjoy seamless check-in and exceptional stays.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6">
                    <span className="text-4xl font-serif text-stone-200">{item.step}</span>
                    <div>
                      <h3 className="text-xl font-medium text-stone-900 mb-2">{item.title}</h3>
                      <p className="text-stone-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-stone-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-sm text-stone-400 tracking-widest uppercase">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mt-4">
              What our guests say
            </h2>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50"
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-300 leading-relaxed mb-8">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-white">{testimonial.name}</div>
                    <div className="text-sm text-stone-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-6">
              Ready to find your space?
            </h2>
            <p className="text-lg text-stone-500 mb-10">
              Join thousands of travelers who have found their perfect stay through RentSpace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/rooms">
                <Button size="lg" className="h-14 px-8 bg-stone-900 hover:bg-stone-800 text-white font-medium">
                  Start Exploring
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/register?role=LANDLORD">
                <Button size="lg" variant="outline" className="h-14 px-8 border-stone-300 hover:bg-stone-100 font-medium">
                  Become a Host
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

