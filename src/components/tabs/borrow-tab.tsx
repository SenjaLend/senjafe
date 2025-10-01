"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { formatUnits } from "viem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PoolInfoCard } from "./shared/pool-info-card";
import { ChainSelector } from "./shared/chain-selector";
import { AmountInput } from "./shared/amount-input";
import { SuccessAlert } from "@/components/alert/success-alert";
import { FailedAlert } from "@/components/alert/failed-alert";
import { BearyTabGuard } from "@/components/wallet/beary-tab-guard";
import { useRefetch } from "@/hooks/useRefetch";
import { useReadPoolApy } from "@/hooks/read/useReadPoolApy";
import { useUserWalletBalance } from "@/hooks/read/useReadUserBalance";
import { useReadFee } from "@/hooks/read/useReadFee";
import { useReadMaxBorrow } from "@/hooks/read/useReadMaxBorrow";
import { useBorrow } from "@/hooks/write/useBorrow";
import { useCurrentChainId } from "@/lib/chain/use-chain";
import { chains } from "@/lib/addresses/chainAddress";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";

// Utility function to format large numbers
const formatLargeNumber = (value: string | number): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return "0.00";

  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + "K";
  } else {
    return num.toFixed(4);
  }
};

interface BorrowTabProps {
  pool?: LendingPoolWithTokens;
}

