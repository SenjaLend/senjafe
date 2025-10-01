"use client";
import React from "react";
import { useState, useEffect } from "react";
import SplashScreen from "./splash-screen";
import { splashUtils } from "@/utils/splash";
import { ChainProvider } from "@/lib/chain";

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const [showSplash, setShowSplash] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if splash screen should be shown
    // Uses sessionStorage - splash will show on new tabs/windows but not on refresh
    const shouldShow = splashUtils.shouldShowSplash();
    setShowSplash(shouldShow);
    setIsLoading(false);
  }, []);

  const handleSplashFinish = () => {
    // Mark that user has seen the splash screen in this session
    splashUtils.markSplashSeen();
    setShowSplash(false);
  };

  // Show minimal loading state while checking sessionStorage
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-peach-coral-purple flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
      </div>
    );
  }

  // Show splash screen for eligible users
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} duration={2500} />;
  }

  // Show main app content
  return (
    <ChainProvider>
      {children}
    </ChainProvider>
  );
}
