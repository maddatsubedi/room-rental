import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { bookingSchema } from "@/lib/validations";
import { calculateTotalPrice } from "@/lib/utils";

// GET /api/bookings - Get all bookings (filtered by role)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const roomId = searchParams.get("roomId");

    const where: Record<string, unknown> = {};

    // Filter by role
    if (session.user.role === "USER") {
      where.userId = session.user.id;
    } else if (session.user.role === "LANDLORD") {
      where.room = { landlordId: session.user.id };
    }
    // Admin can see all bookings

    if (status) where.status = status;
    if (roomId) where.roomId = roomId;

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          room: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
              city: true,
              landlordId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedFields = bookingSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { success: false, error: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { roomId, checkIn, checkOut, guests, notes } = validatedFields.data;

    // Get room details
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    if (room.status !== "AVAILABLE") {
      return NextResponse.json(
        { success: false, error: "Room is not available" },
        { status: 400 }
      );
    }

    if (guests > room.maxGuests) {
      return NextResponse.json(
        { success: false, error: `Maximum ${room.maxGuests} guests allowed` },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            checkIn: { lte: checkOutDate },
            checkOut: { gte: checkInDate },
          },
        ],
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        { success: false, error: "Room is already booked for these dates" },
        { status: 400 }
      );
    }

    // Calculate total price
    const totalPrice = calculateTotalPrice(room.price, checkIn, checkOut);

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        notes,
        totalPrice,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: booking, message: "Booking created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
