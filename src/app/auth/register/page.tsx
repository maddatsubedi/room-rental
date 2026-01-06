"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/custom/Input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Loader2, AlertCircle, ArrowLeft, Home, Building } from "lucide-react";
import { register } from "@/actions/auth";
import { toast } from "sonner";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "USER";
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState(defaultRole);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    formData.set("role", selectedRole);
    
    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success("Account created successfully! Please sign in.");
        router.push("/auth/login");
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
            <h1 className="text-2xl font-serif text-stone-900 mb-2">Create your account</h1>
            <p className="text-stone-500">
              Join RentSpace and start exploring
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Role Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-stone-700 mb-3 block">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("USER")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectedRole === "USER"
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <Home className={`h-5 w-5 ${selectedRole === "USER" ? "text-stone-900" : "text-stone-400"}`} />
                <span className={`text-sm font-medium ${selectedRole === "USER" ? "text-stone-900" : "text-stone-600"}`}>
                  Find a space
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("LANDLORD")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectedRole === "LANDLORD"
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <Building className={`h-5 w-5 ${selectedRole === "LANDLORD" ? "text-stone-900" : "text-stone-400"}`} />
                <span className={`text-sm font-medium ${selectedRole === "LANDLORD" ? "text-stone-900" : "text-stone-600"}`}>
                  List property
                </span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              leftIcon={<User className="h-4 w-4" />}
            />

            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Button
              type="submit"
              className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white font-medium"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-stone-500">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-stone-700 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-stone-700 hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-stone-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200')",
          }}
        />
        <div className="absolute inset-0 bg-stone-900/40" />
        <div className="absolute inset-0 flex items-end p-12">
          <div className="max-w-md">
            <blockquote className="text-white/90 text-xl font-serif leading-relaxed mb-4">
              &ldquo;Listing my property was effortless. Within a week, I had my first booking.&rdquo;
            </blockquote>
            <cite className="text-white/70 text-sm not-italic">
              — Michael R., Property Owner
            </cite>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterLoading() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterForm />
    </Suspense>
  );
}

