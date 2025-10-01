"use client";

import { SwapInterface } from "@/components/swap/swap-interface";
import { memo, useCallback } from "react";
import { Token } from "@/types";
import { useSwapCollateral } from "@/hooks/write/useSwapCollateral";
import { useCurrentChainId } from "@/lib/chain";

export default memo(function SwapPage() {
  const currentChainId = useCurrentChainId();

  const {
    handleSwapCollateral,
    isSwapping,
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
  } = useSwapCollateral(currentChainId, () => {
    // Swap completed successfully
  });

  const handleSwap = useCallback(
    async (
      fromToken: Token,
      toToken: Token,
      amount: string,
      selectedPoolAddress?: string,
      userPositionAddress?: string
    ) => {
      if (selectedPoolAddress && userPositionAddress) {
        try {
          // Execute the swap directly
          await handleSwapCollateral(
            userPositionAddress as `0x${string}`,
            fromToken.addresses[currentChainId] as `0x${string}`,
            toToken.addresses[currentChainId] as `0x${string}`,
            amount,
            fromToken.decimals || 18
          );
        } catch {
          // Handle swap error silently
        }
      }
    },
    [handleSwapCollateral, currentChainId]
  );

  return (
    <div className="min-h-screen">
      <div className="relative z-10 flex justify-center pt-8 pb-4 px-3">
        <div className="w-full max-w-xl mx-auto">
          <SwapInterface
            onSwap={handleSwap}
            isSwapping={isSwapping}
            showSuccessAlert={showSuccessAlert}
            showFailedAlert={showFailedAlert}
            errorMessage={errorMessage}
            successTxHash={successTxHash}
            onCloseSuccessAlert={handleCloseSuccessAlert}
            onCloseFailedAlert={handleCloseFailedAlert}
          />
        </div>
      </div>
    </div>
  );
});
