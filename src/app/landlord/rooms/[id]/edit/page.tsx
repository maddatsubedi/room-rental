"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LandlordLayout } from "@/components/layout/landlord-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/custom/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus, X, ImagePlus } from "lucide-react";
import Link from "next/link";

const ROOM_TYPES = [
  { value: "SINGLE", label: "Single Room" },
  { value: "DOUBLE", label: "Double Room" },
  { value: "STUDIO", label: "Studio" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "SHARED", label: "Shared Room" },
];

const AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "Heating",
  "TV",
  "Kitchen",
  "Washer",
  "Dryer",
  "Parking",
  "Pool",
  "Gym",
  "Hot Tub",
  "Balcony",
  "Garden",
  "BBQ",
  "Fireplace",
  "Workspace",
  "Pet Friendly",
  "Smoke Detector",
  "First Aid Kit",
  "Fire Extinguisher",
];

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "SINGLE",
    price: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    location: "",
    size: "",
    bedrooms: "1",
    bathrooms: "1",
    maxGuests: "2",
    amenities: [] as string[],
    images: [] as string[],
    featured: false,
    status: "AVAILABLE",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch room");
        }

        const room = data.data;
        setFormData({
          title: room.title || "",
          description: room.description || "",
          type: room.type || "SINGLE",
          price: room.price?.toString() || "",
          address: room.address || "",
          city: room.city || "",
          state: room.state || "",
          zipCode: room.zipCode || "",
          country: room.country || "USA",
          location: room.location || "",
          size: room.size?.toString() || "",
          bedrooms: room.bedrooms?.toString() || "1",
          bathrooms: room.bathrooms?.toString() || "1",
          maxGuests: room.maxGuests?.toString() || "2",
          amenities: room.amenities || [],
          images: room.images || [],
          featured: room.featured || false,
          status: room.status || "AVAILABLE",
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load room");
        router.push("/landlord/rooms");
      } finally {
        setFetching(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleAddImage = () => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData({ ...formData, images: [...formData.images, imageUrl] });
      setImageUrl("");
    }
  };

  const handleRemoveImage = (url: string) => {
    setFormData({
      ...formData,
      images: formData.images.filter((img) => img !== url),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          location: formData.location || `${formData.city}, ${formData.state}`,
          price: parseFloat(formData.price),
          size: parseFloat(formData.size),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          maxGuests: parseInt(formData.maxGuests),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && typeof data.error === "object") {
          const fieldErrors: Record<string, string> = {};
          for (const [field, messages] of Object.entries(data.error)) {
            if (Array.isArray(messages) && messages.length > 0) {
              fieldErrors[field] = messages[0] as string;
            }
          }
          setErrors(fieldErrors);
          toast.error("Please fix the validation errors");
          return;
        }
        throw new Error(typeof data.error === "string" ? data.error : "Failed to update room");
      }

      toast.success("Room updated successfully!");
      router.push("/landlord/rooms");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <LandlordLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </LandlordLayout>
    );
  }

  return (
    <LandlordLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/landlord/rooms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Room</h1>
            <p className="text-gray-500">Update your room listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the basic details about your room</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Room Title *"
                id="title"
                name="title"
                placeholder="e.g., Cozy Downtown Studio with City Views"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
              />

              <Input
                as="textarea"
                label="Description *"
                id="description"
                name="description"
                placeholder="Describe your room in detail..."
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Room Type *" wrapperOnly error={errors.type}>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Input>

                <Input
                  label="Monthly Rent (Rs.) *"
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="8000"
                  value={formData.price}
                  onChange={handleChange}
                  error={errors.price}
                />
              </div>

              <Input label="Status" wrapperOnly error={errors.status}>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OCCUPIED">Occupied</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </Input>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where is your room located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Street Address *"
                id="address"
                name="address"
                placeholder="123 Main Street, Apt 4B"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="City *"
                  id="city"
                  name="city"
                  placeholder="Kathmandu"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                />

                <Input
                  label="Province *"
                  id="state"
                  name="state"
                  placeholder="Bagmati"
                  value={formData.state}
                  onChange={handleChange}
                  error={errors.state}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Postal Code *"
                  id="zipCode"
                  name="zipCode"
                  placeholder="44600"
                  value={formData.zipCode}
                  onChange={handleChange}
                  error={errors.zipCode}
                />

                <Input
                  label="Country"
                  id="country"
                  name="country"
                  placeholder="Nepal"
                  value={formData.country}
                  onChange={handleChange}
                  error={errors.country}
                />
              </div>
            </CardContent>
          </Card>

          {/* Room Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Room Details</CardTitle>
              <CardDescription>Specify the room specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                  label="Size (m²) *"
                  id="size"
                  name="size"
                  type="number"
                  min="1"
                  placeholder="45"
                  value={formData.size}
                  onChange={handleChange}
                  error={errors.size}
                />

                <Input label="Bedrooms *" wrapperOnly error={errors.bedrooms}>
                  <Select
                    value={formData.bedrooms}
                    onValueChange={(value) => handleSelectChange("bedrooms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Input>

                <Input label="Bathrooms *" wrapperOnly error={errors.bathrooms}>
                  <Select
                    value={formData.bathrooms}
                    onValueChange={(value) => handleSelectChange("bathrooms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Input>

                <Input label="Max Guests *" wrapperOnly error={errors.maxGuests}>
                  <Select
                    value={formData.maxGuests}
                    onValueChange={(value) => handleSelectChange("maxGuests", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Input>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>Select the amenities available in your room</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AMENITIES.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <label
                      htmlFor={amenity}
                      className="text-sm cursor-pointer"
                    >
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Add image URLs for your room (you can use Unsplash or any image hosting)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Paste image URL here..."
                value={imageUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                rightComponent={
                  <Button type="button" onClick={handleAddImage} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Room image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <ImagePlus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Add images to showcase your room</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Toggle */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: checked as boolean })
                  }
                />
                <label
                  htmlFor="featured"
                  className="text-sm font-medium cursor-pointer"
                >
                  Mark as Featured Room
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Featured rooms get highlighted on the homepage and search results
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Link href="/landlord/rooms">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
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
          </div>
        </form>
      </div>
    </LandlordLayout>
  );
}
