"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserLayout } from "@/components/layout/user-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/custom/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, User, Mail, Phone, Camera } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { userUpdateSchema } from "@/lib/validations";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    setFormData((prev) => ({
      ...prev,
      name: session.user.name || "",
      email: session.user.email || "",
      image: session.user.image || "",
    }));

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        if (!response.ok) return;

        const result = await response.json();
        if (!result?.success || !isMounted) return;

        setFormData((prev) => ({
          ...prev,
          name: result.data?.name || prev.name,
          email: result.data?.email || prev.email,
          phone: result.data?.phone || "",
          image: result.data?.image || "",
        }));
      } catch {
        // Keep existing form state if the profile request fails.
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, session?.user?.name, session?.user?.email, session?.user?.image]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() === "" ? null : formData.phone.trim(),
      image: formData.image.trim() === "" ? null : formData.image.trim(),
    };

    const validated = userUpdateSchema.safeParse(payload);

    if (!validated.success) {
      const fieldErrors = validated.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0] || "",
        email: fieldErrors.email?.[0] || "",
        phone: fieldErrors.phone?.[0] || "",
        image: fieldErrors.image?.[0] || "",
      });
      toast.error("Please fix the highlighted fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.data),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      const updatedUser = data.data;

      setFormData((prev) => ({
        ...prev,
        name: updatedUser?.name || prev.name,
        email: updatedUser?.email || prev.email,
        phone: updatedUser?.phone || "",
        image: updatedUser?.image || "",
      }));

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser?.name || formData.name,
          image: updatedUser?.image || undefined,
        },
      });

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-500">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center pb-0">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.image || ""} />
                  <AvatarFallback className="bg-linear-to-br from-violet-600 to-indigo-600 text-white text-2xl">
                    {getInitials(formData.name || session.user.name)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
            <CardTitle>{session.user.name}</CardTitle>
            <CardDescription>{session.user.email}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar URL */}
              <Input
                label="Profile Image URL"
                id="image"
                name="image"
                placeholder="https://example.com/avatar.jpg"
                value={formData.image}
                onChange={handleChange}
                error={errors.image}
                description="Enter a URL for your profile picture"
              />

              <Separator />

              {/* Name */}
              <Input
                label="Full Name"
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                leftIcon={<User className="h-4 w-4" />}
                error={errors.name}
              />

              {/* Email */}
              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                description="Email cannot be changed"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email}
              />

              {/* Phone */}
              <Input
                label="Phone Number"
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={<Phone className="h-4 w-4" />}
                error={errors.phone}
              />

              <Separator />

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Account Type</p>
                <p className="text-sm text-gray-500">Your role on the platform</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-600 text-sm font-medium">
                {session.user.role}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Member Since</p>
                <p className="text-sm text-gray-500">When you joined RoomRental</p>
              </div>
              <span className="text-gray-600">2024</span>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-0 shadow-sm border-red-100">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              This will permanently delete your account and all associated data
            </p>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}

