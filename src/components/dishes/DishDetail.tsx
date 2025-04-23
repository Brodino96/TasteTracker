import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { StarRating } from "@/components/reviews/StarRating";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { Dish, Restaurant, Review } from "@/types";

export function DishDetail() {
  const { restaurantId, dishId } = useParams<{ restaurantId: string; dishId: string }>();
  const [dish, setDish] = useState<Dish | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!restaurantId || !dishId) return;
      
      try {
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", restaurantId)
          .single();

        if (restaurantError) throw restaurantError;
        setRestaurant(restaurantData);

        // Fetch dish details
        const { data: dishData, error: dishError } = await supabase
          .from("dishes")
          .select("*")
          .eq("id", dishId)
          .single();

        if (dishError) throw dishError;
        setDish(dishData);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*")
          .eq("dish_id", dishId)
          .order("created_at", { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

        // Calculate average rating
        if (reviewsData && reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / reviewsData.length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [restaurantId, dishId]);

  const handleReviewAdded = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    
    // Recalculate average rating
    const totalRating = [...reviews, newReview].reduce((sum, review) => sum + review.rating, 0);
    setAverageRating(totalRating / (reviews.length + 1));
  };

  if (!restaurantId || !dishId) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/restaurants/${restaurantId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to {restaurant?.name || "restaurant"}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ) : dish ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <div className="rounded-lg overflow-hidden bg-muted aspect-[4/3]">
                {dish.image_url ? (
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground">No image available</span>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold">{dish.name}</h2>
              
              <div className="flex items-center">
                <StarRating rating={averageRating || 0} max={10} readOnly size="lg" />
                <span className="ml-2 font-semibold text-lg">
                  {averageRating ? averageRating.toFixed(1) : "No ratings yet"}
                </span>
                <span className="ml-2 text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>

              {dish.price && (
                <p className="text-lg font-medium">${dish.price.toFixed(2)}</p>
              )}
              
              <p className="text-muted-foreground">
                {dish.description || "No description available."}
              </p>
              
              <Separator />
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-4">Add Your Review</h3>
                  <ReviewForm dishId={dishId} onReviewAdded={handleReviewAdded} />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Reviews</h3>
            <ReviewList reviews={reviews} />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Dish not found</h3>
          <p className="text-muted-foreground mb-6">
            This dish may have been removed
          </p>
          <Link to={`/restaurants/${restaurantId}`}>
            <Button>
              Return to Restaurant
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}