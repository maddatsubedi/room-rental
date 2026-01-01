import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserLayout } from "@/components/layout/user-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Calendar, MapPin, Home, ArrowRight, Star } from "lucide-react";

interface SearchParams {
  status?: string;
}

interface BookingWithRoom {
  id: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  guests: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes: string | null;
  createdAt: Date;
  room: {
    id: string;
    title: string;
    city: string;
    state: string;
    images: string[];
    price: number;
    landlord: { name: string };
  };
  review: { id: string; rating: number } | null;
}

async function getUserBookings(userId: string, status?: string): Promise<{ bookings: BookingWithRoom[]; counts: { pending: number; confirmed: number; completed: number; cancelled: number } }> {
  const where: Record<string, unknown> = { userId };

  if (status && status !== "all") {
    where.status = status;
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      room: {
        select: {
          id: true,
          title: true,
          city: true,
          state: true,
          images: true,
          price: true,
          landlord: {
            select: { name: true },
          },
        },
      },
    },
  });

  // Get user's reviews for these rooms
  const roomIds = bookings.map(b => b.room.id);
  const reviews = await prisma.review.findMany({
    where: {
      userId,
      roomId: { in: roomIds },
    },
    select: { id: true, rating: true, roomId: true },
  });

  // Attach reviews to bookings
  const bookingsWithReviews: BookingWithRoom[] = bookings.map(booking => ({
    id: booking.id,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    totalPrice: booking.totalPrice,
    guests: booking.guests,
    status: booking.status,
    notes: booking.notes,
    createdAt: booking.createdAt,
    room: booking.room,
    review: reviews.find(r => r.roomId === booking.room.id) || null,
  }));

  const [pending, confirmed, completed, cancelled] = await Promise.all([
    prisma.booking.count({ where: { userId, status: "PENDING" } }),
    prisma.booking.count({ where: { userId, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { userId, status: "COMPLETED" } }),
    prisma.booking.count({ where: { userId, status: "CANCELLED" } }),
  ]);

  return { bookings: bookingsWithReviews, counts: { pending, confirmed, completed, cancelled } };
}

export default async function UserBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const { bookings, counts } = await getUserBookings(session.user.id, params.status);

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-500">View and manage your reservations</p>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          <Link href="/dashboard/bookings">
            <Button variant={!params.status || params.status === "all" ? "default" : "outline"} size="sm">
              All ({counts.pending + counts.confirmed + counts.completed + counts.cancelled})
            </Button>
          </Link>
          <Link href="/dashboard/bookings?status=PENDING">
            <Button variant={params.status === "PENDING" ? "default" : "outline"} size="sm">
              Pending ({counts.pending})
            </Button>
          </Link>
          <Link href="/dashboard/bookings?status=CONFIRMED">
            <Button variant={params.status === "CONFIRMED" ? "default" : "outline"} size="sm">
              Confirmed ({counts.confirmed})
            </Button>
          </Link>
          <Link href="/dashboard/bookings?status=COMPLETED">
            <Button variant={params.status === "COMPLETED" ? "default" : "outline"} size="sm">
              Completed ({counts.completed})
            </Button>
          </Link>
          <Link href="/dashboard/bookings?status=CANCELLED">
            <Button variant={params.status === "CANCELLED" ? "default" : "outline"} size="sm">
              Cancelled ({counts.cancelled})
            </Button>
          </Link>
        </div>

        {/* Bookings List */}
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative h-48 md:h-auto md:w-64 shrink-0 bg-gray-100">
                      {booking.room.images.length > 0 ? (
                        <Image
                          src={booking.room.images[0]}
                          alt={booking.room.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <Home className="h-12 w-12" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            {booking.status === "COMPLETED" && !booking.review && (
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                Review Pending
                              </Badge>
                            )}
                          </div>
                          <Link href={`/rooms/${booking.room.id}`}>
                            <h3 className="text-lg font-semibold hover:text-violet-600 transition-colors">
                              {booking.room.title}
                            </h3>
                          </Link>
                          <p className="text-gray-500 flex items-center gap-1 mb-3">
                            <MapPin className="h-4 w-4" />
                            {booking.room.city}, {booking.room.state}
                          </p>

                          {/* Dates */}
                          <div className="flex items-center gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-500">Check-in</p>
                              <p className="font-medium">{formatDate(booking.checkIn)}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500">Check-out</p>
                              <p className="font-medium">{formatDate(booking.checkOut)}</p>
                            </div>
                          </div>

                          {/* Host */}
                          <p className="text-sm text-gray-500">
                            Hosted by <span className="font-medium text-gray-700">{booking.room.landlord.name}</span>
                          </p>
                        </div>

                        {/* Price & Actions */}
                        <div className="md:text-right">
                          <div className="mb-4">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-2xl font-bold">{formatCurrency(booking.totalPrice)}</p>
                            <p className="text-sm text-gray-500">{booking.guests} guest{booking.guests !== 1 ? "s" : ""}</p>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Link href={`/rooms/${booking.room.id}`}>
                              <Button variant="outline" className="w-full">
                                View Room
                              </Button>
                            </Link>
                            {booking.status === "COMPLETED" && !booking.review && (
                              <Button className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                                <Star className="h-4 w-4 mr-2" />
                                Write Review
                              </Button>
                            )}
                            {booking.review && (
                              <div className="flex items-center gap-1 justify-center text-sm text-gray-500">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span>You rated {booking.review.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {params.status
                  ? `You don't have any ${params.status.toLowerCase()} bookings.`
                  : "You haven't made any bookings yet. Start exploring rooms and plan your next stay!"}
              </p>
              <Link href="/rooms">
                <Button className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  Browse Rooms
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}

