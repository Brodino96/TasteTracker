import { Link } from "react-router-dom";
import { Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ModeToggle } from "../mode-toggle";

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Utensils className="h-6 w-6 text-primary" />
          <span>TasteTracker</span>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle/>
          {user ? (
            <>
              <Link to="/restaurants">
                <Button variant="ghost">Ristoranti</Button>
              </Link>
              <Button onClick={signOut} variant="ghost">
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline">Registrati</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}