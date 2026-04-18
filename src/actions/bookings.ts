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
    paymentMethod: (formData.get("paymentMethod") as "CASH" | "ESEWA") || "CASH",
  };

  const validatedFields = bookingSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const validatedData = validatedFields.data;

  try {
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId },
    });

    if (!room) {
      return { error: "Room not found" };
    }

    if (room.status !== "AVAILABLE") {
      return { error: "Room is not available" };
    }

    if (validatedData.guests > room.maxGuests) {
      return { error: `Maximum guests allowed: ${room.maxGuests}` };
    }

    // Check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        roomId: validatedData.roomId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            checkIn: { lte: validatedData.checkOut },
            checkOut: { gte: validatedData.checkIn },
          },
        ],
      },
    });

    if (overlappingBooking) {
      return { error: "Room is already booked for these dates" };
    }

    const totalPrice = calculateTotalPrice(room.price, validatedData.checkIn, validatedData.checkOut);

    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          roomId: validatedData.roomId,
          userId: session.user.id,
          checkIn: validatedData.checkIn,
          checkOut: validatedData.checkOut,
          guests: validatedData.guests,
          totalPrice,
          notes: validatedData.notes,
          status: "PENDING",
        },
      });

      await tx.payment.create({
        data: {
          bookingId: createdBooking.id,
          userId: session.user.id,
          amount: totalPrice,
          method: validatedData.paymentMethod,
          status: "UNPAID",
        },
      });

      return createdBooking;
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath(`/rooms/${validatedData.roomId}`);
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
