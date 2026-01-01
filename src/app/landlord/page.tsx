import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LandlordLayout } from "@/components/layout/landlord-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart, BookingsChart } from "@/components/dashboard/charts";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

async function getLandlordStats(landlordId: string) {
  const [
    totalRooms,
    totalBookings,
    totalRevenue,
    avgRating,
    recentRooms,
    recentBookings,
  ] = await Promise.all([
    prisma.room.count({ where: { landlordId } }),
    prisma.booking.count({ 
      where: { room: { landlordId } } 
    }),
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { 
        room: { landlordId },
        status: "CONFIRMED" 
      },
    }),
    prisma.review.aggregate({
      _avg: { rating: true },
      where: { room: { landlordId } },
    }),
    prisma.room.findMany({
      where: { landlordId },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bookings: true, reviews: true } },
      },
    }),
    prisma.booking.findMany({
      where: { room: { landlordId } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, image: true } },
        room: { select: { title: true } },
      },
    }),
  ]);

  // Mock monthly data for charts
  const monthlyData = [
    { name: "Jan", revenue: 3200, bookings: 8 },
    { name: "Feb", revenue: 4100, bookings: 12 },
    { name: "Mar", revenue: 3800, bookings: 10 },
    { name: "Apr", revenue: 5200, bookings: 15 },
    { name: "May", revenue: 4600, bookings: 13 },
    { name: "Jun", revenue: 6100, bookings: 18 },
  ];

  return {
    totalRooms,
    totalBookings,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    avgRating: avgRating._avg.rating || 0,
    recentRooms,
    recentBookings,
    monthlyData,
  };
}

export default async function LandlordDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
    redirect("/");
  }

  const stats = await getLandlordStats(session.user.id);

  return (
    <LandlordLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {session.user.name}</p>
          </div>
          <Link href="/landlord/rooms/new">
            <Button className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Room
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            icon="home"
            trend="+2 this month"
            trendUp={true}
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="calendar"
            trend="+15% from last month"
            trendUp={true}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon="dollar-sign"
            trend="+20% from last month"
            trendUp={true}
          />
          <StatCard
            title="Average Rating"
            value={stats.avgRating.toFixed(1)}
            icon="star"
            trend="Based on all reviews"
            trendUp={true}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={stats.monthlyData} />
          <BookingsChart data={stats.monthlyData} />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Rooms */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Rooms</CardTitle>
              <Link href="/landlord/rooms">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentRooms.length > 0 ? (
                  stats.recentRooms.map((room) => (
                    <div key={room.id} className="flex items-center gap-4">
                      <div className="relative h-16 w-20 rounded-lg overflow-hidden bg-gray-100">
                        {room.images.length > 0 ? (
                          <Image
                            src={room.images[0]}
                            alt={room.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{room.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{formatCurrency(room.price)}/night</span>
                          <span>•</span>
                          <span>{room._count.bookings} bookings</span>
                        </div>
                      </div>
                      <Badge variant={
                        room.status === "AVAILABLE" ? "default" :
                        room.status === "OCCUPIED" ? "secondary" : "destructive"
                      }>
                        {room.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No rooms yet</p>
                    <Link href="/landlord/rooms/new">
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Room
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <RecentBookings bookings={stats.recentBookings} />
        </div>
      </div>
    </LandlordLayout>
  );
}

