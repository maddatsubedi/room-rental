import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserLayout } from "@/components/layout/user-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Home, MapPin, ArrowRight, Calendar, Star } from "lucide-react";

async function getUserStats(userId: string) {
  const [
    totalBookings,
    totalSpent,
    totalReviews,
    recentBookings,
    upcomingBooking,
  ] = await Promise.all([
    prisma.booking.count({ where: { userId } }),
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { userId, status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
    prisma.review.count({ where: { userId } }),
    prisma.booking.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        room: {
          select: { id: true, title: true, city: true, images: true },
        },
      },
    }),
    prisma.booking.findFirst({
      where: {
        userId,
        status: "CONFIRMED",
        checkIn: { gte: new Date() },
      },
      orderBy: { checkIn: "asc" },
      include: {
        room: {
          select: { id: true, title: true, city: true, images: true, address: true },
        },
      },
    }),
  ]);

  return {
    totalBookings,
    totalSpent: totalSpent._sum.totalPrice || 0,
    totalReviews,
    recentBookings,
    upcomingBooking,
  };
}

export default async function UserDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  if (session.user.role === "LANDLORD") {
    redirect("/landlord");
  }

  const stats = await getUserStats(session.user.id);

  return (
    <UserLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {session.user.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="calendar"
            trend="All time"
          />
          <StatCard
            title="Total Spent"
            value={formatCurrency(stats.totalSpent)}
            icon="dollar-sign"
            trend="Confirmed bookings"
          />
          <StatCard
            title="Reviews Written"
            value={stats.totalReviews}
            icon="star"
            trend="Help others decide"
          />
        </div>

        {/* Upcoming Booking */}
        {stats.upcomingBooking && (
          <Card className="border-0 shadow-sm bg-linear-to-r from-violet-600 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative h-32 w-full md:w-48 rounded-lg overflow-hidden shrink-0">
                  {stats.upcomingBooking.room.images.length > 0 ? (
                    <Image
                      src={stats.upcomingBooking.room.images[0]}
                      alt={stats.upcomingBooking.room.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-white/10 flex items-center justify-center">
                      <Home className="h-8 w-8 text-white/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-sm mb-1">Your next trip</p>
                  <h3 className="text-xl font-semibold mb-2">
                    {stats.upcomingBooking.room.title}
                  </h3>
                  <p className="text-white/80 flex items-center gap-1 mb-4">
                    <MapPin className="h-4 w-4" />
                    {stats.upcomingBooking.room.city}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-white/60">Check-in</p>
                      <p className="font-medium">{formatDate(stats.upcomingBooking.checkIn)}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/60" />
                    <div>
                      <p className="text-white/60">Check-out</p>
                      <p className="font-medium">{formatDate(stats.upcomingBooking.checkOut)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 md:justify-center">
                  <Link href={`/rooms/${stats.upcomingBooking.room.id}`}>
                    <Button variant="secondary" size="sm">
                      View Room
                    </Button>
                  </Link>
                  <Link href="/dashboard/bookings">
                    <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                      All Bookings
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Link href="/dashboard/bookings">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="relative h-16 w-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {booking.room.images.length > 0 ? (
                        <Image
                          src={booking.room.images[0]}
                          alt={booking.room.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <Home className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/rooms/${booking.room.id}`} className="font-medium hover:text-violet-600 line-clamp-1">
                        {booking.room.title}
                      </Link>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {booking.room.city}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {formatCurrency(booking.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-4">Start exploring rooms and book your first stay</p>
                <Link href="/rooms">
                  <Button className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                    Browse Rooms
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/rooms">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 group-hover:bg-violet-200 transition-colors">
                  <Home className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Browse Rooms</h3>
                  <p className="text-sm text-gray-500">Find your perfect stay</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/bookings">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Bookings</h3>
                  <p className="text-sm text-gray-500">View all reservations</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/profile">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Profile</h3>
                  <p className="text-sm text-gray-500">Update your details</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </UserLayout>
  );
}

