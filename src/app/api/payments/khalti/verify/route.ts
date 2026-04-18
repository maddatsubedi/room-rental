import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isKhaltiConfigured, lookupKhaltiPayment } from "@/lib/khalti";

const verifySchema = z.object({
  pidx: z.string().min(1, "Payment id is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isKhaltiConfigured()) {
      return NextResponse.json(
        { success: false, error: "Khalti is not configured on the server" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const paymentRecord = await prisma.payment.findFirst({
      where: { providerPaymentId: parsed.data.pidx },
      include: {
        booking: {
          select: {
            id: true,
            userId: true,
            status: true,
            totalPrice: true,
            room: {
              select: {
                landlordId: true,
              },
            },
          },
        },
      },
    });

    if (!paymentRecord) {
      return NextResponse.json(
        { success: false, error: "Booking payment record not found" },
        { status: 404 }
      );
    }

    const booking = paymentRecord.booking;
    const isOwner = booking.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const isLandlord = booking.room.landlordId === session.user.id;

    if (!isOwner && !isAdmin && !isLandlord) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const payment = await lookupKhaltiPayment(parsed.data.pidx);
    const expectedAmount = Math.round(paymentRecord.amount * 100);

    if (typeof payment.total_amount === "number" && payment.total_amount !== expectedAmount) {
      return NextResponse.json(
        { success: false, error: "Payment amount mismatch" },
        { status: 400 }
      );
    }

    const paymentStatus = payment.status.toUpperCase();

    if (paymentStatus === "COMPLETED") {
      const [updatedPayment, updatedBooking] = await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentRecord.id },
          data: {
            status: "PAID",
            reference: payment.transaction_id || payment.tidx || paymentRecord.reference,
            paidAt: paymentRecord.paidAt || new Date(),
          },
          select: {
            id: true,
            status: true,
            reference: true,
            paidAt: true,
          },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: booking.status === "PENDING" ? "CONFIRMED" : booking.status,
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
          bookingId: updatedBooking.id,
          bookingStatus: updatedBooking.status,
          paymentId: updatedPayment.id,
          paymentStatus: updatedPayment.status,
          paymentReference: updatedPayment.reference,
          providerStatus: payment.status,
        },
        message: "Payment verified successfully",
      });
    }

    if (paymentStatus === "PENDING" || paymentStatus === "INITIATED") {
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: "UNPAID",
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: "Payment is still pending",
          data: {
            bookingId: booking.id,
            providerStatus: payment.status,
          },
        },
        { status: 400 }
      );
    }

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status: "FAILED",
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: `Payment is ${payment.status.toLowerCase()}`,
        data: {
          bookingId: booking.id,
          providerStatus: payment.status,
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Khalti verify error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to verify payment" },
      { status: 500 }
    );
  }
}
