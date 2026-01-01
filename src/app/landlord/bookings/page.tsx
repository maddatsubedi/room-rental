import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LandlordLayout } from "@/components/layout/landlord-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate, getInitials, getStatusColor } from "@/lib/utils";
import { MoreHorizontal, Eye, Check, X, Calendar, MessageSquare } from "lucide-react";

interface SearchParams {
  status?: string;
}

async function getLandlordBookings(landlordId: string, status?: string) {
  const where: any = {
    room: { landlordId },
  };

  if (status && status !== "all") {
    where.status = status;
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, phone: true },
      },
      room: {
        select: { id: true, title: true, images: true },
      },
    },
  });

  // Get counts for each status
  const [pending, confirmed, completed, cancelled] = await Promise.all([
    prisma.booking.count({ where: { room: { landlordId }, status: "PENDING" } }),
    prisma.booking.count({ where: { room: { landlordId }, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { room: { landlordId }, status: "COMPLETED" } }),
    prisma.booking.count({ where: { room: { landlordId }, status: "CANCELLED" } }),
  ]);

  return { bookings, counts: { pending, confirmed, completed, cancelled } };
}

export default async function LandlordBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
    redirect("/");
  }

  const params = await searchParams;
  const { bookings, counts } = await getLandlordBookings(session.user.id, params.status);

  return (
    <LandlordLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-500">Manage bookings for your rooms</p>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          <Link href="/landlord/bookings">
            <Button variant={!params.status || params.status === "all" ? "default" : "outline"} size="sm">
              All ({counts.pending + counts.confirmed + counts.completed + counts.cancelled})
            </Button>
          </Link>
          <Link href="/landlord/bookings?status=PENDING">
            <Button variant={params.status === "PENDING" ? "default" : "outline"} size="sm">
              Pending ({counts.pending})
            </Button>
          </Link>
          <Link href="/landlord/bookings?status=CONFIRMED">
            <Button variant={params.status === "CONFIRMED" ? "default" : "outline"} size="sm">
              Confirmed ({counts.confirmed})
            </Button>
          </Link>
          <Link href="/landlord/bookings?status=COMPLETED">
            <Button variant={params.status === "COMPLETED" ? "default" : "outline"} size="sm">
              Completed ({counts.completed})
            </Button>
          </Link>
          <Link href="/landlord/bookings?status=CANCELLED">
            <Button variant={params.status === "CANCELLED" ? "default" : "outline"} size="sm">
              Cancelled ({counts.cancelled})
            </Button>
          </Link>
        </div>

        {/* Bookings Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={booking.user.image || ""} />
                            <AvatarFallback className="bg-violet-100 text-violet-600">
                              {getInitials(booking.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{booking.user.name}</p>
                            <p className="text-sm text-gray-500">{booking.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/rooms/${booking.room.id}`} className="font-medium hover:text-violet-600">
                          {booking.room.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(booking.checkIn)}</span>
                          <span>→</span>
                          <span>{formatDate(booking.checkOut)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{booking.guests}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(booking.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {booking.user.email && (
                              <DropdownMenuItem asChild>
                                <a href={`mailto:${booking.user.email}`}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Contact Guest
                                </a>
                              </DropdownMenuItem>
                            )}
                            {booking.status === "PENDING" && (
                              <>
                                <DropdownMenuItem className="text-green-600">
                                  <Check className="h-4 w-4 mr-2" />
                                  Confirm Booking
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <X className="h-4 w-4 mr-2" />
                                  Decline Booking
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-gray-500">
                  {params.status
                    ? `No ${params.status.toLowerCase()} bookings found.`
                    : "When guests book your rooms, they'll appear here."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LandlordLayout>
  );
}

