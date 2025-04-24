import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PlusCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DishCard } from "@/components/dishes/DishCard";
import { supabase } from "@/lib/supabase";
import { Dish, Restaurant } from "@/types";

export function DishList() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurantAndDishes() {
      if (!restaurantId) return;
      
      try {
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", restaurantId)
          .single();

        if (restaurantError) throw restaurantError;
        setRestaurant(restaurantData);

        // Fetch dishes with average ratings
        const { data: dishesData, error: dishesError } = await supabase
          .from("dishes")
          .select(`
            *,
            avg_rating:reviews(rating)
          `)
          .eq("restaurant_id", restaurantId)
          .order("created_at", { ascending: false });

        if (dishesError) throw dishesError;
        
        // Process the data to calculate average rating
        const processedDishes = dishesData.map((dish: any) => {
          const ratings = dish.avg_rating || [];
          const avgRating = ratings.length 
            ? ratings.reduce((sum: number, review: any) => sum + review.rating, 0) / ratings.length
            : undefined;
            
          return {
            ...dish,
            avg_rating: avgRating
          };
        });
        
        setDishes(processedDishes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurantAndDishes();
  }, [restaurantId]);

  if (!restaurantId) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Link to="/restaurants" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Ritorna ai ristoranti
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">
            {loading ? (
              <Skeleton className="h-9 w-64" />
            ) : (
              restaurant?.name || "Ristoranti"
            )}
          </h2>
          {!loading && restaurant?.address && (
            <p className="text-muted-foreground mt-1">{restaurant.address}</p>
          )}
        </div>
        <Link to={`/restaurants/${restaurantId}/dishes/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Aggiunti piatto
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : dishes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} restaurantId={restaurantId} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-lg font-semibold mb-2">Ancora nessun piatto</h3>
          <p className="text-muted-foreground mb-6">
            Aggiungi il primo piatto a questo ristorante
          </p>
          <Link to={`/restaurants/${restaurantId}/dishes/new`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Aggiungi piatto
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}