"use client";

import React, { useCallback, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TokenSearch } from "./token-search";
import { Token } from "@/types";

interface TokenSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSelect: (token: Token) => void;
  otherToken?: Token;
  title?: string;
  showPopularTokens?: boolean;
  selectedPoolAddress?: string;
  showBalance?: boolean;
  isCollateralBalance?: boolean;
}

export const TokenSelectorDialog = memo(function TokenSelectorDialog({
  isOpen,
  onClose,
  onTokenSelect,
  otherToken,
  title = "Select token",
  showPopularTokens = true,
  selectedPoolAddress,
  showBalance = false,
  isCollateralBalance = false,
}: TokenSelectorDialogProps) {
  const handleTokenSelect = useCallback((token: Token) => {
    onTokenSelect(token);
    onClose();
  }, [onTokenSelect, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[400px] mx-auto bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto p-4 border shadow-2xl rounded-2xl">
        <DialogHeader className="text-left">
          <div className="flex">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-bold text-white">{title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <TokenSearch
            onTokenSelect={handleTokenSelect}
            otherToken={otherToken}
            showPopularTokens={showPopularTokens}
            selectedPoolAddress={selectedPoolAddress}
            showBalance={showBalance}
            isCollateralBalance={isCollateralBalance}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
});
