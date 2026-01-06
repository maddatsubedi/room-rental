import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  Calendar,
  Check,
  Phone,
  Mail,
  ArrowLeft,
  Ruler,
} from "lucide-react";
import { BookingForm } from "@/components/rooms/booking-form";

async function getRoom(id: string) {
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          createdAt: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          bookings: true,
          reviews: true,
        },
      },
    },
  });

  return room;
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [room, session] = await Promise.all([getRoom(id), auth()]);

  if (!room) {
    notFound();
  }

  const avgRating = room.reviews.length > 0
    ? room.reviews.reduce((acc, r) => acc + r.rating, 0) / room.reviews.length
    : 0;

  const images = room.images.length > 0 
    ? room.images 
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"];

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      {/* Back Button */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-4">
        <Link href="/rooms">
          <Button variant="ghost" className="gap-2 text-stone-600 hover:text-stone-900 -ml-4">
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </Button>
        </Link>
      </div>

      {/* Images Gallery */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl overflow-hidden">
          <div className="relative aspect-4/3 md:aspect-auto md:row-span-2">
            <Image
              src={images[0]}
              alt={room.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {images.slice(1, 3).map((image, index) => (
            <div key={index} className="relative aspect-4/3 hidden md:block">
              <Image
                src={image}
                alt={`${room.title} ${index + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-sm font-medium">
                  {room.type.replace("_", " ")}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  room.status === "AVAILABLE" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-stone-100 text-stone-600"
                }`}>
                  {room.status}
                </span>
              </div>
              <h1 className="text-3xl font-serif text-stone-900 mb-3">{room.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-stone-600 text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{room.address}, {room.city}, {room.state} {room.zipCode}</span>
                </div>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-stone-900">{avgRating.toFixed(1)}</span>
                    <span className="text-stone-500">({room._count.reviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, label: "Guests", value: room.maxGuests },
                { icon: Bed, label: "Bedrooms", value: room.bedrooms },
                { icon: Bath, label: "Bathrooms", value: room.bathrooms },
                { icon: Ruler, label: "Size", value: `${room.size} m²` },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">{stat.label}</p>
                      <p className="font-medium text-stone-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-medium text-stone-900 mb-4">About this space</h2>
              <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{room.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-lg font-medium text-stone-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-stone-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Info */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-lg font-medium text-stone-900 mb-4">Your host</h2>
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={room.landlord.image || ""} />
                  <AvatarFallback className="bg-stone-900 text-white text-lg">
                    {getInitials(room.landlord.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-stone-900">{room.landlord.name}</h3>
                  <p className="text-sm text-stone-500">
                    Joined {formatDate(room.landlord.createdAt)}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    {room.landlord.email && (
                      <a
                        href={`mailto:${room.landlord.email}`}
                        className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
                      >
                        <Mail className="h-4 w-4" />
                        Contact
                      </a>
                    )}
                    {room.landlord.phone && (
                      <span className="flex items-center gap-1.5 text-sm text-stone-600">
                        <Phone className="h-4 w-4" />
                        {room.landlord.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-stone-900">
                  Reviews ({room._count.reviews})
                </h2>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-stone-900">{avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {room.reviews.length > 0 ? (
                <div className="space-y-6">
                  {room.reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-stone-200 last:border-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.user.image || ""} />
                          <AvatarFallback className="bg-stone-100 text-stone-600 text-sm">
                            {getInitials(review.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-stone-900">{review.user.name}</h4>
                            <span className="text-sm text-stone-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 mt-1 mb-2">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-stone-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-stone-600 text-sm">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 text-center py-8">
                  No reviews yet
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-stone-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-2xl font-serif text-stone-900">{formatCurrency(room.price)}</span>
                    <span className="text-stone-500">/month</span>
                  </div>

                  {room.status === "AVAILABLE" ? (
                    session?.user ? (
                      <BookingForm
                        roomId={room.id}
                        price={room.price}
                        maxGuests={room.maxGuests}
                      />
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-stone-500 text-center">
                          Sign in to book this space
                        </p>
                        <Link href={`/auth/login?callbackUrl=/rooms/${room.id}`}>
                          <Button className="w-full bg-stone-900 hover:bg-stone-800">
                            Sign in to Book
                          </Button>
                        </Link>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-stone-500">This space is currently not available</p>
                    </div>
                  )}

                  <Separator className="my-6" />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-stone-600">
                      <Calendar className="h-4 w-4" />
                      <span>Flexible move-in dates</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Instant confirmation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
