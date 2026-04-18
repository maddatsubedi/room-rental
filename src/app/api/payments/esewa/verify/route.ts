import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  checkEsewaStatus,
  decodeEsewaSuccessData,
  isEsewaConfigured,
  verifyEsewaSuccessPayload,
} from "@/lib/esewa";

const verifySchema = z.object({
  data: z.string().min(1, "Callback payload is required"),
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

    if (!isEsewaConfigured()) {
      return NextResponse.json(
        { success: false, error: "eSewa is not configured on the server" },
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

    let callbackPayload;
    try {
      callbackPayload = decodeEsewaSuccessData(parsed.data.data);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid eSewa callback payload" },
        { status: 400 }
      );
    }

    if (!verifyEsewaSuccessPayload(callbackPayload)) {
      return NextResponse.json(
        { success: false, error: "Invalid callback signature" },
        { status: 400 }
      );
    }

    const transactionUuid = callbackPayload.transaction_uuid;
    const callbackAmount = callbackPayload.total_amount;
    const productCode = callbackPayload.product_code;

    if (!transactionUuid || !productCode || callbackAmount === undefined || callbackAmount === null) {
      return NextResponse.json(
        { success: false, error: "Missing required callback fields" },
        { status: 400 }
      );
    }

    const paymentRecord = await prisma.payment.findFirst({
      where: { providerPaymentId: transactionUuid },
      include: {
        booking: {
          select: {
            id: true,
            userId: true,
            status: true,
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

    const payment = await checkEsewaStatus({
      productCode,
      transactionUuid,
      totalAmount: callbackAmount,
    });

    const expectedAmount = Number(paymentRecord.amount.toFixed(2));
    const providerAmount = Number(payment.total_amount);

    if (!Number.isFinite(providerAmount)) {
      return NextResponse.json(
        { success: false, error: "Invalid amount returned from eSewa" },
        { status: 400 }
      );
    }

    if (Math.abs(providerAmount - expectedAmount) > 0.009) {
      return NextResponse.json(
        { success: false, error: "Payment amount mismatch" },
        { status: 400 }
      );
    }

    const paymentStatus = payment.status.toUpperCase();

    if (paymentStatus === "COMPLETE") {
      const [updatedPayment, updatedBooking] = await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentRecord.id },
          data: {
            status: "PAID",
            method: "ESEWA",
            provider: "ESEWA",
            reference:
              payment.ref_id ||
              callbackPayload.transaction_code ||
              paymentRecord.reference,
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

    if (paymentStatus === "PENDING" || paymentStatus === "AMBIGUOUS") {
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
    console.error("eSewa verify error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to verify payment" },
      { status: 500 }
    );
  }
}