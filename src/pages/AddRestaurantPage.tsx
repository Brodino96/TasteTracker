import { RestaurantForm } from "@/components/restaurants/RestaurantForm";

export function AddRestaurantPage() {
  return (
    <div className="container max-w-screen-xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Aggiungi un nuovo ristorante</h1>
      <RestaurantForm />
    </div>
  );
}