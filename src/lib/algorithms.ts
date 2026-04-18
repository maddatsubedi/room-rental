export type RoomSortOption = "featured" | "price-asc" | "price-desc" | "newest";

type SortableRoom = {
  price: number;
  featured?: boolean;
  createdAt: Date | string;
};

type ListingWithReviews = SortableRoom & {
  reviews?: { rating: number }[];
};

function toTimestamp(value: Date | string): number {
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function shouldSwapBySortOption<T extends SortableRoom>(
  left: T,
  right: T,
  sortBy: RoomSortOption
): boolean {
  switch (sortBy) {
    case "price-asc":
      return left.price > right.price;
    case "price-desc":
      return left.price < right.price;
    case "newest":
      return toTimestamp(left.createdAt) < toTimestamp(right.createdAt);
    case "featured":
    default:
      if (Boolean(left.featured) !== Boolean(right.featured)) {
        return !left.featured && Boolean(right.featured);
      }
      return toTimestamp(left.createdAt) < toTimestamp(right.createdAt);
  }
}

export function bubbleSortRooms<T extends SortableRoom>(
  items: T[],
  sortBy: RoomSortOption = "featured"
): T[] {
  const sorted = [...items];

  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = 0; j < sorted.length - i - 1; j++) {
      if (shouldSwapBySortOption(sorted[j], sorted[j + 1], sortBy)) {
        [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
      }
    }
  }

  return sorted;
}

function getListingScore(room: ListingWithReviews): number {
  const ratings = room.reviews ?? [];
  const reviewCount = ratings.length;
  const avgRating = reviewCount
    ? ratings.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  const featuredBoost = room.featured ? 1000 : 0;
  const ratingScore = avgRating * 100;
  const reviewScore = reviewCount * 5;

  return featuredBoost + ratingScore + reviewScore;
}

export function getTopListings<T extends ListingWithReviews>(
  rooms: T[],
  limit = 6
): T[] {
  const sorted = [...rooms];

  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = 0; j < sorted.length - i - 1; j++) {
      const left = sorted[j];
      const right = sorted[j + 1];

      const leftScore = getListingScore(left);
      const rightScore = getListingScore(right);

      const shouldSwap =
        leftScore < rightScore ||
        (leftScore === rightScore &&
          toTimestamp(left.createdAt) < toTimestamp(right.createdAt));

      if (shouldSwap) {
        [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
      }
    }
  }

  return sorted.slice(0, limit);
}