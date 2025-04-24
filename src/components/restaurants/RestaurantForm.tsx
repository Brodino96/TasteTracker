import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export function RestaurantForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Errore di autenticazione",
        description: "Devi essere loggato per aggiungere un ristorante",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `restaurants/${fileName}`;

        // First, ensure the bucket exists and is public
        const { error: bucketError } = await supabase
          .storage
          .getBucket("images");

        if (bucketError && bucketError.message.includes("does not exist")) {
          await supabase
            .storage
            .createBucket("images", { public: true });
        }

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }

      // Insert restaurant data
      const { data, error } = await supabase.from("restaurants").insert({
        name,
        description,
        address,
        image_url: imageUrl,
        created_by: user.id,
      }).select();

      if (error) throw error;

      toast({
        title: "Ristorante aggiunto",
        description: "Il ristorante è stato aggiunto con successo",
      });

      // Navigate to the restaurant page
      if (data && data.length > 0) {
        navigate(`/restaurants/${data[0].id}`);
      } else {
        navigate("/restaurants");
      }
    } catch (error: any) {
      toast({
        title: "Aggiunta ristorante fallita",
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
        <CardTitle>Aggiungi ristorante</CardTitle>
        <CardDescription>
          Aggiunti un nuovo ristorante per iniziare a recensire i piatti
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Ristorante</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Indirizzo</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Immagine Ristorante</Label>
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
              Carica un immagine del ristorante (Opzionale)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Restaurant"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}