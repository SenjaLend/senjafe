import { ReactNode } from "react";

interface ProfileLayoutProps {
  children: ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {children}
      </div>
    </div>
  );
}
