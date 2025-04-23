import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Review } from "@/types";

interface ReviewListProps {
  reviews: Review[];
}

interface UserData {
  [key: string]: {
    email: string;
  };
}

export function ReviewList({ reviews }: ReviewListProps) {
  const [users, setUsers] = useState<UserData>({});

  useEffect(() => {
    async function fetchUserData() {
      const userIds = [...new Set(reviews.map((review) => review.user_id))];
      
      if (userIds.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, email")
          .in("id", userIds);

        if (error) throw error;

        const userData: UserData = {};
        data?.forEach((user) => {
          userData[user.id] = { email: user.email };
        });
        
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const userInitial = users[review.user_id]?.email?.charAt(0).toUpperCase() || "?";
        const userEmail = users[review.user_id]?.email || "Anonymous";
        const reviewDate = new Date(review.created_at);
        
        return (
          <Card key={review.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{userEmail}</CardTitle>
                    <CardDescription>
                      {format(reviewDate, "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                </div>
                <StarRating rating={review.rating} max={10} readOnly />
              </div>
            </CardHeader>
            {review.notes && (
              <CardContent className="pt-2">
                <p className="text-sm">{review.notes}</p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}