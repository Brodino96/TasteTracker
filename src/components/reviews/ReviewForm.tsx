import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { StarRating } from "./StarRating";
import { Review } from "@/types";

interface ReviewFormProps {
  dishId: string;
  onReviewAdded: (review: Review) => void;
}

export function ReviewForm({ dishId, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to add a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.from("reviews").insert({
        dish_id: dishId,
        user_id: user.id,
        rating,
        notes: notes.trim() || null,
      }).select();

      if (error) throw error;

      toast({
        title: "Review added",
        description: "Your review has been added successfully",
      });

      // Reset form
      setRating(0);
      setNotes("");
      
      // Notify parent component
      if (data && data.length > 0) {
        onReviewAdded(data[0] as Review);
      }
    } catch (error: any) {
      toast({
        title: "Error adding review",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Your Rating</Label>
        <div className="flex items-center">
          <StarRating
            rating={rating}
            onChange={setRating}
            max={10}
            size="lg"
          />
          <span className="ml-2 text-muted-foreground">
            {rating > 0 ? `${rating}/10` : "Select rating"}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Share your thoughts about this dish..."
          rows={3}
        />
      </div>
      
      <Button 
        type="submit"
        className="w-full"
        disabled={isLoading || !user}
      >
        {isLoading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}