"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { logoUtils } from "@/utils/logo";

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export default function SplashScreen({
  onFinish,
  duration = 2500,
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [logoAnimated, setLogoAnimated] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Preload and cache logo
  useEffect(() => {
    logoUtils
      .preloadLogo()
      .then(() => {
        setLogoLoaded(true);
      })
      .catch(() => {
        // Even if preload fails, show the component (Next.js Image will handle fallback)
        setLogoLoaded(true);
      });
  }, []);

  useEffect(() => {
    // Start logo animation after logo is loaded and a short delay
    const logoTimer = setTimeout(() => {
      if (logoLoaded) {
        setLogoAnimated(true);
      }
    }, 300);

    // Start fade out process
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Give time for fade out animation before calling onFinish
      setTimeout(() => {
        setIsVisible(false);
        onFinish();
      }, 500);
    }, duration);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(timer);
    };
  }, [duration, onFinish, logoLoaded]);

  // Prevent scroll during splash screen
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-peach-coral-purple transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
        <div
          className="absolute top-1/3 -right-10 w-32 h-32 bg-white/5 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-10 left-1/3 w-24 h-24 bg-white/10 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Gradient orbs - adjusted colors to match peach-coral theme */}
        <div
          className="absolute top-1/4 left-1/4 w-20 h-20 bg-gradient-to-r from-orange-300 to-pink-400 rounded-full opacity-20 animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-30 animate-ping"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center space-y-6 md:space-y-8 lg:space-y-10 z-10">
        {/* Logo with enhanced animation */}
        <div
          className={`transform transition-all duration-1000 ease-out ${
            logoAnimated && logoLoaded
              ? "scale-100"
              : "scale-75 opacity-0"
          }`}
        >
          <div className="bg-[#ffffff46] rounded-full shadow-2xl flex items-center justify-center">
            {logoLoaded ? (
              <Image
                src={logoUtils.getLogoUrl()}
                alt="Senja Logo"
                width={200}
                height={200}
                className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 drop-shadow-lg object-contain rounded-lg"
                priority
                quality={90}
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 bg-white/20 rounded-lg animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/30 rounded-full animate-bounce"></div>
              </div>
            )}
          </div>
        </div>

        {/* App name with staggered animation */}
        <div className="text-center space-y-2 md:space-y-3">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white animate-fade-in-up drop-shadow-lg">
            Senja
          </h1>
          <p
            className="text-base md:text-lg lg:text-xl text-white/90 animate-fade-in-up drop-shadow-md"
            style={{ animationDelay: "0.3s" }}
          >
            Crosschain Lending Protocol
          </p>
        </div>

        {/* Enhanced loading indicator */}
        <div
          className="flex space-x-2 md:space-x-3 lg:space-x-4 animate-fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-white/70 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-white/70 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-white/70 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>

      {/* Bottom content */}
      <div
        className="absolute bottom-16 left-0 right-0 text-center animate-fade-in-up"
        style={{ animationDelay: "1s" }}
      >
        <p className="text-white/80 text-sm font-medium tracking-wide">
          Powered by Layer Zero
        </p>
      </div>
    </div>
  );
}
