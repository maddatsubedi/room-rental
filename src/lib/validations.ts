import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["USER", "LANDLORD"]).default("USER"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Room schemas
export const roomSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["SINGLE", "DOUBLE", "STUDIO", "APARTMENT", "SHARED"]),
  price: z.number().positive("Price must be positive"),
  size: z.number().positive("Size must be positive"),
  location: z.string().min(3, "Location is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "Province is required"),
  zipCode: z.string().min(5, "Postal code is required"),
  country: z.string().default("Nepal"),
  amenities: z.array(z.string()),
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().positive(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
});

export const roomUpdateSchema = roomSchema.partial();

// Booking schemas
export const bookingSchema = z.object({
  roomId: z.string(),
  checkIn: z.string().or(z.date()),
  checkOut: z.string().or(z.date()),
  guests: z.number().int().positive(),
  notes: z.string().optional(),
});

// Review schemas
export const reviewSchema = z.object({
  roomId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

// User update schema
export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(["ADMIN", "LANDLORD", "USER"]).optional(),
});

// Search and filter schemas
export const roomSearchSchema = z.object({
  city: z.string().optional(),
  type: z.enum(["SINGLE", "DOUBLE", "STUDIO", "APARTMENT", "SHARED"]).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minGuests: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  page: z.number().default(1),
  limit: z.number().default(12),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type RoomSearchInput = z.infer<typeof roomSearchSchema>;
