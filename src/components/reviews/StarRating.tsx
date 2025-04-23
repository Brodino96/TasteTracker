import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  max = 10,
  onChange,
  readOnly = false,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };
  
  const starSize = sizes[size];
  
  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index);
    }
  };

  return (
    <div 
      className={cn(
        "flex",
        {
          "cursor-pointer": !readOnly,
          "gap-0.5": size === "sm",
          "gap-1": size === "md",
          "gap-1.5": size === "lg",
        }
      )}
      onMouseLeave={() => !readOnly && setHoverRating(0)}
    >
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating;
        
        return (
          <Star
            key={index}
            className={cn(
              starSize,
              "transition-all duration-100",
              isFilled 
                ? "text-yellow-500 fill-yellow-500" 
                : "text-muted stroke-muted-foreground",
              !readOnly && "hover:scale-110"
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
          />
        );
      })}
    </div>
  );
}