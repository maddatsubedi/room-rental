"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { roomSchema, roomUpdateSchema } from "@/lib/validations";
import type { RoomType, RoomStatus } from "@prisma/client";

export async function createRoom(formData: FormData) {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN")) {
    return { error: "Unauthorized" };
  }

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    type: formData.get("type") as RoomType,
    price: parseFloat(formData.get("price") as string),
    size: parseFloat(formData.get("size") as string),
    location: formData.get("location") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    zipCode: formData.get("zipCode") as string,
    country: (formData.get("country") as string) || "USA",
    amenities: JSON.parse(formData.get("amenities") as string || "[]"),
    maxGuests: parseInt(formData.get("maxGuests") as string) || 1,
    bedrooms: parseInt(formData.get("bedrooms") as string) || 1,
    bathrooms: parseInt(formData.get("bathrooms") as string) || 1,
    images: JSON.parse(formData.get("images") as string || "[]"),
    featured: formData.get("featured") === "true",
  };

  const validatedFields = roomSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    const room = await prisma.room.create({
      data: {
        ...validatedFields.data,
        landlordId: session.user.id,
      },
    });

    revalidatePath("/landlord/rooms");
    revalidatePath("/rooms");
    return { success: true, room };
  } catch (error) {
    console.error("Create room error:", error);
    return { error: "Failed to create room" };
  }
}

export async function updateRoom(roomId: string, formData: FormData) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return { error: "Room not found" };
  }

  if (room.landlordId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const data: Record<string, unknown> = {};
  
  const fields = ["title", "description", "type", "location", "address", "city", "state", "zipCode", "country"];
  fields.forEach(field => {
    const value = formData.get(field);
    if (value) data[field] = value;
  });

  const numericFields = ["price", "size"];
  numericFields.forEach(field => {
    const value = formData.get(field);
    if (value) data[field] = parseFloat(value as string);
  });

  const intFields = ["maxGuests", "bedrooms", "bathrooms"];
  intFields.forEach(field => {
    const value = formData.get(field);
    if (value) data[field] = parseInt(value as string);
  });

  const amenities = formData.get("amenities");
  if (amenities) data.amenities = JSON.parse(amenities as string);

  const images = formData.get("images");
  if (images) data.images = JSON.parse(images as string);

  const featured = formData.get("featured");
  if (featured !== null) data.featured = featured === "true";

  const status = formData.get("status");
  if (status) data.status = status as RoomStatus;

  const validatedFields = roomUpdateSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: validatedFields.data,
    });

    revalidatePath("/landlord/rooms");
    revalidatePath(`/rooms/${roomId}`);
    revalidatePath("/rooms");
    return { success: true, room: updatedRoom };
  } catch (error) {
    console.error("Update room error:", error);
    return { error: "Failed to update room" };
  }
}

export async function deleteRoom(roomId: string) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return { error: "Room not found" };
  }

  if (room.landlordId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.room.delete({
      where: { id: roomId },
    });

    revalidatePath("/landlord/rooms");
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return { success: true };
  } catch (error) {
    console.error("Delete room error:", error);
    return { error: "Failed to delete room" };
  }
}

export async function toggleRoomStatus(roomId: string, status: RoomStatus) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return { error: "Room not found" };
  }

  if (room.landlordId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.room.update({
      where: { id: roomId },
      data: { status },
    });

    revalidatePath("/landlord/rooms");
    revalidatePath(`/rooms/${roomId}`);
    return { success: true };
  } catch (error) {
    console.error("Toggle room status error:", error);
    return { error: "Failed to update room status" };
  }
}
