"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface FarcasterProviderProps {
  children: React.ReactNode;
}

export default function FarcasterProvider({ children }: FarcasterProviderProps) {
  useEffect(() => {
    // Initialize Farcaster SDK when the app is ready
    const initializeFarcaster = async () => {
      try {
        // Wait for the app to be fully loaded and ready to display
        await sdk.actions.ready();
        console.log("Farcaster SDK initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Farcaster SDK:", error);
      }
    };

    initializeFarcaster();
  }, []);

  return <>{children}</>;
}
