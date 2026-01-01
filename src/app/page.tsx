import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import {
  Search,
  MapPin,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Building2,
  Users,
  Home,
  Sparkles,
  CheckCircle2,
  Zap,
  Heart,
  Quote,
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

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Digital Nomad",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    content:
      "RentSpace made finding my perfect apartment so easy! The verified listings gave me peace of mind, and the booking process was seamless.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Business Traveler",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    content:
      "As someone who travels frequently for work, RentSpace has become my go-to platform. Great properties and excellent customer service.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Property Owner",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    content:
      "Listing my properties on RentSpace increased my bookings by 40%. The platform is intuitive and the support team is fantastic.",
    rating: 5,
  },
];

export default async function HomePage() {
  const [featuredRooms, stats] = await Promise.all([
    getFeaturedRooms(),
    getStats(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Modern Glassmorphism Design */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-violet-950 to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-125 h-125 bg-violet-500/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-150 h-150 bg-indigo-500/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-purple-500/10 rounded-full blur-[150px]" />
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-white/90">
                  {stats.bookingCount}+ successful stays this month
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
                Find Your
                <span className="block mt-2 bg-linear-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                  Perfect Space
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover curated rooms and apartments with verified hosts. Book
                instantly and experience hassle-free stays anywhere.
              </p>

              {/* Search Box - Glass Effect */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl max-w-xl mx-auto lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10">
                    <MapPin className="h-5 w-5 text-violet-400" />
                    <input
                      type="text"
                      placeholder="Where do you want to stay?"
                      className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50 text-sm"
                    />
                  </div>
                  <Link href="/rooms">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto px-8 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 shadow-lg shadow-violet-500/25"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-10">
                <div className="flex items-center gap-2 text-white/70">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-sm">Verified Listings</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <span className="text-sm">Secure Payments</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm">Instant Booking</span>
                </div>
              </div>
            </div>

            {/* Right Content - Stats Cards */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main Image Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
                    alt="Modern apartment"
                    width={600}
                    height={400}
                    className="w-full h-100 object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                  {/* Floating Stats */}
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between">
                    <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30">
                      <div className="text-3xl font-bold text-white">
                        {stats.roomCount}+
                      </div>
                      <div className="text-sm text-white/80">
                        Properties Listed
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30">
                      <div className="text-3xl font-bold text-white">
                        {stats.userCount}+
                      </div>
                      <div className="text-sm text-white/80">Happy Guests</div>
                    </div>
                  </div>
                </div>

                {/* Floating Card 1 */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-medium">
                        JD
                      </div>
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                        MK
                      </div>
                      <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-medium">
                        +9
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">New bookings</div>
                      <div className="text-xs text-gray-500">Just now</div>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce-slow" style={{ animationDelay: "0.5s" }}>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">4.9/5 Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-400">
            <span className="text-sm font-medium uppercase tracking-wider">
              Trusted by teams at
            </span>
            <div className="flex flex-wrap justify-center gap-12 items-center">
              {["Airbnb", "Booking", "Expedia", "TripAdvisor", "Kayak"].map(
                (brand) => (
                  <span
                    key={brand}
                    className="text-xl font-bold text-gray-300 hover:text-gray-400 transition-colors"
                  >
                    {brand}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid Style */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-100">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Smarter Way to
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-600">
                Find Your Stay
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We&apos;ve built the most comprehensive platform to help you find,
              compare, and book the perfect accommodation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 - Large */}
            <div className="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-600 to-indigo-600 p-8 md:p-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  100% Verified Properties
                </h3>
                <p className="text-white/80 text-lg max-w-lg mb-6">
                  Every listing is personally verified by our team. We ensure
                  accurate photos, honest descriptions, and reliable hosts.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["ID Verified", "Photos Checked", "Reviews Moderated"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 rounded-full bg-white/20 text-white text-sm"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-3xl bg-gray-50 p-8 hover:bg-gray-100 transition-colors">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
              <p className="text-gray-600 leading-relaxed">
                Book your perfect space in seconds. No waiting for approvals,
                just instant confirmation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-3xl bg-gray-50 p-8 hover:bg-gray-100 transition-colors">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 mb-6 group-hover:scale-110 transition-transform">
                <Star className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Best Price Guarantee</h3>
              <p className="text-gray-600 leading-relaxed">
                Find a lower price elsewhere? We&apos;ll match it. Direct booking
                means better deals.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative overflow-hidden rounded-3xl bg-gray-50 p-8 hover:bg-gray-100 transition-colors">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-100 mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-7 w-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Our dedicated team is always here to help. Any issue, any time,
                we&apos;ve got you covered.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group relative overflow-hidden rounded-3xl bg-gray-50 p-8 hover:bg-gray-100 transition-colors">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Cancellation</h3>
              <p className="text-gray-600 leading-relaxed">
                Plans change. Most bookings can be cancelled free up to 24 hours
                before check-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-24 bg-gray-50">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-100">
                Featured Properties
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Handpicked Stays
              </h2>
            </div>
            <Link href="/rooms">
              <Button
                variant="outline"
                className="gap-2 rounded-full px-6 border-gray-300 hover:border-violet-600 hover:text-violet-600"
              >
                View All Properties <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {featuredRooms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRooms.map((room: FeaturedRoom) => {
                const avgRating =
                  room.reviews.length > 0
                    ? room.reviews.reduce(
                        (acc: number, r: { rating: number }) => acc + r.rating,
                        0
                      ) / room.reviews.length
                    : 0;

                return (
                  <Link key={room.id} href={`/rooms/${room.id}`}>
                    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl">
                      <div className="relative aspect-4/3 overflow-hidden">
                        <Image
                          src={
                            room.images[0] ||
                            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
                          }
                          alt={room.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                        {room.featured && (
                          <Badge className="absolute top-4 left-4 bg-linear-to-r from-amber-500 to-orange-500 border-0 shadow-lg">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}

                        <button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all shadow-lg">
                          <Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
                        </button>

                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-end justify-between">
                            <div>
                              <span className="text-3xl font-bold text-white">
                                ${room.price}
                              </span>
                              <span className="text-white/80 text-sm">
                                /night
                              </span>
                            </div>
                            {avgRating > 0 && (
                              <div className="flex items-center gap-1 bg-white/95 px-3 py-1.5 rounded-full shadow-lg">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-semibold">
                                  {avgRating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="font-bold text-xl mb-2 group-hover:text-violet-600 transition-colors line-clamp-1">
                          {room.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                          <MapPin className="h-4 w-4 text-violet-500" />
                          <span>
                            {room.city}, {room.state}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{room.maxGuests} guests</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bed className="h-4 w-4 text-gray-400" />
                            <span>{room.bedrooms} bed</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bath className="h-4 w-4 text-gray-400" />
                            <span>{room.bathrooms} bath</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                No featured rooms available at the moment
              </p>
              <Link
                href="/auth/register?role=LANDLORD"
                className="mt-6 inline-block"
              >
                <Button variant="outline" className="rounded-full px-6">
                  List Your Property
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-violet-100 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="container relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-100">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Book in 3 Simple Steps
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Finding and booking your perfect stay has never been easier
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                icon: Search,
                title: "Search & Discover",
                description:
                  "Browse our curated collection of verified properties. Use filters to find exactly what you need.",
              },
              {
                step: "02",
                icon: Home,
                title: "Choose & Compare",
                description:
                  "Compare amenities, read reviews, and check availability. Find the perfect match for your stay.",
              },
              {
                step: "03",
                icon: CheckCircle2,
                title: "Book & Enjoy",
                description:
                  "Secure your booking instantly with our safe payment system. Pack your bags and enjoy!",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-linear-to-r from-violet-200 to-transparent" />
                )}
                <div className="relative text-center group">
                  <div className="relative inline-block mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-violet-500 to-indigo-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="h-10 w-10 text-white" />
                    </div>
                    <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-sm font-bold text-violet-600 border-2 border-violet-200">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-100">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Thousands
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              See what our community has to say about their experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-8">
                  <Quote className="h-10 w-10 text-violet-200 mb-4" />
                  <p className="text-gray-600 leading-relaxed mb-6">
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
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">
                        {testimonial.role}
                      </div>
                    </div>
                    <div className="ml-auto flex">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Card Style */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container">
          <div className="relative rounded-[2.5rem] overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600"
                alt="Beautiful home"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-slate-900/95 via-slate-900/85 to-slate-900/70" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 lg:px-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-white/90">Start your journey today</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                    Your Perfect Space is
                    <span className="block mt-1 text-transparent bg-clip-text bg-linear-to-r from-violet-400 via-fuchsia-400 to-amber-400">
                      Just a Click Away
                    </span>
                  </h2>
                  
                  <p className="text-lg text-white/70 mb-8 max-w-lg">
                    Whether you&apos;re looking for a cozy room or want to list your property, 
                    we make it simple, secure, and seamless.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/rooms">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto px-8 bg-white text-slate-900 hover:bg-gray-100 rounded-full h-14 text-base font-semibold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                      >
                        <Search className="h-5 w-5 mr-2" />
                        Find a Room
                      </Button>
                    </Link>
                    <Link href="/auth/register?role=LANDLORD">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto px-8 border-white/30 text-white hover:bg-white/10 rounded-full h-14 text-base font-semibold backdrop-blur-sm"
                      >
                        <Building2 className="h-5 w-5 mr-2" />
                        Become a Host
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="hidden lg:grid grid-cols-2 gap-4">
                  {[
                    { value: "10K+", label: "Happy Guests", icon: Users },
                    { value: "5K+", label: "Properties", icon: Building2 },
                    { value: "4.9", label: "Avg Rating", icon: Star },
                    { value: "24/7", label: "Support", icon: Shield },
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors"
                    >
                      <stat.icon className="h-8 w-8 text-violet-400 mb-3" />
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-white/60">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

