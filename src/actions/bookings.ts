"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { bookingSchema } from "@/lib/validations";
import { calculateTotalPrice } from "@/lib/utils";
import type { BookingStatus } from "@prisma/client";

export async function createBooking(formData: FormData) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: "Please login to book a room" };
  }

  const data = {
    roomId: formData.get("roomId") as string,
    checkIn: formData.get("checkIn") as string,
    checkOut: formData.get("checkOut") as string,
    guests: parseInt(formData.get("guests") as string) || 1,
    notes: formData.get("notes") as string,
  };

  const validatedFields = bookingSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
    });

    if (!room) {
      return { error: "Room not found" };
    }

    if (room.status !== "AVAILABLE") {
      return { error: "Room is not available" };
    }

    if (data.guests > room.maxGuests) {
      return { error: `Maximum guests allowed: ${room.maxGuests}` };
    }

    // Check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        roomId: data.roomId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            checkIn: { lte: new Date(data.checkOut) },
            checkOut: { gte: new Date(data.checkIn) },
          },
        ],
      },
    });

    if (overlappingBooking) {
      return { error: "Room is already booked for these dates" };
    }

    const totalPrice = calculateTotalPrice(room.price, data.checkIn, data.checkOut);

    const booking = await prisma.booking.create({
      data: {
        roomId: data.roomId,
        userId: session.user.id,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        guests: data.guests,
        totalPrice,
        notes: data.notes,
        status: "PENDING",
      },
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath(`/rooms/${data.roomId}`);
    return { success: true, booking };
  } catch (error) {
    console.error("Create booking error:", error);
    return { error: "Failed to create booking" };
  }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { room: true },
  });

  if (!booking) {
    return { error: "Booking not found" };
  }

  // Allow user to cancel their own booking or landlord/admin to update status
  const isOwner = booking.userId === session.user.id;
  const isLandlord = booking.room.landlordId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isLandlord && !isAdmin) {
    return { error: "Unauthorized" };
  }

  // Users can only cancel their own bookings
  if (isOwner && !isLandlord && !isAdmin && status !== "CANCELLED") {
    return { error: "You can only cancel your booking" };
  }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath("/landlord/bookings");
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error) {
    console.error("Update booking status error:", error);
    return { error: "Failed to update booking" };
  }
}

export async function cancelBooking(bookingId: string) {
  return updateBookingStatus(bookingId, "CANCELLED");
}

export async function confirmBooking(bookingId: string) {
  return updateBookingStatus(bookingId, "CONFIRMED");
}

export async function completeBooking(bookingId: string) {
  return updateBookingStatus(bookingId, "COMPLETED");
}
