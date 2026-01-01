import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, MoreHorizontal, Eye, Edit, Trash2, MapPin, Star } from "lucide-react";

interface SearchParams {
  status?: string;
  search?: string;
  page?: string;
}

async function getRooms(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (searchParams.status && searchParams.status !== "all") {
    where.status = searchParams.status;
  }

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { city: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        landlord: {
          select: { name: true, email: true },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    }),
    prisma.room.count({ where }),
  ]);

  return { rooms, total, page, totalPages: Math.ceil(total / limit) };
}

export default async function AdminRoomsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const { rooms, total, page, totalPages } = await getRooms(params);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Rooms</h1>
          <p className="text-gray-500">Manage all room listings on the platform</p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <form>
                  <Input
                    placeholder="Search rooms by title or city..."
                    className="pl-10"
                    name="search"
                    defaultValue={params.search}
                  />
                </form>
              </div>
              <div className="flex gap-2">
                <Link href="/admin/rooms?status=all">
                  <Button variant={!params.status || params.status === "all" ? "default" : "outline"} size="sm">
                    All
                  </Button>
                </Link>
                <Link href="/admin/rooms?status=AVAILABLE">
                  <Button variant={params.status === "AVAILABLE" ? "default" : "outline"} size="sm">
                    Available
                  </Button>
                </Link>
                <Link href="/admin/rooms?status=OCCUPIED">
                  <Button variant={params.status === "OCCUPIED" ? "default" : "outline"} size="sm">
                    Occupied
                  </Button>
                </Link>
                <Link href="/admin/rooms?status=MAINTENANCE">
                  <Button variant={params.status === "MAINTENANCE" ? "default" : "outline"} size="sm">
                    Maintenance
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>All Rooms ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Landlord</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-gray-100">
                            {room.images.length > 0 ? (
                              <Image
                                src={room.images[0]}
                                alt={room.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{room.title}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {room.city}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{room.landlord.name}</p>
                          <p className="text-sm text-gray-500">{room.landlord.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(room.price)}/night</TableCell>
                      <TableCell>
                        <Badge variant={
                          room.status === "AVAILABLE" ? "default" :
                          room.status === "OCCUPIED" ? "secondary" : "destructive"
                        }>
                          {room.status}
                        </Badge>
                        {room.featured && (
                          <Badge className="ml-1 bg-amber-500">Featured</Badge>
                        )}
                      </TableCell>
                      <TableCell>{room._count.bookings}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span>{room._count.reviews}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/rooms/${room.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Room
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Room
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No rooms found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} rooms
                </p>
                <div className="flex gap-2">
                  <Link href={`/admin/rooms?page=${page - 1}${params.status ? `&status=${params.status}` : ""}`}>
                    <Button variant="outline" size="sm" disabled={page <= 1}>
                      Previous
                    </Button>
                  </Link>
                  <Link href={`/admin/rooms?page=${page + 1}${params.status ? `&status=${params.status}` : ""}`}>
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

