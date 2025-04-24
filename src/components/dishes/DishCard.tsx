import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/reviews/StarRating";
import { Dish } from "@/types";

interface DishCardProps {
  dish: Dish;
  restaurantId: string;
}

export function DishCard({ dish, restaurantId }: DishCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-[16/9] relative bg-muted">
        {dish.image_url ? (
          <img
            src={dish.image_url}
            alt={dish.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/20">
            <span className="text-muted-foreground">Nessuna immagine</span>
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-1">{dish.name}</CardTitle>
        {dish.price && (
          <CardDescription className="font-medium">
            ${dish.price.toFixed(2)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center mb-2">
          <StarRating rating={dish.avg_rating || 0} max={10} readOnly />
          <span className="ml-2 text-sm font-medium">
            {dish.avg_rating ? dish.avg_rating.toFixed(1) : "No ratings"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {dish.description || "No description available."}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/restaurants/${restaurantId}/dishes/${dish.id}`} className="w-full">
          <Button variant="default" className="w-full">
            View & Rate
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}