import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export function EditRestaurantForm() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast({
          title: "Errore",
          description: "Richiesta dati fallita",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setName(data.name);
        setDescription(data.description || "");
        setAddress(data.address);
      }
    };

    fetchRestaurant();
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Errore di Autenticazione",
        description: "Devi essere loggato per poter modificare un ristorante",
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

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }

      // Update restaurant data
      const { error } = await supabase
        .from("restaurants")
        .update({
          name,
          description,
          address,
          ...(imageUrl ? { image_url: imageUrl } : {}),
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Ristorante Aggiornato",
        description: "Il ristorante è stato aggiornato con successo",
      });

      navigate(`/restaurants/${id}`);
    } catch (error: any) {
      toast({
        title: "Aggiornamento Fallito",
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
        <CardTitle>Modifica Ristorante</CardTitle>
        <CardDescription>
          Aggirona le informazioni del ristorante.
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
            <Label htmlFor="image">Immagine</Label>
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
              Carica una nuova immagine del ristorante (Opzionale)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Restaurant"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}