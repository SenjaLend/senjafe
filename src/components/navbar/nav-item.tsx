"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
}

export function NavItem({ name, href, icon: Icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-all duration-500 ease-out rounded-2xl mx-1 my-2 relative group",
        isActive
          ? "text-white"
          : "text-white/70 hover:text-white hover:bg-[var(--electric-blue)]/20"
      )}
    >
      {/* Active indicator background */}
      <div
        className={cn(
          "absolute inset-0 bg-[var(--electric-blue)] rounded-2xl shadow-lg -z-10 transition-all duration-500 ease-out",
          isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        style={{
          boxShadow:
            "0 8px 32px rgba(30, 144, 255, 0.3), 0 0 0 1px rgba(30, 144, 255, 0.1)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl transition-all duration-500"></div>
      </div>

      {/* Icon */}
      <div className="relative">
        <Icon
          className={cn(
            "w-6 h-6 transition-all duration-500 ease-out",
            isActive
              ? "scale-110 drop-shadow-lg text-white"
              : "group-hover:scale-105 group-hover:rotate-3 text-white/70 group-hover:text-white"
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-xs font-medium transition-all duration-500 ease-out",
          isActive
            ? "text-white drop-shadow-sm scale-105"
            : "text-white/70 group-hover:text-white group-hover:translate-y-[-1px] group-hover:scale-105"
        )}
      >
        {name}
      </span>

      {/* Hover effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl bg-[var(--electric-blue)]/20 transition-all duration-300 ease-out -z-10",
          isActive
            ? "opacity-0 scale-95"
            : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
        )}
      ></div>
    </Link>
  );
}
