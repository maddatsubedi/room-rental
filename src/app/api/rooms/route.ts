import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { roomSchema } from "@/lib/validations";

// GET /api/rooms - Get all rooms with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minGuests = searchParams.get("minGuests");
    const amenities = searchParams.get("amenities");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const landlordId = searchParams.get("landlordId");

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (city) where.city = { contains: city, mode: "insensitive" };
    if (type) where.type = type;
    if (status) where.status = status;
    else where.status = "AVAILABLE";
    if (landlordId) where.landlordId = landlordId;
    if (featured === "true") where.featured = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }
    if (minGuests) where.maxGuests = { gte: parseInt(minGuests) };
    if (amenities) {
      where.amenities = { hasEvery: amenities.split(",") };
    }

    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        include: {
          landlord: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: [
          { featured: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.room.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create a new room (Landlord only)
export async function POST(request: NextRequest) {
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
        { success: false, error: "Only landlords can create rooms" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedFields = roomSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { success: false, error: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        ...validatedFields.data,
        landlordId: session.user.id,
        images: validatedFields.data.images || [],
      },
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: room, message: "Room created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create room" },
      { status: 500 }
    );
  }
}
