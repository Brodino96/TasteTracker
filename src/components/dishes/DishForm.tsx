import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export function DishForm() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!restaurantId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to add a dish",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl;

      // Upload image if provided
      if (imageFile) {
        try {
          // Always attempt to create the bucket first
          await supabase.storage.createBucket("images", {
            public: true,
            fileSizeLimit: 1024 * 1024 * 2, // 2MB file size limit
          });
        } catch (bucketError: any) {
          // If bucket already exists or we don"t have permission, continue anyway
          // The upload will fail if the bucket truly doesn"t exist
          console.log("Bucket creation attempted:", bucketError.message);
        }

        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `dishes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, imageFile);

        if (uploadError) {
          toast({
            title: "Image upload failed",
            description: "Unable to upload image. Please try again later or contact support.",
            variant: "destructive",
          });
          throw new Error("Image upload failed");
        }

        const { data } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }

      // Parse price to number if provided
      const parsedPrice = price ? parseFloat(price) : null;

      // Insert dish data
      const { error } = await supabase.from("dishes").insert({
        restaurant_id: restaurantId,
        name,
        description,
        price: parsedPrice,
        image_url: imageUrl,
        created_by: user.id,
      }).select();

      if (error) throw error;

      toast({
        title: "Dish added",
        description: "Your dish has been added successfully",
      });

      // Navigate back to restaurant page
      navigate(`/restaurants/${restaurantId}`);
    } catch (error: any) {
      toast({
        title: "Error adding dish",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Dish</CardTitle>
        <CardDescription>
          Add a new dish to the restaurant
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dish Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price (Optional)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Dish Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Upload an image of the dish (optional)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Dish"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}