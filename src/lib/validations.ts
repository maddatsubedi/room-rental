import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  role: z.enum(["USER", "LANDLORD"]).default("USER"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Room schemas
export const roomSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  type: z.enum(["SINGLE", "DOUBLE", "STUDIO", "APARTMENT", "SHARED"]),
  price: z.number().positive("Price must be positive"),
  size: z.number().positive("Size must be positive"),
  location: z.string().trim().min(3, "Location is required"),
  address: z.string().trim().min(5, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "Province is required"),
  zipCode: z.string().trim().min(3, "Postal code is required"),
  country: z.string().default("Nepal"),
  amenities: z.array(z.string().trim()).default([]),
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().positive(),
  images: z.array(z.string().trim().url("Each image must be a valid URL")).optional(),
  featured: z.boolean().default(false),
});

export const roomUpdateSchema = roomSchema.partial();

// Booking schemas
export const bookingSchema = z.object({
  roomId: z.string().min(1, "Room is required"),
  checkIn: z.coerce.date({ error: "Select a valid check-in date" }),
  checkOut: z.coerce.date({ error: "Select a valid check-out date" }),
  guests: z.number().int().positive("Guests must be at least 1"),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
  paymentMethod: z.enum(["CASH", "ESEWA"]).optional().default("CASH"),
})
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out date must be after check-in date",
    path: ["checkOut"],
  })
  .refine((data) => {
    const diffInDays = (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays >= 28;
  }, {
    message: "Minimum rental period is 1 month",
    path: ["checkOut"],
  });

// Review schemas
export const reviewSchema = z.object({
  roomId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Review must be at least 10 characters"),
});

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const emptyStringToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

// User update schema
export const userUpdateSchema = z.object({
  name: z.preprocess(
    emptyStringToUndefined,
    z.string().min(2, "Name must be at least 2 characters").max(80, "Name is too long")
  ).optional(),
  email: z.preprocess(
    emptyStringToUndefined,
    z.string().email("Enter a valid email address")
  ).optional(),
  phone: z.preprocess(
    emptyStringToNull,
    z
      .union([
        z.string().regex(/^[+0-9()\-\s]{7,20}$/, "Enter a valid phone number"),
        z.null(),
      ])
  ).optional(),
  image: z.preprocess(
    emptyStringToNull,
    z.union([z.string().url("Profile image must be a valid URL"), z.null()])
  ).optional(),
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
