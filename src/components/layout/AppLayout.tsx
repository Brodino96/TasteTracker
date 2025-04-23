import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Toaster } from "@/components/ui/toaster";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}