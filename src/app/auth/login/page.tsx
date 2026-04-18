"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/custom/Input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { login } from "@/actions/auth";
import { loginSchema } from "@/lib/validations";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  if (session?.user) {
    const role = session.user.role;
    if (role === "ADMIN") router.push("/admin");
    else if (role === "LANDLORD") router.push("/landlord");
    else router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setFieldErrors({});

    const payload = {
      email: (formData.get("email") as string)?.trim(),
      password: (formData.get("password") as string) || "",
    };

    const validated = loginSchema.safeParse(payload);

    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0] || "",
        password: errors.password?.[0] || "",
      });
      setError("Please fix the highlighted fields.");
      return;
    }

    formData.set("email", validated.data.email);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success("Logged in successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-stone-900 flex items-center justify-center">
              <span className="text-white font-serif text-xl font-semibold">R</span>
            </div>
            <span className="font-serif text-xl text-stone-900">RentSpace</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-serif text-stone-900">Sign in</h1>
            <p className="text-stone-500 mt-1">Access your account to manage bookings and listings.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form action={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={fieldErrors.email}
              required
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={fieldErrors.password}
              required
            />

            <Button
              type="submit"
              className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white font-medium"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-stone-900 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

