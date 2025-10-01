"use client";

import React, { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Token } from "@/types";
import { TokenSelectorDialog } from "./token-selector-dialog";
import Image from "next/image";

interface TokenSelectorProps {
  selectedToken?: Token;
  onTokenSelect: (token: Token) => void;
  otherToken?: Token;
  label: string;
  selectedPoolAddress?: string;
  showBalance?: boolean;
  isCollateralBalance?: boolean;
}

export const TokenSelector = memo(function TokenSelector({
  selectedToken,
  onTokenSelect,
  otherToken,
  label,
  selectedPoolAddress,
  showBalance = false,
  isCollateralBalance = false,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        className={`h-12 px-4 text-base font-medium rounded-xl transition-all duration-300 border-2 border-[var(--electric-blue)]/30 hover:border-[var(--electric-blue)] bg-white/10 backdrop-blur-sm hover:bg-[var(--electric-blue)]/20 hover:shadow-md focus:border-[var(--electric-blue)] focus:ring-2 focus:ring-[var(--electric-blue)]/30 focus:outline-none shadow-sm ${
          !selectedToken ? "text-white/70" : "text-white"
        }`}
      >
        {selectedToken ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={selectedToken.logo}
                  alt={selectedToken.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback =  
                      e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.classList.remove("hidden");
                      fallback.classList.add("flex");
                    }
                  }}
                />
                <div className="w-full h-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] items-center justify-center text-white text-xs font-semibold hidden">
                  {selectedToken.symbol.charAt(0)}
                </div>
              </div>
              <span className="text-gray-900 font-semibold text-base">
                {selectedToken.symbol}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Select token</span>
        )}
      </Button>

      <TokenSelectorDialog
        isOpen={isOpen}
        onClose={handleClose}
        onTokenSelect={handleTokenSelect}
        otherToken={otherToken}
        title={label}
        selectedPoolAddress={selectedPoolAddress}
        showBalance={showBalance}
        isCollateralBalance={isCollateralBalance}
      />
    </>
  );
});

// Export all token selector components
export { TokenSearch } from "./token-search";
export { TokenSelectorDialog } from "./token-selector-dialog";
export { TokenSearchOnly } from "./token-search-only";
