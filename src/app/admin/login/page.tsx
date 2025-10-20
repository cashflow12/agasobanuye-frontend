// app/admin/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DebugView from "@/components/DebugView";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    mounted: false
  });
  const router = useRouter();

  // Debug data
  

  useEffect(() => {
    setStatus(prev => ({ ...prev, mounted: true }));
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("admin_token");
      if (token) {
        router.push("/admin/dashboard");
      }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus(prev => ({ ...prev, loading: true, error: "" }));

  try {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: formData.username,
        password: formData.password
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("Received token:", data.access_token); // Debug log
      localStorage.setItem("admin_token", data.access_token);
      console.log("Token stored:", localStorage.getItem("admin_token")); // Verify storage
      router.push("/admin/dashboard");
    } else {
        setStatus(prev => ({
          ...prev,
          error: data.detail || "Invalid credentials",
          loading: false
        }));
      }
    } catch (err) {
      setStatus(prev => ({
        ...prev,
        error: "Network error - check console",
        loading: false
      }));
      console.error("Login error:", err);
    }
  };

  if (!status.mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-200 p-2 rounded-lg"
                  disabled={status.loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-200 p-2 rounded-lg"
                  disabled={status.loading}
                />
              </div>
              {status.error && (
                <p className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                  {status.error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                disabled={status.loading}
              >
                {status.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      
    </>
  );
}