import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get counts
    const [
      totalUsers,
      totalRooms,
      totalBookings,
      usersByRole,
      roomsByStatus,
      bookingsByStatus,
      recentBookings,
      topRooms,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.room.count(),
      prisma.booking.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
      prisma.room.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.booking.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          room: {
            select: { id: true, title: true, images: true, price: true },
          },
        },
      }),
      prisma.room.findMany({
        take: 5,
        orderBy: {
          bookings: {
            _count: "desc",
          },
        },
        include: {
          _count: {
            select: { bookings: true },
          },
        },
      }),
    ]);

    // Calculate total revenue
    const revenueResult = await prisma.booking.aggregate({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      _sum: { totalPrice: true },
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    // Monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
    });

    const monthlyRevenue = monthlyBookings.reduce((acc: Record<string, number>, booking: { createdAt: Date; totalPrice: number }) => {
      const month = booking.createdAt.toLocaleString("default", { month: "short" });
      acc[month] = (acc[month] || 0) + booking.totalPrice;
      return acc;
    }, {} as Record<string, number>);

    const monthlyRevenueArray = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalRooms,
        totalBookings,
        totalRevenue,
        usersByRole: usersByRole.reduce((acc: Record<string, number>, item: { role: string; _count: { role: number } }) => {
          acc[item.role] = item._count.role;
          return acc;
        }, {} as Record<string, number>),
        roomsByStatus: roomsByStatus.reduce((acc: Record<string, number>, item: { status: string; _count: { status: number } }) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        bookingsByStatus: bookingsByStatus.reduce((acc: Record<string, number>, item: { status: string; _count: { status: number } }) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        recentBookings,
        topRooms,
        monthlyRevenue: monthlyRevenueArray,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
