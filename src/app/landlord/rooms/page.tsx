import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LandlordLayout } from "@/components/layout/landlord-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, MoreHorizontal, Eye, Edit, Trash2, MapPin, Star, Users, Bed } from "lucide-react";

async function getLandlordRooms(landlordId: string) {
  const rooms = await prisma.room.findMany({
    where: { landlordId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
  });

  return rooms;
}

export default async function LandlordRoomsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
    redirect("/");
  }

  const rooms = await getLandlordRooms(session.user.id);

  return (
    <LandlordLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Rooms</h1>
            <p className="text-gray-500">Manage your room listings</p>
          </div>
          <Link href="/landlord/rooms/new">
            <Button className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Room
            </Button>
          </Link>
        </div>

        {/* Rooms Grid */}
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className="border-0 shadow-sm overflow-hidden group">
                {/* Image */}
                <div className="relative aspect-4/3 bg-gray-100">
                  {room.images.length > 0 ? (
                    <Image
                      src={room.images[0]}
                      alt={room.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant={
                      room.status === "AVAILABLE" ? "default" :
                      room.status === "OCCUPIED" ? "secondary" : "destructive"
                    }>
                      {room.status}
                    </Badge>
                    {room.featured && (
                      <Badge className="ml-2 bg-amber-500">Featured</Badge>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/rooms/${room.id}`}>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Public Page
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/landlord/rooms/${room.id}/edit`}>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Room
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{room.title}</h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
                    <MapPin className="h-3 w-3" />
                    {room.city}, {room.state}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{room.maxGuests}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{room.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span>{room._count.reviews}</span>
                    </div>
                  </div>

                  {/* Price & Bookings */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <span className="text-lg font-bold">{formatCurrency(room.price)}</span>
                      <span className="text-gray-500">/night</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {room._count.bookings} booking{room._count.bookings !== 1 ? "s" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="mb-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
                  <Plus className="h-8 w-8 text-violet-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No rooms yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start by adding your first room to begin receiving bookings and earning revenue.
              </p>
              <Link href="/landlord/rooms/new">
                <Button className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Room
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </LandlordLayout>
  );
}

