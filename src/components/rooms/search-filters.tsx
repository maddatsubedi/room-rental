"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { AMENITIES, ROOM_TYPES } from "@/types";
import { useState, useTransition } from "react";

interface SearchFiltersProps {
  cities?: string[];
}

export function SearchFilters({ cities = [] }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minGuests: searchParams.get("minGuests") || "",
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) || [],
  });

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      
      if (filters.search) params.set("search", filters.search);
      if (filters.city) params.set("city", filters.city);
      if (filters.type) params.set("type", filters.type);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.minGuests) params.set("minGuests", filters.minGuests);
      if (filters.amenities.length > 0) params.set("amenities", filters.amenities.join(","));

      router.push(`/rooms?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      city: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      minGuests: "",
      amenities: [],
    });
    router.push("/rooms");
  };

  const hasActiveFilters =
    filters.city ||
    filters.type ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minGuests ||
    filters.amenities.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search rooms..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 h-12 border-gray-200"
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
        </div>

        {/* City Select */}
        <Select
          value={filters.city}
          onValueChange={(value) => updateFilters({ city: value })}
        >
          <SelectTrigger className="w-full md:w-48 h-12">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Room Type Select */}
        <Select
          value={filters.type}
          onValueChange={(value) => updateFilters({ type: value })}
        >
          <SelectTrigger className="w-full md:w-48 h-12">
            <SelectValue placeholder="Room type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ROOM_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* More Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-12 gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilters({ minPrice: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Minimum Guests</Label>
                <Input
                  type="number"
                  placeholder="Number of guests"
                  value={filters.minGuests}
                  onChange={(e) => updateFilters({ minGuests: e.target.value })}
                />
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Amenities</Label>
                <div className="grid grid-cols-2 gap-3">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={filters.amenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilters({
                              amenities: [...filters.amenities, amenity],
                            });
                          } else {
                            updateFilters({
                              amenities: filters.amenities.filter((a) => a !== amenity),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={amenity}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Search Button */}
        <Button
          onClick={applyFilters}
          disabled={isPending}
          className="h-12 px-8 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          {isPending ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.city && (
            <Badge city={filters.city} onRemove={() => updateFilters({ city: "" })} />
          )}
          {filters.type && (
            <Badge
              city={ROOM_TYPES.find((t) => t.value === filters.type)?.label || filters.type}
              onRemove={() => updateFilters({ type: "" })}
            />
          )}
          {filters.minPrice && (
            <Badge city={`Min: $${filters.minPrice}`} onRemove={() => updateFilters({ minPrice: "" })} />
          )}
          {filters.maxPrice && (
            <Badge city={`Max: $${filters.maxPrice}`} onRemove={() => updateFilters({ maxPrice: "" })} />
          )}
          {filters.amenities.map((amenity) => (
            <Badge
              key={amenity}
              city={amenity}
              onRemove={() =>
                updateFilters({
                  amenities: filters.amenities.filter((a) => a !== amenity),
                })
              }
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

function Badge({ city, onRemove }: { city: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm">
      {city}
      <button onClick={onRemove} className="hover:bg-violet-200 rounded-full p-0.5">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

