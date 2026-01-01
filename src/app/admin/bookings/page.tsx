import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, MoreHorizontal, Eye, Check, X, Calendar } from "lucide-react";

interface SearchParams {
  status?: string;
  search?: string;
  page?: string;
}

async function getBookings(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (searchParams.status && searchParams.status !== "all") {
    where.status = searchParams.status;
  }

  if (searchParams.search) {
    where.OR = [
      { user: { name: { contains: searchParams.search, mode: "insensitive" } } },
      { room: { title: { contains: searchParams.search, mode: "insensitive" } } },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        room: {
          select: { id: true, title: true, city: true },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total, page, totalPages: Math.ceil(total / limit) };
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const { bookings, total, page, totalPages } = await getBookings(params);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-500">Manage all bookings on the platform</p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <form>
                  <Input
                    placeholder="Search by user or room..."
                    className="pl-10"
                    name="search"
                    defaultValue={params.search}
                  />
                </form>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/admin/bookings?status=all">
                  <Button variant={!params.status || params.status === "all" ? "default" : "outline"} size="sm">
                    All
                  </Button>
                </Link>
                <Link href="/admin/bookings?status=PENDING">
                  <Button variant={params.status === "PENDING" ? "default" : "outline"} size="sm">
                    Pending
                  </Button>
                </Link>
                <Link href="/admin/bookings?status=CONFIRMED">
                  <Button variant={params.status === "CONFIRMED" ? "default" : "outline"} size="sm">
                    Confirmed
                  </Button>
                </Link>
                <Link href="/admin/bookings?status=CANCELLED">
                  <Button variant={params.status === "CANCELLED" ? "default" : "outline"} size="sm">
                    Cancelled
                  </Button>
                </Link>
                <Link href="/admin/bookings?status=COMPLETED">
                  <Button variant={params.status === "COMPLETED" ? "default" : "outline"} size="sm">
                    Completed
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>All Bookings ({total})</CardTitle>
          </CardHeader>
          <CardContent>
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
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
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
                        <div>
                          <Link href={`/rooms/${booking.room.id}`} className="font-medium hover:text-violet-600">
                            {booking.room.title}
                          </Link>
                          <p className="text-sm text-gray-500">{booking.room.city}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(booking.checkIn)}</span>
                          <span>-</span>
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
                            {booking.status === "PENDING" && (
                              <>
                                <DropdownMenuItem className="text-green-600">
                                  <Check className="h-4 w-4 mr-2" />
                                  Confirm Booking
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} bookings
                </p>
                <div className="flex gap-2">
                  <Link href={`/admin/bookings?page=${page - 1}${params.status ? `&status=${params.status}` : ""}`}>
                    <Button variant="outline" size="sm" disabled={page <= 1}>
                      Previous
                    </Button>
                  </Link>
                  <Link href={`/admin/bookings?page=${page + 1}${params.status ? `&status=${params.status}` : ""}`}>
                    <Button variant="outline" size="sm" disabled={page >= totalPages}>
                      Next
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

