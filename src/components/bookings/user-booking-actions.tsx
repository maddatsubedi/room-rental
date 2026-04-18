"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitEsewaPaymentForm } from "@/lib/esewa-client";
import { Loader2 } from "lucide-react";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
type PaymentMethod = "CASH" | "ESEWA";
type PaymentStatus = "UNPAID" | "PAID" | "FAILED";

interface UserBookingActionsProps {
  bookingId: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  esewaEnabled: boolean;
}

export function UserBookingActions({
  bookingId,
  status,
  paymentMethod,
  paymentStatus,
  esewaEnabled,
}: UserBookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const canCancel = status === "PENDING" || status === "CONFIRMED";
  const canPayNow =
    esewaEnabled &&
    paymentMethod === "ESEWA" &&
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

  const payWithEsewa = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payments/esewa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start eSewa payment");
      }

      submitEsewaPaymentForm(data.data.paymentUrl, data.data.formData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start eSewa payment");
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
          className="w-full bg-[#60BB46] hover:bg-[#4DA636]"
          onClick={payWithEsewa}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            "Pay with eSewa"
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
