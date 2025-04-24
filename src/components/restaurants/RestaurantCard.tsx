import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/types";
import { Pencil } from "lucide-react";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-[16/9] relative bg-muted">
        {restaurant.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/20">
            <span className="text-muted-foreground">Nessun immagine</span>
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-1">{restaurant.name}</CardTitle>
        <CardDescription className="line-clamp-2">{restaurant.address}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {restaurant.description || "No description available."}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link to={`/restaurants/${restaurant.id}`} className="flex-1">
          <Button variant="default" className="w-full">
            Guarda Piatti
          </Button>
        </Link>
        <Link to={`/restaurants/${restaurant.id}/edit`}>
          <Button variant="outline" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}