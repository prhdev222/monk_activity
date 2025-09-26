"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { initLiff, isLineLoggedIn, isInClient } from "@/lib/line";

interface LiffContextType {
  liffReady: boolean;
  isLoggedIn: boolean;
  isInLineApp: boolean;
  error: string | null;
}

const LiffContext = createContext<LiffContextType>({
  liffReady: false,
  isLoggedIn: false,
  isInLineApp: false,
  error: null,
});

export const useLiff = () => useContext(LiffContext);

interface LiffProviderProps {
  children: ReactNode;
}

export default function LiffProvider({ children }: LiffProviderProps) {
  const [liffReady, setLiffReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInLineApp, setIsInLineApp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        const success = await initLiff();
        setLiffReady(success);
        
        if (success) {
          setIsLoggedIn(isLineLoggedIn());
          setIsInLineApp(isInClient());
        }
      } catch (err) {
        console.error("LIFF initialization error:", err);
        setError(err instanceof Error ? err.message : "LIFF initialization failed");
        setLiffReady(false);
      }
    };

    // Only initialize LIFF if we have the required environment variables
    if (process.env.NEXT_PUBLIC_LINE_LIFF_ID) {
      initializeLiff();
    } else {
      console.warn("LINE LIFF ID not configured");
    }
  }, []);

  const value: LiffContextType = {
    liffReady,
    isLoggedIn,
    isInLineApp,
    error,
  };

  return (
    <LiffContext.Provider value={value}>
      {children}
    </LiffContext.Provider>
  );
}