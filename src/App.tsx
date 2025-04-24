import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { RestaurantsPage } from "@/pages/RestaurantsPage";
import { RestaurantDetailPage } from "@/pages/RestaurantDetailPage";
import { AddRestaurantPage } from "@/pages/AddRestaurantPage";
import { AddDishPage } from "@/pages/AddDishPage";
import { DishDetailPage } from "@/pages/DishDetailPage";
import { EditRestaurantPage } from "@/pages/EditRestaurantPage";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="signin" element={<SignInPage />} />
              <Route path="signup" element={<SignUpPage />} />
              
              <Route 
                path="restaurants" 
                element={
                  <ProtectedRoute>
                    <RestaurantsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="restaurants/new" 
                element={
                  <ProtectedRoute>
                    <AddRestaurantPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="restaurants/:restaurantId" 
                element={
                  <ProtectedRoute>
                    <RestaurantDetailPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="restaurants/:id/edit" 
                element={
                  <ProtectedRoute>
                    <EditRestaurantPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="restaurants/:restaurantId/dishes/new" 
                element={
                  <ProtectedRoute>
                    <AddDishPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="restaurants/:restaurantId/dishes/:dishId" 
                element={
                  <ProtectedRoute>
                    <DishDetailPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;