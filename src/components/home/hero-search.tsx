"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, MapPin, Home } from "lucide-react";
import { ROOM_TYPES } from "@/types";

interface HeroSearchProps {
  cities: string[];
}

export function HeroSearch({ cities }: HeroSearchProps) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city && city !== "all") params.set("city", city);
    if (type && type !== "all") params.set("type", type);
    
    const queryString = params.toString();
    router.push(`/rooms${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="mt-10 p-2 bg-white rounded-2xl shadow-2xl">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* City Select */}
        <div className="flex-1 flex items-center gap-3 h-14 px-4 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors">
          <MapPin className="h-5 w-5 text-stone-500 shrink-0" />
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-full h-full border-0 bg-transparent p-0 shadow-none focus:ring-0 text-stone-900 font-medium">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-stone-200 self-center" />

        {/* Room Type Select */}
        <div className="flex-1 flex items-center gap-3 h-14 px-4 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors">
          <Home className="h-5 w-5 text-stone-500 shrink-0" />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full h-full border-0 bg-transparent p-0 shadow-none focus:ring-0 text-stone-900 font-medium">
              <SelectValue placeholder="Room type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ROOM_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button
          size="lg"
          onClick={handleSearch}
          className="h-14 px-8 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl w-full sm:w-auto"
        >
          Search
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
