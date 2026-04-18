import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const updatePaymentSchema = z
  .object({
    status: z.enum(["UNPAID", "PAID", "FAILED"]).optional(),
    method: z.enum(["CASH", "ESEWA"]).optional(),
    reference: z.string().trim().max(120).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one payment field is required",
  });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await auth();
    const { bookingId } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updatePaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid payment update" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: {
          select: {
            landlordId: true,
          },
        },
        payment: {
          select: {
            id: true,
            method: true,
            status: true,
            reference: true,
            paidAt: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const isLandlord = booking.room.landlordId === session.user.id;

    if (!isAdmin && !isLandlord) {
      return NextResponse.json(
        { success: false, error: "Only admin or listing landlord can update payment" },
        { status: 403 }
      );
    }

    const nextMethod = parsed.data.method || booking.payment?.method || "CASH";
    const nextStatus = parsed.data.status || booking.payment?.status || "UNPAID";

    if (booking.status === "CANCELLED" && nextStatus === "PAID") {
      return NextResponse.json(
        { success: false, error: "Cannot mark a cancelled booking as paid" },
        { status: 400 }
      );
    }

    const [updatedPayment, updatedBooking] = await prisma.$transaction([
      prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: {
          amount: booking.totalPrice,
          method: nextMethod,
          status: nextStatus,
          reference:
            parsed.data.reference !== undefined
              ? parsed.data.reference || null
              : booking.payment?.reference || null,
          paidAt: nextStatus === "PAID" ? booking.payment?.paidAt || new Date() : null,
        },
        create: {
          bookingId: booking.id,
          userId: booking.userId,
          amount: booking.totalPrice,
          method: nextMethod,
          status: nextStatus,
          reference: parsed.data.reference || null,
          paidAt: nextStatus === "PAID" ? new Date() : null,
        },
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          reference: true,
          paidAt: true,
        },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: nextStatus === "PAID" && booking.status === "PENDING" ? "CONFIRMED" : booking.status,
        },
        select: {
          id: true,
          status: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        booking: updatedBooking,
        payment: updatedPayment,
      },
      message: "Payment updated successfully",
    });
  } catch (error) {
    console.error("Payment update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update payment" },
      { status: 500 }
    );
  }
}
