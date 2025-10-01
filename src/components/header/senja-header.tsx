import React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "../ui/card";

const SenjaHeader = () => {
  return (
    <Card className="fixed top-0 left-0 right-0 z-50 max-w-xl mx-auto p-1 bg-[var(--electric-blue)]/10 backdrop-blur-xl rounded-t-none border-t border-[var(--electric-blue)]/20 shadow-2xl mb-2">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--electric-blue)]/5 to-transparent rounded-t-3xl"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] p-0.5 shadow-lg">
            <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center">
              <Image
                src="/senja-logo.png"
                alt="Senja Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default SenjaHeader;
