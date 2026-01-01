import { Room, User, Booking, Review, Role, RoomStatus, BookingStatus, RoomType } from "@prisma/client";

export type { Role, RoomStatus, BookingStatus, RoomType };

export interface RoomWithLandlord extends Room {
  landlord: User;
}

export interface RoomWithDetails extends Room {
  landlord: User;
  bookings: Booking[];
  reviews: ReviewWithUser[];
  _count?: {
    bookings: number;
    reviews: number;
  };
}

export interface BookingWithDetails extends Booking {
  user: User;
  room: Room;
}

export interface ReviewWithUser extends Review {
  user: User;
}

export interface UserWithRooms extends User {
  rooms: Room[];
}

export interface UserWithBookings extends User {
  bookings: BookingWithDetails[];
}

export interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: BookingWithDetails[];
  roomsByStatus: Record<RoomStatus, number>;
  bookingsByStatus: Record<BookingStatus, number>;
  usersByRole: Record<Role, number>;
  monthlyRevenue: { month: string; revenue: number }[];
  topRooms: (Room & { _count: { bookings: number } })[];
}

export interface LandlordStats {
  totalRooms: number;
  activeRooms: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  recentBookings: BookingWithDetails[];
}

export interface UserStats {
  totalBookings: number;
  upcomingBookings: BookingWithDetails[];
  pastBookings: BookingWithDetails[];
  totalSpent: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchFilters {
  city?: string;
  type?: RoomType;
  minPrice?: number;
  maxPrice?: number;
  minGuests?: number;
  amenities?: string[];
  status?: RoomStatus;
}

export const AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "Heating",
  "Kitchen",
  "Washer",
  "Dryer",
  "Free Parking",
  "Pool",
  "Hot Tub",
  "Gym",
  "TV",
  "Workspace",
  "Balcony",
  "Garden",
  "Pet Friendly",
  "Smoke-Free",
  "24/7 Security",
  "Elevator",
  "Wheelchair Accessible",
] as const;

export const ROOM_TYPES = [
  { value: "SINGLE", label: "Single Room" },
  { value: "DOUBLE", label: "Double Room" },
  { value: "STUDIO", label: "Studio" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "SHARED", label: "Shared Room" },
] as const;

export const BOOKING_STATUSES = [
  { value: "PENDING", label: "Pending", color: "yellow" },
  { value: "CONFIRMED", label: "Confirmed", color: "green" },
  { value: "CANCELLED", label: "Cancelled", color: "red" },
  { value: "COMPLETED", label: "Completed", color: "blue" },
] as const;

export const ROOM_STATUSES = [
  { value: "AVAILABLE", label: "Available", color: "green" },
  { value: "OCCUPIED", label: "Occupied", color: "yellow" },
  { value: "MAINTENANCE", label: "Maintenance", color: "red" },
] as const;
