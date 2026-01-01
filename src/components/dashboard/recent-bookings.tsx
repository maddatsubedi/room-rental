"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateShort, getInitials, getStatusColor } from "@/lib/utils";
import type { BookingStatus } from "@/types";
import Link from "next/link";

interface RecentBooking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: BookingStatus;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  room: {
    id?: string;
    title: string;
  };
}

interface RecentBookingsProps {
  bookings: RecentBooking[];
  showRoom?: boolean;
  showUser?: boolean;
}

export function RecentBookings({ bookings, showRoom = true, showUser = true }: RecentBookingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent bookings
          </p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {showUser && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={booking.user.image || ""} />
                      <AvatarFallback className="bg-linear-to-br from-violet-600 to-indigo-600 text-white text-sm">
                        {getInitials(booking.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {showUser && (
                      <p className="font-medium text-sm">{booking.user.name}</p>
                    )}
                    {showRoom && (
                      booking.room.id ? (
                        <Link
                          href={`/rooms/${booking.room.id}`}
                          className="text-sm text-muted-foreground hover:text-violet-600 transition-colors"
                        >
                          {booking.room.title}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {booking.room.title}
                        </span>
                      )
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDateShort(booking.checkIn)} - {formatDateShort(booking.checkOut)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

