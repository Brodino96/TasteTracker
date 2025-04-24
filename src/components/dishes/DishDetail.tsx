import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { StarRating } from "@/components/reviews/StarRating";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Dish, Restaurant, Review } from "@/types";
import { v4 as uuidv4 } from 'uuid';

export function DishDetail() {
  const { restaurantId, dishId } = useParams<{ restaurantId: string; dishId: string }>();
  const [dish, setDish] = useState<Dish | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !dishId) return;

    if (!user) {
      toast({
        title: "Errore di Autenticazione",
        description: "Devi essere loggato per poter aggiornare l'immagine del piatto.",
        variant: "destructive"
      });
      return;
    }

    if (dish?.created_by !== user.id) {
      toast({
        title: "Permesso Negato",
        description: "Solo il creatore del piatto può modificare la sua immagine.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Delete old image if exists
      if (dish?.image_url) {
        const oldPath = dish.image_url.split('/images/').pop();
        if (oldPath) {
          await supabase.storage
            .from('images')
            .remove([oldPath]);
        }
      }

      // Upload new image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `dishes/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Update dish record with new image URL
      const { error: updateError } = await supabase
        .from('dishes')
        .update({ image_url: publicUrl })
        .eq('id', dishId);

      if (updateError) throw updateError;

      // Update local state
      setDish(prev => prev ? { ...prev, image_url: publicUrl } : null);

      // Show success message
      toast({
        title: "Immagine Aggiornata",
        description: "L'immagine del piatto è stata aggiornata con successo."
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Fallito",
        description: error.message || "Upload dell'immagine fallito. Per favore prova di nuovo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReviewAdded = (newReview: Review) => {
    setReviews((prev) => {
      // Remove the old review if it exists (in case of an update)
      const filteredReviews = prev.filter(review => review.user_id !== newReview.user_id);
      return [newReview, ...filteredReviews];
    });
    
    // Recalculate average rating with the updated reviews list
    setReviews(currentReviews => {
      const totalRating = currentReviews.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating(totalRating / currentReviews.length);
      return currentReviews;
    });
  };

  if (!restaurantId || !dishId) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/restaurants/${restaurantId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Ritorna a {restaurant?.name || "ristorante"}
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
                    <span className="text-muted-foreground">Nessuna immagine disponibile</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Change Image'}
                </Button>
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
                <p className="text-lg font-medium">{dish.price.toFixed(2)}€</p>
              )}
              
              <p className="text-muted-foreground">
                {dish.description || "No description available."}
              </p>
              
              <Separator />
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-4">Aggiungi la tua Recensione</h3>
                  <ReviewForm dishId={dishId} onReviewAdded={handleReviewAdded} />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Recensioni</h3>
            <ReviewList reviews={reviews} />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Piatto non trovato</h3>
          <p className="text-muted-foreground mb-6">
            Questo piatto potrebbe esser stato rimosso o non esiste.
          </p>
          <Link to={`/restaurants/${restaurantId}`}>
            <Button>
              Ritorna ai ristoranti
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}