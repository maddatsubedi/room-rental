"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Check, X, CircleCheckBig, Trash2, Loader2, DollarSign, Undo2 } from "lucide-react";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
type PaymentMethod = "CASH" | "ESEWA";
type PaymentStatus = "UNPAID" | "PAID" | "FAILED";

interface AdminBookingActionsProps {
  bookingId: string;
  roomId: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

export function AdminBookingActions({
  bookingId,
  roomId,
  status,
  paymentMethod,
  paymentStatus,
}: AdminBookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (nextStatus: BookingStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update booking");
      }

      toast.success(`Booking marked as ${nextStatus.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  const updatePayment = async (
    nextStatus: PaymentStatus,
    method: PaymentMethod = paymentMethod
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payments/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, method }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update payment");
      }

      toast.success(`Payment marked as ${nextStatus.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update payment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this booking permanently?");
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete booking");
      }

      toast.success("Booking deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/rooms/${roomId}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Room
          </Link>
        </DropdownMenuItem>

        {status === "PENDING" && (
          <DropdownMenuItem className="text-green-600" onClick={() => updateStatus("CONFIRMED")}>
            <Check className="h-4 w-4 mr-2" />
            Confirm Booking
          </DropdownMenuItem>
        )}

        {(status === "PENDING" || status === "CONFIRMED") && (
          <DropdownMenuItem className="text-red-600" onClick={() => updateStatus("CANCELLED")}>
            <X className="h-4 w-4 mr-2" />
            Cancel Booking
          </DropdownMenuItem>
        )}

        {status === "CONFIRMED" && (
          <DropdownMenuItem onClick={() => updateStatus("COMPLETED")}>
            <CircleCheckBig className="h-4 w-4 mr-2" />
            Mark Completed
          </DropdownMenuItem>
        )}

        {paymentStatus !== "PAID" && (
          <DropdownMenuItem onClick={() => updatePayment("PAID", "CASH")}>
            <DollarSign className="h-4 w-4 mr-2" />
            Mark Payment Received
          </DropdownMenuItem>
        )}

        {paymentStatus === "PAID" && (
          <DropdownMenuItem onClick={() => updatePayment("UNPAID", paymentMethod)}>
            <Undo2 className="h-4 w-4 mr-2" />
            Mark Payment Unpaid
          </DropdownMenuItem>
        )}

        <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Booking
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
