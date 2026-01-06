"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Bed, Bath, Star } from "lucide-react";
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
      <article className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
          <Image
            src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
            alt={room.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Rating Badge */}
          {avgRating > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-stone-900">{avgRating.toFixed(1)}</span>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-medium text-stone-700">
              {room.type.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-stone-500 text-sm mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{room.city}, {room.state}</span>
          </div>

          {/* Title */}
          <h3 className="font-medium text-stone-900 mb-3 line-clamp-1 group-hover:text-stone-600 transition-colors">
            {room.title}
          </h3>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {room.maxGuests}
            </span>
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {room.bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {room.bathrooms}
            </span>
          </div>

          {/* Amenities Preview */}
          {room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {room.amenities.slice(0, 3).map((amenity) => (
                <span 
                  key={amenity} 
                  className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-xs">
                  +{room.amenities.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="pt-4 border-t border-stone-100">
            <span className="text-lg font-medium text-stone-900">
              {formatCurrency(room.price)}
            </span>
            <span className="text-sm text-stone-500">/month</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

