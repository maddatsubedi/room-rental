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
import { formatDate, getInitials } from "@/lib/utils";
import { Search, MoreHorizontal, UserPlus, Filter, Eye, Edit, Trash2 } from "lucide-react";

interface SearchParams {
  role?: string;
  search?: string;
  page?: string;
}

async function getUsers(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (searchParams.role && searchParams.role !== "all") {
    where.role = searchParams.role;
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { email: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            rooms: true,
            bookings: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const { users, total, page, totalPages } = await getUsers(params);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-gray-500">Manage all users on the platform</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <form>
                  <Input
                    placeholder="Search users by name or email..."
                    className="pl-10"
                    name="search"
                    defaultValue={params.search}
                  />
                </form>
              </div>
              <div className="flex gap-2">
                <Link href="/admin/users?role=all">
                  <Button variant={!params.role || params.role === "all" ? "default" : "outline"} size="sm">
                    All
                  </Button>
                </Link>
                <Link href="/admin/users?role=USER">
                  <Button variant={params.role === "USER" ? "default" : "outline"} size="sm">
                    Users
                  </Button>
                </Link>
                <Link href="/admin/users?role=LANDLORD">
                  <Button variant={params.role === "LANDLORD" ? "default" : "outline"} size="sm">
                    Landlords
                  </Button>
                </Link>
                <Link href="/admin/users?role=ADMIN">
                  <Button variant={params.role === "ADMIN" ? "default" : "outline"} size="sm">
                    Admins
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>All Users ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Rooms</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="bg-violet-100 text-violet-600">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          user.role === "ADMIN" ? "default" :
                          user.role === "LANDLORD" ? "secondary" : "outline"
                        }>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user._count.rooms}</TableCell>
                      <TableCell>{user._count.bookings}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} users
                </p>
                <div className="flex gap-2">
                  <Link href={`/admin/users?page=${page - 1}${params.role ? `&role=${params.role}` : ""}`}>
                    <Button variant="outline" size="sm" disabled={page <= 1}>
                      Previous
                    </Button>
                  </Link>
                  <Link href={`/admin/users?page=${page + 1}${params.role ? `&role=${params.role}` : ""}`}>
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

