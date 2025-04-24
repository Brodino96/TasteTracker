import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <Utensils className="h-16 w-16 mb-6 mx-auto text-primary" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Traccia i Tuoi Piatti Preferiti
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Crea Recensioni, condividi opinioni e scopri nuovi piatti preferiti con i tuoi amici.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link to="/restaurants">
                  <Button size="lg" className="w-full sm:w-auto">
                    Cerca Ristoranti
                  </Button>
                </Link>
                <Link to="/restaurants/new">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Aggiungi Ristorante
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button size="lg" className="w-full sm:w-auto">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Crea Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Come Funziona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Aggiungi Ristorante</h3>
              <p className="text-muted-foreground">
                Inizia con l'aggiungere i tuoi ristoranti preferiti.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Traccia i piatti</h3>
              <p className="text-muted-foreground">
                Aggiungi piatti individualmente con descrizioni e fotografie.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Vota & Recensisci</h3>
              <p className="text-muted-foreground">
                Dai voti tra 1-10 stelle e aggiungi note sulla tua esperienza.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} TasteTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}