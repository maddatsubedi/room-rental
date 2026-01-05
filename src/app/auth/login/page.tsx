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
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-stone-900 flex items-center justify-center">
              <span className="text-white font-serif text-xl font-semibold">R</span>
            </div>
            <span className="font-serif text-xl text-stone-900">RentSpace</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-serif text-stone-900 mb-2">Welcome back</h1>
            <p className="text-stone-500">
              Sign in to continue to your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form action={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-stone-700">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white font-medium"
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

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-stone-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-stone-900 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200')",
          }}
        />
        <div className="absolute inset-0 bg-stone-900/40" />
        <div className="absolute inset-0 flex items-end p-12">
          <div className="max-w-md">
            <blockquote className="text-white/90 text-xl font-serif leading-relaxed mb-4">
              &ldquo;The best platform for finding unique stays. Simple, clean, and trustworthy.&rdquo;
            </blockquote>
            <cite className="text-white/70 text-sm not-italic">
              — Sarah J., Digital Nomad
            </cite>
          </div>
        </div>
      </div>
    </div>
  );
}

