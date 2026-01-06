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
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addMonths(new Date(), 0),
    to: addMonths(new Date(), 1),
  });

  const months = dateRange?.from && dateRange?.to
    ? Math.max(1, Math.ceil(differenceInDays(dateRange.to, dateRange.from) / 30))
    : 0;

  const subtotal = price * months;
  const serviceFee = subtotal * 0.05; // 5% service fee for long-term
  const total = subtotal + serviceFee;

  const handleSubmit = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select move-in and move-out dates");
      return;
    }

    if (months < 1) {
      toast.error("Minimum rental period is 1 month");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          checkIn: dateRange.from.toISOString(),
          checkOut: dateRange.to.toISOString(),
          guests,
          totalPrice: total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
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

      {/* Book Button */}
      <Button
        className="w-full bg-stone-900 hover:bg-stone-800 h-12 text-lg"
        onClick={handleSubmit}
        disabled={loading || months < 1}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          "Request Booking"
        )}
      </Button>

      {/* Price Breakdown */}
      {months > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {formatCurrency(price)} × {months} month{months !== 1 ? "s" : ""}
            </span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service fee (5%)</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-3 border-t">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

