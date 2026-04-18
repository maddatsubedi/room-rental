"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/custom/Input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, Loader2, AlertCircle, ArrowLeft, Home, Building } from "lucide-react";
import { register } from "@/actions/auth";
import { registerSchema } from "@/lib/validations";
import { toast } from "sonner";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "USER";
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setFieldErrors({});

    const payload = {
      name: (formData.get("name") as string)?.trim(),
      email: (formData.get("email") as string)?.trim(),
      password: (formData.get("password") as string) || "",
      confirmPassword: (formData.get("confirmPassword") as string) || "",
      role: selectedRole,
    };

    const validated = registerSchema.safeParse(payload);

    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0] || "",
        email: errors.email?.[0] || "",
        password: errors.password?.[0] || "",
        confirmPassword: errors.confirmPassword?.[0] || "",
        role: errors.role?.[0] || "",
      });
      setError("Please fix the highlighted fields.");
      return;
    }

    formData.set("name", validated.data.name);
    formData.set("email", validated.data.email);
    formData.set("password", validated.data.password);
    formData.set("confirmPassword", validated.data.confirmPassword);
    formData.set("role", validated.data.role);
    
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
            <h1 className="text-2xl font-serif text-stone-900">Create account</h1>
            <p className="text-stone-500 mt-1">Choose your role and start using the platform.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-5">
            <label className="text-sm font-medium text-stone-700 mb-2 block">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("USER")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selectedRole === "USER"
                    ? "border-stone-900 bg-stone-100 text-stone-900"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                <Home className="h-4 w-4" />
                Find room
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("LANDLORD")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selectedRole === "LANDLORD"
                    ? "border-stone-900 bg-stone-100 text-stone-900"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                <Building className="h-4 w-4" />
                List room
              </button>
            </div>
            {fieldErrors.role && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.role}</p>
            )}
          </div>

          <form action={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              leftIcon={<User className="h-4 w-4" />}
              error={fieldErrors.name}
              required
            />

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
              autoComplete="new-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={fieldErrors.password}
              required
            />

            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={fieldErrors.confirmPassword}
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-stone-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-xs text-center text-stone-500">
            By creating an account, you agree to our terms and privacy policy.
          </p>
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

