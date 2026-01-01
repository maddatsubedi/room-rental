"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { reviewSchema } from "@/lib/validations";

export async function createReview(formData: FormData) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: "Please login to leave a review" };
  }

  const data = {
    roomId: formData.get("roomId") as string,
    rating: parseInt(formData.get("rating") as string),
    comment: formData.get("comment") as string,
  };

  const validatedFields = reviewSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    // Check if user has a completed booking for this room
    const completedBooking = await prisma.booking.findFirst({
      where: {
        userId: session.user.id,
        roomId: data.roomId,
        status: "COMPLETED",
      },
    });

    if (!completedBooking) {
      return { error: "You can only review rooms you have stayed in" };
    }

    // Check if user already reviewed this room
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_roomId: {
          userId: session.user.id,
          roomId: data.roomId,
        },
      },
    });

    if (existingReview) {
      return { error: "You have already reviewed this room" };
    }

    await prisma.review.create({
      data: {
        roomId: data.roomId,
        userId: session.user.id,
        rating: data.rating,
        comment: data.comment,
      },
    });

    revalidatePath(`/rooms/${data.roomId}`);
    return { success: true };
  } catch (error) {
    console.error("Create review error:", error);
    return { error: "Failed to create review" };
  }
}

export async function deleteReview(reviewId: string) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    return { error: "Review not found" };
  }

  if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidatePath(`/rooms/${review.roomId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete review error:", error);
    return { error: "Failed to delete review" };
  }
}
