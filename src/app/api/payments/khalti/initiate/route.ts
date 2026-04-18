import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAppUrl, initiateKhaltiPayment, isKhaltiConfigured } from "@/lib/khalti";

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

    if (!isKhaltiConfigured()) {
      return NextResponse.json(
        { success: false, error: "Khalti is not configured on the server" },
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
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
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
    const amountInPaisa = Math.round(booking.totalPrice * 100);

    const payment = await initiateKhaltiPayment({
      return_url: `${appUrl}/payment/khalti/success`,
      website_url: appUrl,
      amount: amountInPaisa,
      purchase_order_id: booking.id,
      purchase_order_name: booking.room.title,
      customer_info: {
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone || undefined,
      },
    });

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        amount: booking.totalPrice,
        method: "KHALTI",
        status: "UNPAID",
        provider: "KHALTI",
        providerPaymentId: payment.pidx,
      },
      create: {
        bookingId: booking.id,
        userId: booking.userId,
        amount: booking.totalPrice,
        method: "KHALTI",
        status: "UNPAID",
        provider: "KHALTI",
        providerPaymentId: payment.pidx,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        pidx: payment.pidx,
        paymentUrl: payment.payment_url,
      },
      message: "Khalti payment initiated",
    });
  } catch (error) {
    console.error("Khalti initiate error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
