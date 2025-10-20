import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showNumber?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  className,
  showNumber = false,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(maxRating)].map((_, index) => (
        <Star
          key={index}
          className={cn(
            sizeClasses[size],
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
      {showNumber && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
