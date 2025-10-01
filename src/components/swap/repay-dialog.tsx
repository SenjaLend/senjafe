"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { Token } from "@/types";
import { useRepayByCollateral } from "@/hooks/write/useRepayByCollateral";
import { useCurrentChainId } from "@/lib/chain";
import { useReadUserBorrowShares } from "@/hooks/read/useReadUserBorrowShares";
import { useReadUserCollateralBalance } from "@/hooks/read/useReadUserCollateralBalance";
import { useReadExchangeRate } from "@/hooks/read/useReadExchangeRate";
import { useRefetch } from "@/hooks/useRefetch";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { formatLargeNumber } from "@/utils/format";
import Image from "next/image";

interface RepayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPool: LendingPoolWithTokens;
  selectedToken: Token | null;
  borrowBalance: string;
  borrowLoading: boolean;
}

export const RepayDialog = ({
  isOpen,
  onClose,
  selectedPool,
  selectedToken,
  borrowBalance,
  borrowLoading,
}: RepayDialogProps) => {
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [inputMode, setInputMode] = useState<"collateral" | "borrow">("collateral");
  const currentChainId = useCurrentChainId();
  
  // Use refs to avoid infinite loops in useEffect
  const collateralAmountRef = useRef(collateralAmount);
  const borrowAmountRef = useRef(borrowAmount);
  
  // Update refs when state changes
  useEffect(() => {
    collateralAmountRef.current = collateralAmount;
  }, [collateralAmount]);
  
  useEffect(() => {
    borrowAmountRef.current = borrowAmount;
  }, [borrowAmount]);

  // Refetch functionality
  const { addRefetchFunction, removeRefetchFunction } = useRefetch({
    refetchInterval: 0,
    enabled: false,
  });

  // Use the borrow balance passed from parent
  const userBorrowSharesFormatted = borrowBalance;
  const userBorrowSharesLoading = borrowLoading;


  // Get collateral balance for the selected token
  const { 
    parsedUserCollateralBalance: collateralBalance, 
    userCollateralBalanceLoading: collateralLoading,
    refetchUserCollateralBalance
  } = useReadUserCollateralBalance(
    (selectedPool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    (selectedToken?.addresses[currentChainId] as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    selectedToken?.decimals || 18
  );

  // Calculate amount in for exchange rate - use collateral amount for initial calculation
  const amountIn = collateralAmount && parseFloat(collateralAmount) > 0
    ? Math.max(
        Math.floor(
          parseFloat(collateralAmount) * Math.pow(10, selectedToken?.decimals || 18)
        ),
        Math.pow(10, Math.max(0, (selectedToken?.decimals || 18) - 6))
      )
    : 0;

  // Get exchange rate from collateral to borrow token
  const { parsedExchangeRate: exchangeRate, exchangeRateLoading } =
    useReadExchangeRate(
      (selectedPool?.lendingPool as `0x${string}`) ||
        "0x0000000000000000000000000000000000000000",
      (selectedToken?.addresses[currentChainId] as `0x${string}`) ||
        "0x0000000000000000000000000000000000000000",
      (selectedPool?.borrowTokenInfo?.addresses[currentChainId] as `0x${string}`) ||
        "0x0000000000000000000000000000000000000000",
      amountIn,
      selectedToken?.decimals || 18,
      selectedPool?.borrowTokenInfo?.decimals || 18
    );

  // No need to calculate equivalent amounts as they are handled in input handlers

  // Handle input changes with automatic conversion
  const handleCollateralAmountChange = useCallback((value: string) => {
    setCollateralAmount(value);
    setInputMode("collateral");
    
    // Clear borrow amount when collateral is cleared
    if (!value || value === "0" || value === "0.") {
      setBorrowAmount("");
      return;
    }
    
    // Convert to borrow amount if exchange rate is available
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && exchangeRate > 0 && !exchangeRateLoading) {
      const equivalent = (numValue * exchangeRate).toFixed(8);
      setBorrowAmount(equivalent);
    }
  }, [exchangeRate, exchangeRateLoading]);

  const handleBorrowAmountChange = useCallback((value: string) => {
    setBorrowAmount(value);
    setInputMode("borrow");
    
    // Clear collateral amount when borrow is cleared
    if (!value || value === "0" || value === "0.") {
      setCollateralAmount("");
      return;
    }
    
    // Convert to collateral amount if exchange rate is available
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      // Use a default exchange rate of 1 if not available yet
      const rate = exchangeRate > 0 ? exchangeRate : 1;
      const equivalent = (numValue / rate).toFixed(8);
      setCollateralAmount(equivalent);
    }
  }, [exchangeRate]);

  // Real-time sync when exchange rate changes (only when rate updates, not on input changes)
  useEffect(() => {
    if (exchangeRate > 0 && !exchangeRateLoading) {
      if (inputMode === "collateral" && collateralAmountRef.current && parseFloat(collateralAmountRef.current) > 0) {
        const equivalent = (parseFloat(collateralAmountRef.current) * exchangeRate).toFixed(8);
        setBorrowAmount(equivalent);
      } else if (inputMode === "borrow" && borrowAmountRef.current && parseFloat(borrowAmountRef.current) > 0) {
        const equivalent = (parseFloat(borrowAmountRef.current) / exchangeRate).toFixed(8);
        setCollateralAmount(equivalent);
      }
    }
  }, [exchangeRate, exchangeRateLoading, inputMode]);
  
  // Still need refetch function for the repay hook
  const {
    refetchUserBorrowShares,
  } = useReadUserBorrowShares(
    (selectedPool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    selectedPool?.borrowTokenInfo?.decimals || 18
  );

  // Validate required parameters
  const isValidParams = selectedPool?.lendingPool && 
                       selectedPool?.borrowTokenInfo?.addresses?.[currentChainId] &&
                       selectedToken?.addresses?.[currentChainId];

  // Repay by collateral hook
  const {
    handleRepayLoan,
    isRepaying,
    isConfirming,
    isSuccess: isRepaySuccess,
    isError: isRepayError,
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
  } = useRepayByCollateral(
    currentChainId,
    (selectedPool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    (selectedToken?.addresses?.[currentChainId] as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    () => {
      setCollateralAmount("");
      // Refetch collateral balance after successful repay
      if (refetchUserCollateralBalance) {
        refetchUserCollateralBalance();
      }
      // Don't auto-close dialog, let user close it manually
    },
    refetchUserBorrowShares
  );

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCollateralAmount("");
      setBorrowAmount("");
      setInputMode("collateral");
    }
  }, [isOpen]);

  // Add refetch functions
  useEffect(() => {
    addRefetchFunction(refetchUserBorrowShares);

    return () => {
      removeRefetchFunction(refetchUserBorrowShares);
    };
  }, [
    addRefetchFunction,
    removeRefetchFunction,
    refetchUserBorrowShares,
  ]);

  const handleSetMaxCollateral = useCallback(() => {
    if (collateralBalance && parseFloat(collateralBalance.toString()) > 0) {
      setCollateralAmount(collateralBalance.toString());
      setInputMode("collateral");
      
      // Convert to borrow amount if exchange rate is available
      const numValue = parseFloat(collateralBalance.toString());
      if (!isNaN(numValue) && numValue > 0 && exchangeRate > 0 && !exchangeRateLoading) {
        const equivalent = (numValue * exchangeRate).toFixed(8);
        setBorrowAmount(equivalent);
      }
    }
  }, [collateralBalance, exchangeRate, exchangeRateLoading]);

  const handleSetMaxBorrow = useCallback(() => {
    if (userBorrowSharesFormatted && parseFloat(userBorrowSharesFormatted) > 0) {
      setBorrowAmount(userBorrowSharesFormatted);
      setInputMode("borrow");
      
      // Convert to collateral amount if exchange rate is available
      const numValue = parseFloat(userBorrowSharesFormatted);
      if (!isNaN(numValue) && numValue > 0) {
        const rate = exchangeRate > 0 ? exchangeRate : 1;
        const equivalent = (numValue / rate).toFixed(8);
        setCollateralAmount(equivalent);
      }
    }
  }, [userBorrowSharesFormatted, exchangeRate]);

  // No approval needed for repay by collateral

  const handleRepay = async () => {
    if (!isValidParams) {
      return;
    }

    if (!collateralAmount || parseFloat(collateralAmount) <= 0) {
      return;
    }

    try {
      await handleRepayLoan(
        collateralAmount,
        selectedToken?.decimals || 18
      );
    } catch {
      // Handle error silently
    }
  };

  const canRepay = isValidParams && 
                   ((collateralAmount && parseFloat(collateralAmount) > 0 && parseFloat(collateralAmount) <= parseFloat(collateralBalance?.toString() || "0")) ||
                    (borrowAmount && parseFloat(borrowAmount) > 0 && parseFloat(borrowAmount) <= parseFloat(userBorrowSharesFormatted || "0")));

  // Don't render dialog if no selectedPool or selectedToken
  if (!selectedPool || !selectedToken) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto bg-[var(--electric-blue)]/10 backdrop-blur-xl border border-[var(--electric-blue)]/30 w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white text-center">
            Repay by Collateral
          </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Collateral Token Info */}
            <Card className="p-4 bg-[var(--electric-blue)]/20 border border-[var(--electric-blue)]/30 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[var(--electric-blue)]/20 flex items-center justify-center overflow-hidden">
                  {selectedToken?.logo ? (
                    <Image
                      src={selectedToken.logo}
                      alt={selectedToken.symbol}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-white/80">
                      {selectedToken?.symbol?.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {selectedToken?.symbol}
                  </div>
                  <div className="text-xs text-white/70">Repay by collateral</div>
                </div>
              </div>
            </Card>

            {/* Exchange Rate */}
            {collateralAmount && exchangeRate > 0 && !exchangeRateLoading && (
              <div className="text-center text-sm text-gray-600">
                Exchange rate: 1 {selectedToken?.symbol} = {exchangeRate.toFixed(6)} {selectedPool.borrowTokenInfo?.symbol}
              </div>
            )}

            {/* Collateral Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Amount in {selectedToken?.symbol} (Input)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    Balance: {collateralLoading ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      formatLargeNumber(collateralBalance?.toString() || "0")
                    )}
                  </span>
                  {collateralBalance && parseFloat(collateralBalance.toString()) > 0 && (
                    <button
                      type="button"
                      onClick={handleSetMaxCollateral}
                      className="text-xs bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white px-2 py-1 rounded-md transition-colors"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>
              
              <div className="relative bg-[#004488]/50 backdrop-blur-sm rounded-lg p-3 border border-[var(--electric-blue)]/30">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={collateralAmount}
                  onChange={(e) => handleCollateralAmountChange(e.target.value)}
                  className="border-0 bg-transparent text-lg font-semibold placeholder:text-white/40 p-0 h-auto focus-visible:ring-0 text-white"
                />
                <div className="text-xs text-white/70 mt-1">
                  Enter {selectedToken?.symbol} amount to see equivalent {selectedPool.borrowTokenInfo?.symbol}
                </div>
              </div>
            </div>

            {/* Conversion Arrow */}
            {(collateralAmount && parseFloat(collateralAmount) > 0) || (borrowAmount && parseFloat(borrowAmount) > 0) ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-[var(--electric-blue)]/30 flex items-center justify-center border border-[var(--electric-blue)]/50">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
            ) : null}

            {/* Borrow Token Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Amount in {selectedPool.borrowTokenInfo?.symbol} (Repay Amount)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    Balance: {userBorrowSharesLoading ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      formatLargeNumber(userBorrowSharesFormatted || "0")
                    )}
                  </span>
                  {userBorrowSharesFormatted && parseFloat(userBorrowSharesFormatted) > 0 && (
                    <button
                      type="button"
                      onClick={handleSetMaxBorrow}
                      className="text-xs bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white px-2 py-1 rounded-md transition-colors"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>
              
              <div className="relative bg-[#004488]/50 backdrop-blur-sm rounded-lg p-3 border border-[var(--electric-blue)]/30">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={borrowAmount}
                  onChange={(e) => handleBorrowAmountChange(e.target.value)}
                  className="border-0 bg-transparent text-lg font-semibold placeholder:text-white/40 p-0 h-auto focus-visible:ring-0 text-white"
                />
                <div className="text-xs text-white/70 mt-1">
                  Enter {selectedPool.borrowTokenInfo?.symbol} amount to see equivalent {selectedToken?.symbol}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  This amount will be converted to borrow shares for repayment
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-2">
              <Button
                onClick={handleRepay}
                disabled={!canRepay || isRepaying}
                className="w-full h-12 text-sm font-semibold bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white disabled:opacity-50 rounded-xl shadow-lg transition-all duration-200"
              >
                {isRepaying ? "Repaying..." : `Repay by ${selectedToken?.symbol}`}
              </Button>
            </div>

            {/* Transaction Status */}
            <div className="space-y-2">
              {isRepaying && (
                <div className="flex items-center gap-3 text-[var(--electric-blue)]">
                  <div className="w-4 h-4 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold text-white">Processing repay request...</span>
                </div>
              )}

              {isConfirming && (
                <div className="flex items-center gap-3 text-[var(--electric-blue)]">
                  <div className="w-4 h-4 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold text-white">Confirming transaction...</span>
                </div>
              )}

              {isRepaySuccess && (
                <div className="flex items-center gap-3 text-[var(--neon-green)]">
                  <div className="w-4 h-4 bg-[var(--neon-green)] rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white">Repay successful!</span>
                </div>
              )}

              {isRepayError && (
                <div className="flex items-center gap-3 text-red-400">
                  <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white">Repay failed</span>
                </div>
              )}
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* Alerts */}
      {showSuccessAlert && (
        <SuccessAlert
          isOpen={showSuccessAlert}
          onClose={handleCloseSuccessAlert}
          txHash={successTxHash}
          description="Repay completed successfully!"
          chainId={currentChainId}
        />
      )}

      {showFailedAlert && (
        <FailedAlert
          isOpen={showFailedAlert}
          onClose={handleCloseFailedAlert}
          description={errorMessage}
        />
      )}
    </>
  );
};

