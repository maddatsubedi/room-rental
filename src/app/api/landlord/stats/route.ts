import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/landlord/stats - Get landlord dashboard statistics
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const landlordId = session.user.id;

    // Get landlord's rooms
    const rooms = await prisma.room.findMany({
      where: { landlordId },
      select: { id: true, status: true },
    });

    const roomIds = rooms.map((r: { id: string }) => r.id);

    // Get counts
    const [totalBookings, pendingBookings, recentBookings] = await Promise.all([
      prisma.booking.count({
        where: { roomId: { in: roomIds } },
      }),
      prisma.booking.count({
        where: { roomId: { in: roomIds }, status: "PENDING" },
      }),
      prisma.booking.findMany({
        where: { roomId: { in: roomIds } },
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
    ]);

    // Calculate total revenue
    const revenueResult = await prisma.booking.aggregate({
      where: {
        roomId: { in: roomIds },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      _sum: { totalPrice: true },
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    // Monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await prisma.booking.findMany({
      where: {
        roomId: { in: roomIds },
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
        totalRooms: rooms.length,
        activeRooms: rooms.filter((r: { status: string }) => r.status === "AVAILABLE").length,
        totalBookings,
        pendingBookings,
        totalRevenue,
        recentBookings,
        monthlyRevenue: monthlyRevenueArray,
      },
    });
  } catch (error) {
    console.error("Error fetching landlord stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
