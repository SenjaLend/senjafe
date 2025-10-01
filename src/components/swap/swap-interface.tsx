"use client";

import React, { useState, useCallback, memo } from "react";
import { ArrowUpDown, Info, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelector } from "../select/token";
import { PoolSearchDialog } from "../search";
import { Token } from "@/types";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { useReadUserPosition } from "@/hooks/read/usereadUserPosition";
import { useAccount } from "wagmi";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { useReadUserCollateralBalance } from "@/hooks/read/useReadUserCollateralBalance";
import { useCurrentChainId } from "@/lib/chain";
import { useReadExchangeRate } from "@/hooks/read/useReadExchangeRate";
import { TokenBalanceTable } from "./token-balance-table";

/**
 * Props for the SwapInterface component
 */
interface SwapInterfaceProps {
  /** Callback function when swap is executed */
  onSwap: (
    fromToken: Token,
    toToken: Token,
    amount: string,
    selectedPoolAddress?: string,
    userPositionAddress?: string
  ) => void;
  /** Whether a swap is currently in progress */
  isSwapping?: boolean;
  /** Whether the token is approved for spending */
  isApproved?: boolean;
  /** Whether approval is needed */
  needsApproval?: boolean;
  /** Whether approval is in progress */
  isApproving?: boolean;
  /** Whether to show success alert */
  showSuccessAlert?: boolean;
  /** Whether to show failed alert */
  showFailedAlert?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Success transaction hash */
  successTxHash?: string;
  /** Callback to close success alert */
  onCloseSuccessAlert?: () => void;
  /** Callback to close failed alert */
  onCloseFailedAlert?: () => void;
}

/**
 * SwapInterface component for token swapping functionality
 *
 * @param props - Component props
 * @returns JSX element
 */
