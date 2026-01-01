"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Bed, Bath, Star, Heart, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "@prisma/client";

interface RoomCardProps {
  room: Room & {
    _count?: {
      reviews: number;
    };
    reviews?: { rating: number }[];
  };
}

export function RoomCard({ room }: RoomCardProps) {
  const avgRating = room.reviews?.length
    ? room.reviews.reduce((acc, r) => acc + r.rating, 0) / room.reviews.length
    : 0;

  return (
    <Link href={`/rooms/${room.id}`}>
      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl cursor-pointer">
        <div className="relative aspect-4/3 overflow-hidden">
          <Image
            src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
            alt={room.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {room.featured && (
              <Badge className="bg-linear-to-r from-amber-500 to-orange-500 border-0 shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge className="bg-white/95 text-gray-800 shadow-lg border-0 font-medium">
              {room.type.replace("_", " ")}
            </Badge>
          </div>

          {/* Favorite Button */}
          <button 
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
          </button>

          {/* Price & Rating */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(room.price)}
                </span>
                <span className="text-white/80 text-sm">/night</span>
              </div>
              {avgRating > 0 && (
                <div className="flex items-center gap-1 bg-white/95 px-3 py-1.5 rounded-full shadow-lg">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <h3 className="font-bold text-xl mb-2 group-hover:text-violet-600 transition-colors line-clamp-1">
            {room.title}
          </h3>
          
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
            <MapPin className="h-4 w-4 text-violet-500" />
            <span className="line-clamp-1">{room.city}, {room.state}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-gray-400" />
              <span>{room.maxGuests} guests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-gray-400" />
              <span>{room.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-gray-400" />
              <span>{room.bathrooms} bath</span>
            </div>
          </div>

          {/* Amenities Preview */}
          {room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {room.amenities.slice(0, 3).map((amenity) => (
                <span 
                  key={amenity} 
                  className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-600 text-xs font-medium">
                  +{room.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

