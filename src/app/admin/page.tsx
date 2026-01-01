import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminLayout } from "@/components/layout/admin-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart, BookingsChart } from "@/components/dashboard/charts";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

async function getAdminStats() {
  const [
    totalUsers,
    totalRooms,
    totalBookings,
    totalRevenue,
    recentUsers,
    recentBookings,
    monthlyBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.room.count(),
    prisma.booking.count(),
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: "CONFIRMED" },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, image: true } },
        room: { select: { title: true } },
      },
    }),
    prisma.booking.groupBy({
      by: ["createdAt"],
      _count: true,
      _sum: { totalPrice: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Process monthly data
  const monthlyData = processMonthlyData(monthlyBookings);

  return {
    totalUsers,
    totalRooms,
    totalBookings,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    recentUsers,
    recentBookings,
    monthlyData,
  };
}

function processMonthlyData(bookings: any[]) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  
  // Initialize last 6 months
  const data: { name: string; revenue: number; bookings: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    data.push({
      name: monthNames[monthIndex],
      revenue: 0,
      bookings: 0,
    });
  }

  // Fill with actual data
  bookings.forEach((booking) => {
    const bookingMonth = new Date(booking.createdAt).getMonth();
    const monthName = monthNames[bookingMonth];
    const monthData = data.find((d) => d.name === monthName);
    if (monthData) {
      monthData.bookings += booking._count;
      monthData.revenue += booking._sum.totalPrice || 0;
    }
  });

  return data;
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const stats = await getAdminStats();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {session.user.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="users"
            trend="+12% from last month"
            trendUp={true}
          />
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            icon="home"
            trend="+8% from last month"
            trendUp={true}
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="calendar"
            trend="+18% from last month"
            trendUp={true}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon="dollar-sign"
            trend="+24% from last month"
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
          {/* Recent Users */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback className="bg-violet-100 text-violet-600">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        user.role === "ADMIN" ? "default" :
                        user.role === "LANDLORD" ? "secondary" : "outline"
                      }>
                        {user.role}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <RecentBookings bookings={stats.recentBookings} />
        </div>
      </div>
    </AdminLayout>
  );
}

