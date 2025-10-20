// app/admin/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import MovieManager from "@/app/components/admin/MovieManager";
import SeriesManager from "@/app/components/admin/SeriesManager";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if no token
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("admin_token");
    // Redirect to login page
    router.push("/admin/login");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="movies" className="w-full">
        <TabsList>
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="series">TV Series</TabsTrigger>
        </TabsList>
        
        <TabsContent value="movies">
          <MovieManager />
        </TabsContent>
        
        <TabsContent value="series">
          <SeriesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}