const BorrowTab = ({ pool }: BorrowTabProps) => {
  const [chainFrom] = useState("1284"); // Default to Moonbeam
  const [chainTo, setChainTo] = useState("1284"); // Default to Moonbeam for on-chain borrowing
  const [amount, setAmount] = useState(""); // Amount to borrow

  const currentChainId = useCurrentChainId();

  // Get destination endpoint from selected chain
  const destinationEndpoint = useMemo(() => {
    const selectedChain = chains.find(
      (chain) => chain.id.toString() === chainTo
    );
    return selectedChain?.destinationEndpoint || 30184; // Default to Moonbeam endpoint
  }, [chainTo]);

  // Refetch functionality
  const { addRefetchFunction, removeRefetchFunction } = useRefetch({
    refetchInterval: 0, // Disable auto-refetch, we'll trigger manually
    enabled: false,
  });

  // Get APY for the pool
  const {
    borrowAPY,
    loading: apyLoading,
    refetch: refetchApy,
  } = useReadPoolApy(pool?.lendingPool);

  // Get user balance for the borrow token (keeping for potential future use)
  const { refetchWalletBalance } = useUserWalletBalance(
    (pool?.borrowTokenInfo?.addresses[currentChainId] as `0x${string}`) ||
      "0xCEb5c8903060197e46Ab5ea5087b9F99CBc8da49",
    pool?.borrowTokenInfo?.decimals || 18
  );

  // Get max borrow amount
  const { maxBorrowFormatted, maxBorrowLoading, refetchMaxBorrow } =
    useReadMaxBorrow(
      (pool?.lendingPool as `0x${string}`) ||
        "0x0000000000000000000000000000000000000000",
      pool?.borrowTokenInfo?.decimals || 18
    );

  // Get fee for cross-chain borrowing (using amount to borrow)
  const { fee, feeLoading, feeError, refetchFee, parsedAmount } = useReadFee(
    destinationEndpoint,
    amount || "0",
    pool?.borrowTokenInfo?.decimals || 18,
    pool?.borrowTokenInfo || {
      name: "Unknown",
      symbol: "UNKNOWN",
      logo: "/token/moonbeam-logo.svg",
      decimals: 18,
      addresses: {}
    },
    chainFrom,
    chainTo
  );

  // Borrow hook
  const {
    handleBorrow: executeBorrow,
    isBorrowing,
    isConfirming,
    isSuccess: isBorrowSuccess,
    isError: isBorrowError,
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
  } = useBorrow(currentChainId, () => {
    // Refetch all data after successful borrow
    refetchApy();
    refetchWalletBalance();
    refetchMaxBorrow();
    refetchFee();
  });

  // Add refetch functions
  useEffect(() => {
    addRefetchFunction(refetchApy);
    addRefetchFunction(refetchWalletBalance);
    addRefetchFunction(refetchMaxBorrow);
    addRefetchFunction(refetchFee);

    return () => {
      removeRefetchFunction(refetchApy);
      removeRefetchFunction(refetchWalletBalance);
      removeRefetchFunction(refetchMaxBorrow);
      removeRefetchFunction(refetchFee);
    };
  }, [
    addRefetchFunction,
    removeRefetchFunction,
    refetchApy,
    refetchWalletBalance,
    refetchMaxBorrow,
    refetchFee,
  ]);

  const handleSetMax = useCallback(() => {
    if (maxBorrowLoading) {
      return;
    }

    if (maxBorrowFormatted && parseFloat(maxBorrowFormatted) > 0) {
      setAmount(maxBorrowFormatted);
    }
  }, [maxBorrowFormatted, maxBorrowLoading]);

  const handleBorrow = useCallback(async () => {
    if (!pool?.lendingPool || !amount || fee === undefined) {
      return;
    }

    try {
      await executeBorrow(
        pool.lendingPool as `0x${string}`,
        amount,
        pool.borrowTokenInfo?.decimals || 18,
        parseInt(chainTo),
        destinationEndpoint,
        fee
      );
    } catch {
      // Handle error silently
    }
  }, [pool, amount, fee, chainTo, destinationEndpoint, executeBorrow]);

  if (!pool) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-white/70">No pool selected</p>
        </Card>
      </div>
    );
  }

  return (
    <BearyTabGuard
      showGuard={true}
      tabName="Borrow"
      title="Connect Wallet to Borrow Assets"
      message="Connect your wallet to borrow assets from this lending pool!"
    >
      <div className="space-y-6">
        {/* Pool Information Card */}
        <PoolInfoCard
          collateralToken={{
            symbol: pool.collateralTokenInfo?.symbol || "Token",
            logo: pool.collateralTokenInfo?.logo || "/token/moonbeam-logo.svg",
          }}
          borrowToken={{
            symbol: pool.borrowTokenInfo?.symbol || "Token",
            logo: pool.borrowTokenInfo?.logo || "/token/usdt.png",
          }}
          apy={apyLoading ? "Loading..." : borrowAPY}
          ltv={(Number(pool.ltv) / 1e16).toFixed(1)}
          apyLabel="Interest Rate"
        />

        <Card className="p-4 bg-gradient-to-br from-[var(--electric-blue)]/10 to-[var(--electric-blue)]/5 backdrop-blur-sm border-2 border-[var(--electric-blue)]/20 rounded-lg shadow-lg">
          <div className="space-y-4">
            {/* Chain Selection */}
            <ChainSelector
              chainFrom={chainFrom}
              chainTo={chainTo}
              onChainToChange={setChainTo}
            />

            {/* Max Borrow Amount Card */}
            <div className="p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-[var(--electric-blue)]/30">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Max Borrow:</span>
                <span className="text-md font-bold text-white">
                  {maxBorrowLoading
                    ? "Loading..."
                    : `${formatLargeNumber(maxBorrowFormatted || "0.00")} ${
                        pool.borrowTokenInfo?.symbol || "Token"
                      }`}
                </span>
              </div>
            </div>

            {/* Amount Input */}
            <AmountInput
              label="Borrow Amount"
              placeholder="Enter amount to borrow"
              value={amount}
              onChange={setAmount}
              onMaxClick={handleSetMax}
              tokenSymbol={pool.borrowTokenInfo?.symbol || "Token"}
              maxDisabled={
                maxBorrowLoading ||
                !maxBorrowFormatted ||
                parseFloat(maxBorrowFormatted) <= 0
              }
            />

            {/* Fee Information */}
            {amount && parsedAmount > BigInt(0) && (
              <div className="bg-black/20 backdrop-blur-sm border border-[var(--electric-blue)]/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white">
                    Cross-chain Fee:
                  </span>
                  <span className="text-sm text-white/70">
                    0
                  </span>
                </div>
              </div>
            )}

            {/* Transaction Status */}
            <div className="space-y-2">
              {/* Loading Status */}
              {isBorrowing && (
                <div className="flex items-center gap-3 text-[var(--electric-blue)]">
                  <div className="w-5 h-5 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold">
                    Processing borrow request...
                  </span>
                </div>
              )}

              {/* Confirming Status */}
              {isConfirming && (
                <div className="flex items-center gap-3 text-[var(--electric-blue)]">
                  <div className="w-5 h-5 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold">
                    Confirming transaction...
                  </span>
                </div>
              )}

              {/* Success Status */}
              {isBorrowSuccess && (
                <div className="flex items-center gap-3 text-green-600">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">
                    Borrow successful!
                  </span>
                </div>
              )}

              {/* Error Status */}
              {isBorrowError && (
                <div className="flex items-center gap-3 text-red-600">
                  <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-semibold">
                    Transaction failed
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Button
          onClick={handleBorrow}
          className="w-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] hover:from-[var(--electric-blue)]/80 hover:to-[var(--neon-green)]/80 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg"
          disabled={
            !amount ||
            !chainTo ||
            isBorrowing ||
            isConfirming ||
            maxBorrowLoading ||
            feeLoading
          }
        >
          {isBorrowing
            ? "Borrowing..."
            : isConfirming
            ? "Confirming..."
            : `Borrow ${pool.borrowTokenInfo?.symbol || "Token"}`}
        </Button>

        {/* Alert Components */}
        {showSuccessAlert && (
          <SuccessAlert
            isOpen={showSuccessAlert}
            onClose={handleCloseSuccessAlert}
            txHash={successTxHash}
            title="Borrow Successful!"
            description="Your borrow transaction has been completed successfully."
            chainId={parseInt(chainTo)}
          />
        )}

        {showFailedAlert && (
          <FailedAlert
            isOpen={showFailedAlert}
            onClose={handleCloseFailedAlert}
            title="Borrow Failed"
            description={
              errorMessage ||
              "Your borrow transaction failed. Please try again."
            }
          />
        )}
      </div>
    </BearyTabGuard>
  );
};

export default BorrowTab;