export const SwapInterface = memo(function SwapInterface({
  onSwap,
  isSwapping = false,
  isApproved = false,
  needsApproval = true,
  isApproving = false,
  showSuccessAlert = false,
  showFailedAlert = false,
  errorMessage = "",
  successTxHash = "",
  onCloseSuccessAlert,
  onCloseFailedAlert,
}: SwapInterfaceProps) {
  const { address } = useAccount();
  const router = useRouter();
  const [fromToken, setFromToken] = useState<Token | undefined>();
  const [toToken, setToToken] = useState<Token | undefined>();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [showWarningDetails, setShowWarningDetails] = useState(false);
  const [selectedPool, setSelectedPool] =
    useState<LendingPoolWithTokens | null>(null);

  const currentChainId = useCurrentChainId();

  // Get user position for the selected pool
  const { userPosition } = useReadUserPosition(
    (selectedPool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000"
  );

  // Get user collateral balance for the from token
  const { parsedUserCollateralBalance: fromTokenBalance } =
    useReadUserCollateralBalance(
      (selectedPool?.lendingPool as `0x${string}`) ||
        "0x0000000000000000000000000000000000000000",
      (fromToken?.addresses[currentChainId] as `0x${string}`) ||
        "0x0000000000000000000000000000000000000000",
      fromToken?.decimals || 18
    );
  const handleSwapTokens = useCallback(() => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;

    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);

    // Recalculate the new amount if we have valid input
    if (toAmount && toToken && tempToken && parseFloat(toAmount) > 0) {
      const baseRate = 1.0;
      const slippageBuffer = 0.97;
      const converted = parseFloat(toAmount) * baseRate * slippageBuffer;
      setTimeout(() => setToAmount(converted.toFixed(6)), 0);
    }
  }, [fromToken, toToken, fromAmount, toAmount]);

  // Calculate amount in with proper validation to prevent Infinity
  const calculateAmountIn = () => {
    if (!fromAmount || !fromToken) return 0;
    const parsedAmount = parseFloat(fromAmount);
    if (!isFinite(parsedAmount) || isNaN(parsedAmount) || parsedAmount < 0)
      return 0;

    const multiplier = Math.pow(10, fromToken.decimals || 18);
    const result = parsedAmount * multiplier;
    return isFinite(result) ? Math.floor(result) : 0;
  };

  // Use a minimal amount for exchange rate calculation when no amount is entered
  const getAmountForExchangeRate = () => {
    const calculatedAmount = calculateAmountIn();
    if (calculatedAmount > 0) return calculatedAmount;

    // Use a more meaningful amount for rate calculation (0.01 in token units)
    if (fromToken) {
      return Math.pow(10, (fromToken.decimals || 18) - 2); // 0.01 in token decimals
    }
    return 0;
  };

  const { parsedExchangeRate: exchangeRate } = useReadExchangeRate(
    (selectedPool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    (fromToken?.addresses[currentChainId] as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    (toToken?.addresses[currentChainId] as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    getAmountForExchangeRate(),
    fromToken?.decimals || 18,
    toToken?.decimals || 18
  );

  const handleFromAmountChange = useCallback(
    (value: string) => {
      // Prevent negative numbers and invalid characters
      const cleanValue = value.replace(/[^0-9.]/g, "");

      // Prevent multiple decimal points
      const parts = cleanValue.split(".");
      const sanitizedValue =
        parts.length > 2
          ? parts[0] + "." + parts.slice(1).join("")
          : cleanValue;

      setFromAmount(sanitizedValue);

      if (
        sanitizedValue &&
        fromToken &&
        toToken &&
        exchangeRate &&
        exchangeRate > 0
      ) {
        const parsedValue = parseFloat(sanitizedValue);
        if (isFinite(parsedValue) && !isNaN(parsedValue) && parsedValue >= 0) {
          const converted = parsedValue * exchangeRate;
          if (isFinite(converted) && !isNaN(converted)) {
            setToAmount(converted.toFixed(6));
          } else {
            setToAmount("");
          }
        } else {
          setToAmount("");
        }
      } else {
        setToAmount("");
      }
    },
    [fromToken, toToken, exchangeRate]
  );

  const handleToAmountChange = useCallback(
    (value: string) => {
      // Prevent negative numbers and invalid characters
      const cleanValue = value.replace(/[^0-9.]/g, "");

      // Prevent multiple decimal points
      const parts = cleanValue.split(".");
      const sanitizedValue =
        parts.length > 2
          ? parts[0] + "." + parts.slice(1).join("")
          : cleanValue;

      setToAmount(sanitizedValue);
      if (
        sanitizedValue &&
        fromToken &&
        toToken &&
        exchangeRate &&
        exchangeRate > 0
      ) {
        const parsedValue = parseFloat(sanitizedValue);
        if (isFinite(parsedValue) && !isNaN(parsedValue) && parsedValue >= 0) {
          const converted = parsedValue / exchangeRate;
          if (isFinite(converted) && !isNaN(converted)) {
            setFromAmount(converted.toFixed(6));
          } else {
            setFromAmount("");
          }
        } else {
          setFromAmount("");
        }
      } else {
        setFromAmount("");
      }
    },
    [fromToken, toToken, exchangeRate]
  );

  const handleMaxAmount = useCallback(() => {
    if (fromTokenBalance && parseFloat(fromTokenBalance.toString()) > 0) {
      handleFromAmountChange(fromTokenBalance.toString());
    }
  }, [fromTokenBalance, handleFromAmountChange]);

  const handlePoolSelect = useCallback((pool: LendingPoolWithTokens) => {
    setSelectedPool(pool);

    // Auto-set tokens based on selected pool
    if (pool.borrowTokenInfo && pool.collateralTokenInfo) {
      setFromToken(pool.collateralTokenInfo);
      setToToken(pool.borrowTokenInfo);
      // Reset amounts when changing pools
      setFromAmount("");
      setToAmount("");
    }
  }, []);

  const handleSwap = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount || !selectedPool || !userPosition)
      return;

    try {
      await onSwap(
        fromToken,
        toToken,
        fromAmount,
        selectedPool.lendingPool,
        userPosition as string
      );
    } catch {
      // Handle swap error silently
    }
  }, [fromToken, toToken, fromAmount, selectedPool, userPosition, onSwap]);

  const toggleWarningDetails = useCallback(() => {
    setShowWarningDetails((prev) => !prev);
  }, []);

  const handleConnectWallet = useCallback(() => {
    router.push("/profile");
  }, [router]);

  const canSwap =
    fromToken &&
    toToken &&
    fromAmount &&
    parseFloat(fromAmount) > 0 &&
    selectedPool &&
    userPosition &&
    address &&
    fromTokenBalance &&
    parseFloat(fromTokenBalance.toString()) > 0 &&
    parseFloat(fromAmount) <= parseFloat(fromTokenBalance.toString());
  const needsWalletConnection = !address;

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="bg-[var(--electric-blue)]/10 backdrop-blur-xl border border-[var(--electric-blue)]/30 shadow-xl">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Swap Collateral
            </h2>
            <div className="w-full sm:w-auto">
              <PoolSearchDialog
                selectedPool={selectedPool}
                onPoolSelect={handlePoolSelect}
              />
            </div>
          </div>

          {/* From Token Section */}
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-medium text-white/90">Sell</span>
                <div className="flex items-center space-x-2 text-xs text-white md:text-sm">
                  <span className="text-xs md:text-sm text-white">
                    Balance: {fromTokenBalance || "0.0000"}
                  </span>
                  {fromTokenBalance &&
                    parseFloat(fromTokenBalance.toString()) > 0 && (
                      <button
                        type="button"
                        onClick={handleMaxAmount}
                        className="text-xs bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white px-2 py-1 rounded-md transition-colors"
                      >
                        MAX
                      </button>
                    )}
                </div>
              </div>

              <div className="relative bg-[#004488]/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-[var(--electric-blue)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Input
                      type="number"
                      placeholder="0"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      min="0"
                      step="0.000001"
                      className="border-0 bg-transparent text-sm sm:text-lg md:text-xl font-medium placeholder:text-white/40 p-0 h-auto focus-visible:ring-0 text-white shadow-none"
                    />
                    {fromToken && fromAmount ? (
                      <div className="text-xs md:text-sm text-white/70 mt-1">
                        {selectedPool ? (
                          <span>
                            From {selectedPool.collateralTokenInfo?.symbol}{" "}
                            collateral
                          </span>
                        ) : (
                          <span>Amount to swap</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs md:text-sm text-white/70 mt-1">
                        Enter amount to swap
                      </div>
                    )}
                  </div>
                  <TokenSelector
                    selectedToken={fromToken}
                    onTokenSelect={setFromToken}
                    otherToken={toToken}
                    label="Select token to swap from"
                    selectedPoolAddress={selectedPool?.lendingPool}
                    showBalance={true}
                    isCollateralBalance={true}
                  />
                </div>
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapTokens}
                className="h-10 w-10 rounded-full bg-[var(--electric-blue)] border border-[var(--electric-blue)]/50 hover:bg-[var(--electric-blue)]/80 hover:shadow-lg transition-all duration-200"
              >
                <ArrowUpDown className="h-4 w-4 text-white" />
              </Button>
            </div>

            {/* To Token Section */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-medium text-white/90">Buy</span>
                <span className="text-xs md:text-sm text-white/70">
                  {toToken ? `${toToken.symbol}` : "Select token"}
                </span>
              </div>

              <div className="relative bg-[#004488]/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-[var(--electric-blue)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Input
                      type="number"
                      placeholder="0"
                      value={toAmount}
                      onChange={(e) => handleToAmountChange(e.target.value)}
                      min="0"
                      step="0.000001"
                      className="border-0 bg-transparent text-sm sm:text-lg md:text-xl font-medium placeholder:text-white/40 p-0 h-auto focus-visible:ring-0 text-white shadow-none"
                    />
                    {toToken && toAmount ? (
                      <div className="text-xs md:text-sm text-white/70 mt-1">
                        ${(parseFloat(toAmount) * 1).toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-xs md:text-sm text-white/70 mt-1">-</div>
                    )}
                  </div>
                  <TokenSelector
                    selectedToken={toToken}
                    onTokenSelect={setToToken}
                    otherToken={fromToken}
                    label="Select token to receive"
                    selectedPoolAddress={selectedPool?.lendingPool}
                    showBalance={true}
                    isCollateralBalance={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Connect Wallet Button */}
          <div className="mt-6">
            {needsWalletConnection ? (
              <Button 
                onClick={handleConnectWallet}
                className="w-full h-10 text-sm font-medium bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white rounded-xl shadow-lg transition-all duration-200"
              >
                Connect wallet
              </Button>
            ) : !fromToken || !toToken ? (
              <Button
                disabled
                className="w-full h-10 text-sm font-medium bg-gray-600/50 text-white/70 rounded-xl border border-gray-500/30 cursor-not-allowed"
              >
                Coming Soon
              </Button>
            ) : !selectedPool ? (
              <Button
                disabled
                className="w-full h-10 text-sm font-medium bg-gray-600/50 text-white/70 rounded-xl border border-gray-500/30 cursor-not-allowed"
              >
                Coming Soon
              </Button>
            ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
              <Button
                disabled
                className="w-full h-10 text-sm font-medium bg-gray-600/50 text-white/70 rounded-xl border border-gray-500/30 cursor-not-allowed"
              >
                Coming Soon
              </Button>
            ) : fromAmount &&
              fromTokenBalance &&
              parseFloat(fromAmount) >
                parseFloat(fromTokenBalance.toString()) ? (
              <Button
                disabled
                className="w-full h-10 text-sm font-medium bg-red-500/50 text-white/70 rounded-xl border border-red-400/30 cursor-not-allowed"
              >
                Insufficient balance
              </Button>
            ) : needsApproval && !isApproved ? (
              <Button
                onClick={handleSwap}
                disabled={isApproving}
                className="w-full h-10 text-sm font-medium bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white disabled:opacity-50 rounded-xl shadow-lg transition-all duration-200"
              >
                {isApproving ? "Swapping..." : `Swap ${fromToken.symbol}`}
              </Button>
            ) : (
              <Button
                onClick={handleSwap}
                disabled={!canSwap || isSwapping}
                className="w-full h-10 text-sm font-medium bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white disabled:opacity-50 rounded-xl shadow-lg transition-all duration-200"
              >
                {isSwapping
                  ? "Swapping..."
                  : `Swap ${fromToken.symbol} for ${toToken.symbol}`}
              </Button>
            )}
          </div>

          {/* Warning Message */}
          {fromToken && toToken && fromAmount && selectedPool && (
            <div className="mt-4 bg-[var(--electric-blue)]/20 rounded-lg border border-[var(--electric-blue)]/30 backdrop-blur-sm">
              <button
                onClick={toggleWarningDetails}
                className="w-full p-3 flex items-center text-white text-sm hover:bg-[var(--electric-blue)]/30 transition-colors rounded-lg"
              >
                <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Collateral swap details</span>
                <ChevronDown
                  className={`h-4 w-4 ml-auto text-white transition-transform ${
                    showWarningDetails ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded Trading Details */}
              {showWarningDetails && (
                <div className="px-3 pb-3 border-t border-[var(--electric-blue)]/30">
                  <div className="pt-3 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-white/80">
                        <span>Exchange rate</span>
                        <Info className="h-3 w-3 ml-1 text-white/60" />
                      </div>
                      <span className="text-white font-medium">
                        {fromToken && toToken && fromAmount && toAmount
                          ? `1 ${fromToken.symbol} = ${(
                              (parseFloat(toAmount) || 0) /
                              (parseFloat(fromAmount) || 1)
                            ).toFixed(4)} ${toToken.symbol}`
                          : fromToken &&
                            toToken &&
                            userPosition &&
                            userPosition !== "0x0000000000000000000000000000000000000000" &&
                            exchangeRate &&
                            exchangeRate > 0
                          ? `1 ${fromToken.symbol} = ${exchangeRate.toFixed(
                              4
                            )} ${toToken.symbol}`
                          : fromToken && toToken && userPosition && userPosition !== "0x0000000000000000000000000000000000000000"
                          ? "Loading exchange rate..."
                          : fromToken && toToken
                          ? "Create position to see rate"
                          : "Select tokens"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-white/80">
                        <span>Pool</span>
                        <Info className="h-3 w-3 ml-1 text-white/60" />
                      </div>
                      <span className="text-white font-medium">
                        {selectedPool.collateralTokenInfo?.symbol} /{" "}
                        {selectedPool.borrowTokenInfo?.symbol}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-white/80">
                        <span>Position Address</span>
                        <Info className="h-3 w-3 ml-1 text-white/60" />
                      </div>
                      <span className="text-white font-medium">
                        {userPosition
                          ? `${(userPosition as string).slice(0, 6)}...${(
                              userPosition as string
                            ).slice(-4)}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Alert */}
      {showSuccessAlert && onCloseSuccessAlert && (
        <SuccessAlert
          isOpen={showSuccessAlert}
          onClose={onCloseSuccessAlert}
          title="Swap Successful!"
          description={`Your collateral swap was completed successfully.`}
          txHash={successTxHash}
        />
      )}

      {/* Failed Alert */}
      {showFailedAlert && onCloseFailedAlert && (
        <FailedAlert
          isOpen={showFailedAlert}
          onClose={onCloseFailedAlert}
          title="Swap Failed"
          description={errorMessage}
        />
      )}

      {/* Token Balance Table - only show if user has position */}
      {userPosition &&
        userPosition !== "0x0000000000000000000000000000000000000000" && (
          <div className="mt-6">
            <TokenBalanceTable selectedPool={selectedPool} />
          </div>
        )}
    </div>
  );
});
