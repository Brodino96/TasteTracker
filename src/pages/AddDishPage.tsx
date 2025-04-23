import { DishForm } from "@/components/dishes/DishForm";

export function AddDishPage() {
  return (
    <div className="container max-w-screen-xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Dish</h1>
      <DishForm />
    </div>
  );
}