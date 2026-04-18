"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { submitEsewaPaymentForm } from "@/lib/esewa-client";
import { formatCurrency, cn } from "@/lib/utils";
import { format, differenceInDays, addMonths } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Users, Minus, Plus } from "lucide-react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

interface BookingFormProps {
  roomId: string;
  price: number;
  maxGuests: number;
}

export function BookingForm({ roomId, price, maxGuests }: BookingFormProps) {
  const router = useRouter();
  const esewaEnabled = process.env.NEXT_PUBLIC_ESEWA_ENABLED !== "false";
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addMonths(new Date(), 0),
    to: addMonths(new Date(), 1),
  });

  const months = dateRange?.from && dateRange?.to
    ? Math.max(1, Math.ceil(differenceInDays(dateRange.to, dateRange.from) / 30))
    : 0;

  const subtotal = price * months;

  const handleSubmit = async (paymentMethod: "CASH" | "ESEWA") => {
    setFormError(null);

    if (!dateRange?.from || !dateRange?.to) {
      setFormError("Please select move-in and move-out dates.");
      return;
    }

    if (months < 1) {
      setFormError("Minimum rental period is 1 month.");
      return;
    }

    setLoading(true);

    try {
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          checkIn: dateRange.from.toISOString(),
          checkOut: dateRange.to.toISOString(),
          guests,
          paymentMethod,
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        const fieldError =
          bookingData?.error && typeof bookingData.error === "object"
            ? Object.values(bookingData.error)[0]
            : bookingData.error;
        throw new Error(
          Array.isArray(fieldError) ? String(fieldError[0]) : fieldError || "Failed to create booking"
        );
      }

      if (paymentMethod === "ESEWA") {
        const paymentResponse = await fetch("/api/payments/esewa/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: bookingData.data.id }),
        });

        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok) {
          throw new Error(paymentData.error || "Failed to start eSewa payment");
        }

        toast.success("Redirecting to eSewa payment...");
        submitEsewaPaymentForm(paymentData.data.paymentUrl, paymentData.data.formData);
        return;
      }

      toast.success("Booking request sent successfully!");
      router.push("/dashboard/bookings");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Range Picker */}
      <div className="space-y-2">
        <Label>Move-in / Move-out</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-auto py-3",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-500">
                      {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                    </span>
                    <span className="text-sm">{months} month{months !== 1 ? "s" : ""}</span>
                  </div>
                ) : (
                  format(dateRange.from, "PPP")
                )
              ) : (
                <span>Select dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Guest Counter */}
      <div className="space-y-2">
        <Label>Guests</Label>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{guests} guest{guests !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              disabled={guests <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center">{guests}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
              disabled={guests >= maxGuests}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500">Maximum {maxGuests} guests</p>
      </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        {/* Booking Actions */}
        <div className="space-y-2">
          <Button
            className="w-full bg-stone-900 hover:bg-stone-800 h-12"
            onClick={() => handleSubmit("CASH")}
            disabled={loading || months < 1}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Book Without Online Payment"
            )}
          </Button>

          <Button
            className="w-full h-12 bg-[#60BB46] hover:bg-[#4DA636] text-white"
            onClick={() => handleSubmit("ESEWA")}
            disabled={loading || months < 1 || !esewaEnabled}
            title={!esewaEnabled ? "eSewa is disabled" : "Pay with eSewa"}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay with eSewa"
            )}
          </Button>

          {!esewaEnabled && (
            <p className="text-xs text-amber-700">eSewa is disabled. Set NEXT_PUBLIC_ESEWA_ENABLED=true to enable online payment.</p>
          )}
        </div>

      {/* Price Breakdown */}
      {months > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {formatCurrency(price)} × {months} month{months !== 1 ? "s" : ""}
            </span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-3 border-t">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

