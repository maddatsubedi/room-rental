"use server";

import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { registerSchema, loginSchema } from "@/lib/validations";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message || "Invalid credentials" };
  }

  const normalizedEmail = validatedFields.data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { isActive: true },
  });

  if (existingUser && !existingUser.isActive) {
    return { error: "Your account is deactivated. Please contact support." };
  }

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password: validatedFields.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const selectedRole = (formData.get("role") as string) || "USER";

  const validatedFields = registerSchema.safeParse({
    name,
    email,
    password,
    confirmPassword,
    role: selectedRole,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { role } = validatedFields.data;
  const normalizedEmail = validatedFields.data.email.toLowerCase();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return { error: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(validatedFields.data.password, 12);

    await prisma.user.create({
      data: {
        name: validatedFields.data.name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account" };
  }
}

export async function logout() {
  await signOut({ redirect: false });
  revalidatePath("/");
}
