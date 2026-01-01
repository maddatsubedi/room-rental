import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Share2,
  Heart,
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Back Button & Actions */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <Link href="/rooms">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Rooms
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      <section className="container pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl overflow-hidden">
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
      <section className="container pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">{room.type.replace("_", " ")}</Badge>
                {room.featured && (
                  <Badge className="bg-linear-to-r from-amber-500 to-orange-500 border-0">
                    Featured
                  </Badge>
                )}
                <Badge variant={room.status === "AVAILABLE" ? "default" : "secondary"}>
                  {room.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{room.address}, {room.city}, {room.state} {room.zipCode}</span>
                </div>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-400">({room._count.reviews} reviews)</span>
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
                <Card key={stat.label} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                      <stat.icon className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="font-semibold">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Description */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>About this room</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">{room.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-gray-600">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Host Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Meet your host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={room.landlord.image || ""} />
                    <AvatarFallback className="bg-linear-to-br from-violet-600 to-indigo-600 text-white text-xl">
                      {getInitials(room.landlord.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{room.landlord.name}</h3>
                    <p className="text-sm text-gray-500">
                      Joined {formatDate(room.landlord.createdAt)}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      {room.landlord.email && (
                        <a
                          href={`mailto:${room.landlord.email}`}
                          className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
                        >
                          <Mail className="h-4 w-4" />
                          Contact
                        </a>
                      )}
                      {room.landlord.phone && (
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          {room.landlord.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Reviews ({room._count.reviews})</CardTitle>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-lg">{avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {room.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {room.reviews.map((review) => (
                      <div key={review.id}>
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.user.image || ""} />
                            <AvatarFallback className="bg-gray-100 text-sm">
                              {getInitials(review.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{review.user.name}</h4>
                              <span className="text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="mt-2 text-gray-600">{review.comment}</p>
                          </div>
                        </div>
                        <Separator className="mt-6" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold">{formatCurrency(room.price)}</span>
                    <span className="text-gray-500">/night</span>
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
                        <p className="text-sm text-gray-600 text-center">
                          Sign in to book this room
                        </p>
                        <Link href={`/auth/login?callbackUrl=/rooms/${room.id}`}>
                          <Button className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                            Sign In to Book
                          </Button>
                        </Link>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">This room is currently not available</p>
                    </div>
                  )}

                  <Separator className="my-6" />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Free cancellation before check-in</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check className="h-4 w-4 text-green-500" />
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
