"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
type PaymentMethod = "CASH" | "KHALTI";
type PaymentStatus = "UNPAID" | "PAID" | "FAILED";

interface UserBookingActionsProps {
  bookingId: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  khaltiEnabled: boolean;
}

export function UserBookingActions({
  bookingId,
  status,
  paymentMethod,
  paymentStatus,
  khaltiEnabled,
}: UserBookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const canCancel = status === "PENDING" || status === "CONFIRMED";
  const canPayNow =
    khaltiEnabled &&
    paymentMethod === "KHALTI" &&
    paymentStatus !== "PAID" &&
    status !== "CANCELLED" &&
    status !== "COMPLETED";

  const cancelBooking = async () => {
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      toast.success("Booking cancelled");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  const payWithKhalti = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payments/khalti/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start Khalti payment");
      }

      window.location.href = data.data.paymentUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start Khalti payment");
      setLoading(false);
    }
  };

  if (!canCancel && !canPayNow) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {canPayNow && (
        <Button
          className="w-full bg-[#5D2E8C] hover:bg-[#4A2570]"
          onClick={payWithKhalti}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            "Pay with Khalti"
          )}
        </Button>
      )}

      {canCancel && (
        <Button variant="outline" className="w-full" onClick={cancelBooking} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Cancel Booking"
          )}
        </Button>
      )}
    </div>
  );
}
