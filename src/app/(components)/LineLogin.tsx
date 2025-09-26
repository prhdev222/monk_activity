"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  initLiff, 
  isLineLoggedIn, 
  lineLogin, 
  getLineAccessToken
} from "@/lib/line";
import { apiFetch } from "@/lib/fetch";

interface User {
  id: string;
  smokes: boolean;
  lineUserId?: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
  authProvider: string;
}

interface LineLoginProps {
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function LineLogin({ onSuccess, onError, className = "" }: LineLoginProps) {
  const [loading, setLoading] = useState(false);
  const [liffReady, setLiffReady] = useState(false);

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        const success = await initLiff();
        setLiffReady(success);
        
        // Check if already logged in via LIFF
        if (success && isLineLoggedIn()) {
          await handleLiffLogin();
        }
      } catch (error) {
        console.error("LIFF initialization error:", error);
        setLiffReady(false);
      }
    };

    initializeLiff();
  }, [handleLiffLogin]);

  const handleLiffLogin = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!isLineLoggedIn()) {
        lineLogin();
        return;
      }

      const accessToken = getLineAccessToken();
      if (!accessToken) {
        throw new Error("Failed to get access token");
      }

      // Send access token to backend for authentication
      const user = await apiFetch<User>("/api/auth/line/callback", {
        method: "POST",
        body: JSON.stringify({ accessToken }),
      });

      // Store user info in localStorage
      localStorage.setItem("currentUserId", user.id);
      localStorage.setItem("currentUserSmokes", String(user.smokes));
      localStorage.setItem("hasAccount", "true");
      localStorage.setItem("authProvider", "line");

      if (onSuccess) {
        onSuccess(user);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("LINE login error:", error);
      const errorMessage = "การเข้าสู่ระบบผ่าน LINE ล้มเหลว";
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const handleWebLogin = async () => {
    try {
      setLoading(true);
      
      // Get LINE login URL from backend
      const response = await apiFetch<{ loginUrl: string }>("/api/auth/line/login", {
        method: "POST",
      });

      // Redirect to LINE login
      window.location.href = response.loginUrl;
    } catch (error) {
      console.error("Web LINE login error:", error);
      const errorMessage = "ไม่สามารถเริ่มการเข้าสู่ระบบผ่าน LINE ได้";
      if (onError) {
        onError(errorMessage);
      }
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (liffReady) {
      handleLiffLogin();
    } else {
      handleWebLogin();
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className={`
        flex items-center justify-center gap-3 w-full px-4 py-3 
        bg-[#00B900] hover:bg-[#009900] disabled:bg-gray-400
        text-white font-medium rounded-lg transition-colors
        ${className}
      `}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="flex-shrink-0"
          >
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.628-.629.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          เข้าสู่ระบบด้วย LINE
        </>
      )}
    </button>
  );
}