"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { userUpdateSchema } from "@/lib/validations";
import type { Role } from "@prisma/client";

export async function updateUser(userId: string, formData: FormData) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  // Only allow users to update their own profile or admins to update anyone
  if (session.user.id !== userId && session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const data: Record<string, unknown> = {};
  
  const name = formData.get("name");
  if (name) data.name = name;

  const email = formData.get("email");
  if (email) data.email = email;

  const phone = formData.get("phone");
  if (phone) data.phone = phone;

  const image = formData.get("image");
  if (image) data.image = image;

  // Only admin can update these fields
  if (session.user.role === "ADMIN") {
    const isActive = formData.get("isActive");
    if (isActive !== null) data.isActive = isActive === "true";

    const role = formData.get("role");
    if (role) data.role = role as Role;
  }

  const validatedFields = userUpdateSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  try {
    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email as string,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return { error: "Email already in use" };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: validatedFields.data,
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Update user error:", error);
    return { error: "Failed to update user" };
  }
}

export async function deleteUser(userId: string) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  // Prevent admin from deleting themselves
  if (session.user.id === userId) {
    return { error: "Cannot delete your own account" };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user" };
  }
}

export async function toggleUserStatus(userId: string) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { error: "User not found" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return { error: "Failed to update user status" };
  }
}

export async function updateUserRole(userId: string, role: Role) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Update user role error:", error);
    return { error: "Failed to update user role" };
  }
}
