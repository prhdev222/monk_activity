"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userId = localStorage.getItem("currentUserId");
        const hasAccount = localStorage.getItem("hasAccount");
        
        if (userId && hasAccount === "true") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/login");
          }, 100);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600 mb-4">กำลังนำคุณไปยังหน้าลงทะเบียน...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
