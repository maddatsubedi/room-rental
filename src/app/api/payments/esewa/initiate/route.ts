import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  buildEsewaFormPayload,
  createEsewaTransactionUuid,
  getAppUrl,
  getEsewaFormUrl,
  isEsewaConfigured,
} from "@/lib/esewa";

const initiateSchema = z.object({
  bookingId: z.string().min(1, "Booking id is required"),
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
    const parsed = initiateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsed.data.bookingId },
      include: {
        room: {
          select: { title: true, landlordId: true },
        },
        payment: {
          select: {
            id: true,
            status: true,
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

    const isOwner = booking.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const isLandlord = booking.room.landlordId === session.user.id;

    if (!isOwner && !isAdmin && !isLandlord) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    if (booking.payment?.status === "PAID") {
      return NextResponse.json(
        { success: false, error: "This booking is already paid" },
        { status: 400 }
      );
    }

    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "This booking is not payable" },
        { status: 400 }
      );
    }

    const appUrl = getAppUrl();
    const transactionUuid = createEsewaTransactionUuid(booking.id);

    const formData = buildEsewaFormPayload({
      amount: booking.totalPrice,
      transactionUuid,
      successUrl: `${appUrl}/payment/esewa/success`,
      failureUrl: `${appUrl}/payment/esewa/failure`,
    });

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        amount: booking.totalPrice,
        method: "ESEWA",
        status: "UNPAID",
        provider: "ESEWA",
        providerPaymentId: transactionUuid,
      },
      create: {
        bookingId: booking.id,
        userId: booking.userId,
        amount: booking.totalPrice,
        method: "ESEWA",
        status: "UNPAID",
        provider: "ESEWA",
        providerPaymentId: transactionUuid,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        transactionUuid,
        paymentUrl: getEsewaFormUrl(),
        formData,
      },
      message: "eSewa payment initiated",
    });
  } catch (error) {
    console.error("eSewa initiate error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to initiate payment" },
      { status: 500 }
    );
  }
}