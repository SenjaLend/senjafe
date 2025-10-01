"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { useCurrentChainId } from "@/lib/chain";
import { useReadUserCollateralBalance } from "@/hooks/read/useReadUserCollateralBalance";
import { useReadUserBorrowShares } from "@/hooks/read/useReadUserBorrowShares";
import { useOptimizedExchangeRate } from "@/hooks/read/useOptimizedExchangeRate";
import { useReadUserPosition } from "@/hooks/read/usereadUserPosition";
import { RepayDialog } from "./repay-dialog";
import { formatLargeNumber } from "@/utils/format";
import { tokens } from "@/lib/addresses/tokenAddress";
import { Token } from "@/types";
import { useAccount } from "wagmi";
import Image from "next/image";

interface TokenBalanceTableProps {
  selectedPool: LendingPoolWithTokens | null;
  onTotalUsdtUpdate?: (totalUsdt: number) => void;
}

interface TokenBalanceRowProps {
  token: {
    symbol: string;
    addresses: Record<number, string>;
    decimals: number;
    logoURI?: string;
    logo?: string;
  };
  balance: string;
  balanceLoading: boolean;
  usdtValue?: string;
  usdtValueLoading?: boolean;
  poolAddress: string;
  onRepayClick: (token: {
    symbol: string;
    addresses: Record<number, string>;
    decimals: number;
    logoURI?: string;
    logo?: string;
  }) => void;
}

interface TokenBalanceItemProps {
  token: {
    symbol: string;
    addresses: Record<number, string>;
    decimals: number;
    logoURI?: string;
    logo?: string;
  };
  poolAddress: string;
  onRepayClick: (token: {
    symbol: string;
    addresses: Record<number, string>;
    decimals: number;
    logoURI?: string;
    logo?: string;
  }) => void;
  onUsdtValueUpdate?: (tokenSymbol: string, usdtValue: number) => void;
}

const TokenBalanceRow = ({
  token,
  balance,
  balanceLoading,
  usdtValue,
  usdtValueLoading,
  onRepayClick,
}: TokenBalanceRowProps) => {
  const [showLoading, setShowLoading] = React.useState(false);
  const canRepay = parseFloat(balance) > 0;

  // Add delay before showing loading state
  React.useEffect(() => {
    if (balanceLoading) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 2000); // Show loading after 2 seconds

      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [balanceLoading]);

  return (
    <div className="flex items-center justify-between p-3 bg-[#004488]/50 backdrop-blur-sm rounded-lg border border-[var(--electric-blue)]/30">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-[var(--electric-blue)]/20 flex items-center justify-center overflow-hidden">
          {token.logoURI || token.logo ? (
            <Image
              src={token.logoURI || token.logo || ""}
              alt={token.symbol}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-white/80">
              {token.symbol.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <div className="text-sm font-medium text-white">
            {token.symbol}
          </div>
          <div className="text-xs text-white/70">Collateral</div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm text-white">
            {balanceLoading && showLoading ? (
              <div className="flex items-center justify-end gap-2">
                <div className="w-4 h-4 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-white/70">Loading...</span>
              </div>
            ) : (
              formatLargeNumber(balance)
            )}
          </div>
          <div className="text-xs text-white/70">{token.symbol}</div>

          {/* USDT Value Display */}
          {canRepay && (
            <div className="text-xs text-[var(--neon-green)] mt-1">
              {usdtValueLoading ? (
                <div className="flex items-center justify-end gap-1">
                  <div className="w-3 h-3 border-2 border-[var(--neon-green)] border-t-transparent rounded-full animate-spin"></div>
                  <span>Converting...</span>
                </div>
              ) : usdtValue && parseFloat(usdtValue) > 0 ? (
                `≈ ${formatLargeNumber(usdtValue)} USDT`
              ) : (
                "≈ 0 USDT"
              )}
            </div>
          )}
        </div>

        {canRepay && (
          <Button
            onClick={() => onRepayClick(token)}
            size="sm"
            className="bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white text-xs px-3 py-1 h-7 transition-all duration-200"
          >
            Repay
          </Button>
        )}
      </div>
    </div>
  );
};

// Component to handle individual token balance with USDT conversion
const TokenBalanceItem = ({
  token,
  poolAddress,
  onRepayClick,
  onBalanceCheck,
  onUsdtValueUpdate,
}: TokenBalanceItemProps & {
  onBalanceCheck: (hasBalance: boolean, isLoading: boolean) => void;
}) => {
  const currentChainId = useCurrentChainId();

  // Get collateral balance for this specific token
  const { parsedUserCollateralBalance, userCollateralBalanceLoading } =
    useReadUserCollateralBalance(
      (poolAddress as `0x${string}`) ||
        "0x0000000000000000000000000000000000000000",
      (token.addresses[currentChainId] as `0x${string}`) ||
        "0x0000000000000000000000000000000000000000",
      token.decimals
    );

  const balance = parsedUserCollateralBalance?.toString() || "0";
  const hasBalance = parseFloat(balance) > 0;

  // Find USDT token for conversion
  const usdtToken = useMemo(() => tokens.find((t) => t.symbol === "USDT"), []);
  const usdtAddress = useMemo(
    () => usdtToken?.addresses[currentChainId] as `0x${string}`,
    [usdtToken, currentChainId]
  );

  // Only calculate exchange rate if we have balance and it's not USDT token
  const shouldFetchExchangeRate = Boolean(
    hasBalance &&
      poolAddress &&
      token.addresses[currentChainId] &&
      usdtAddress &&
      token.symbol !== "USDT" // Don't convert USDT to USDT
  );

  // Get exchange rate for token to USDT conversion
  const { parsedExchangeRate, exchangeRateLoading } = useOptimizedExchangeRate(
    (poolAddress as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    (token.addresses[currentChainId] as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    usdtAddress || "0x0000000000000000000000000000000000000000",
    token.decimals,
    usdtToken?.decimals || 6,
    shouldFetchExchangeRate
  );

  // Calculate USDT value
  const usdtValue = useMemo(() => {
    if (token.symbol === "USDT") {
      // If token is USDT, return the balance directly
      return hasBalance ? balance : "0";
    }

    if (hasBalance && parsedExchangeRate > 0) {
      const result = (parseFloat(balance) * parsedExchangeRate).toFixed(6);
      return result;
    }

    return "0";
  }, [hasBalance, balance, parsedExchangeRate, token.symbol]);

  // Notify parent component about balance status
  React.useEffect(() => {
    onBalanceCheck(hasBalance, userCollateralBalanceLoading);
  }, [hasBalance, userCollateralBalanceLoading, onBalanceCheck]);

  // Notify parent component about USDT value for total calculation
  React.useEffect(() => {
    if (onUsdtValueUpdate && hasBalance) {
      const usdtValueNumber = parseFloat(usdtValue) || 0;
      onUsdtValueUpdate(token.symbol, usdtValueNumber);
    } else if (onUsdtValueUpdate && !hasBalance) {
      // Reset to 0 if no balance
      onUsdtValueUpdate(token.symbol, 0);
    }
  }, [onUsdtValueUpdate, token.symbol, usdtValue, hasBalance]);

  // Only show token if it has balance (don't show if still loading balance)
  if (hasBalance) {
    return (
      <TokenBalanceRow
        token={token}
        balance={balance}
        balanceLoading={false} // Never show balance loading since we only render when hasBalance
        usdtValue={usdtValue}
        usdtValueLoading={exchangeRateLoading && token.symbol !== "USDT"}
        poolAddress={poolAddress}
        onRepayClick={onRepayClick}
      />
    );
  }

  // Don't render if no balance or still loading balance
  return null;
};

export const TokenBalanceTable = ({
  selectedPool,
  onTotalUsdtUpdate,
}: TokenBalanceTableProps) => {
  const [repayDialogOpen, setRepayDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [hasAnyBalance, setHasAnyBalance] = useState(false);
  const [isAnyLoading, setIsAnyLoading] = useState(false);
  const [totalUsdtValue, setTotalUsdtValue] = useState(0);

  const currentChainId = useCurrentChainId();
  const { isConnected } = useAccount();

  // Check user position - if no position address, return early
  const { userPosition, userPositionLoading, userPositionError } =
    useReadUserPosition(
      (selectedPool?.lendingPool as `0x${string}`) ||
        "0x0000000000000000000000000000000000000000"
    );

  // Get borrow balance for repay functionality
  const {
    userBorrowSharesFormatted: borrowBalance,
    userBorrowSharesLoading: borrowLoading,
  } = useReadUserBorrowShares(
    (selectedPool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    selectedPool?.borrowTokenInfo?.decimals || 18
  );

  // Filter tokens that are available on current chain
  const availableTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token.addresses[currentChainId] &&
        token.addresses[currentChainId] !==
          "0x0000000000000000000000000000000000000000" &&
        token.symbol !== "GLMR" // Exclude native GLMR token
    );
  }, [currentChainId]);

  const handleRepayClick = (token: {
    symbol: string;
    addresses: Record<number, string>;
    decimals: number;
    logoURI?: string;
    logo?: string;
  }) => {
    // Transform token to match Token interface
    const transformedToken: Token = {
      name: token.symbol, // Use symbol as name since name is not available
      symbol: token.symbol,
      logo: token.logoURI || token.logo || "",
      decimals: token.decimals,
      addresses: token.addresses as { [chainId: number]: `0x${string}` },
    };
    setSelectedToken(transformedToken);
    setRepayDialogOpen(true);
  };

  const handleCloseRepayDialog = () => {
    setRepayDialogOpen(false);
    setSelectedToken(null);
  };

  const handleBalanceCheck = useCallback(
    (hasBalance: boolean, isLoading: boolean) => {
      setHasAnyBalance((prev) => prev || hasBalance);
      setIsAnyLoading((prev) => prev || isLoading);
    },
    []
  );

  // Store individual token USDT values in state for faster calculation
  const [, setTokenUsdtValues] = useState<Record<string, number>>({});

  // Handle USDT value updates from individual tokens
  const handleUsdtValueUpdate = useCallback(
    (tokenSymbol: string, usdtValue: number) => {
      // Update individual token values immediately
      setTokenUsdtValues((prev) => {
        const updated = { ...prev, [tokenSymbol]: usdtValue };

        // Calculate total immediately from all token values
        const newTotal = Object.values(updated).reduce(
          (sum, value) => sum + value,
          0
        );

        // Update total immediately
        setTotalUsdtValue(newTotal);

        return updated;
      });
    },
    []
  );

  // Send total USDT to parent component (for portfolio integration)
  React.useEffect(() => {
    if (onTotalUsdtUpdate) {
      onTotalUsdtUpdate(totalUsdtValue);
    }
  }, [totalUsdtValue, onTotalUsdtUpdate]);

  // Reset states when pool changes
  React.useEffect(() => {
    setHasAnyBalance(false);
    setIsAnyLoading(false);
    setTotalUsdtValue(0);
    setTokenUsdtValues({}); // Reset individual token values
  }, [selectedPool?.lendingPool]);

  if (!selectedPool) {
    return (
      <Card className="bg-[var(--electric-blue)]/10 backdrop-blur-xl border border-[var(--electric-blue)]/30 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-white/70">
            <p className="text-sm">Select a pool to view token balances</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If wallet is not connected, show beary guard inside the card
  if (!isConnected) {
    return (
      <Card className="bg-[var(--electric-blue)]/10 backdrop-blur-xl border border-[var(--electric-blue)]/30 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            Token Balances
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span>Your collateral balances in</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full overflow-hidden">
                {selectedPool.collateralTokenInfo?.logo ? (
                  <Image
                    src={selectedPool.collateralTokenInfo.logo}
                    alt={selectedPool.collateralTokenInfo.symbol}
                    width={16}
                    height={16}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--electric-blue)]/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white/80">
                      {selectedPool.collateralTokenInfo?.symbol?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="font-medium text-white">
                {selectedPool.collateralTokenInfo?.symbol}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full overflow-hidden">
                {selectedPool.borrowTokenInfo?.logo ? (
                  <Image
                    src={selectedPool.borrowTokenInfo.logo}
                    alt={selectedPool.borrowTokenInfo.symbol}
                    width={16}
                    height={16}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--electric-blue)]/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white/80">
                      {selectedPool.borrowTokenInfo?.symbol?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="font-medium text-white">
                {selectedPool.borrowTokenInfo?.symbol}
              </span>
            </div>
            <span className="text-white/80">pool</span>
          </div>
        </CardHeader>
        <CardContent className="p-8 text-center">
          {/* Beary Wallet Image */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 relative">
                <img
                  src="/beary/beary-wallet.png"
                  alt="Beary with wallet"
                  className="w-full h-full object-contain animate-bounce"
                />
              </div>
              {/* Sparkle effect */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-white text-xs">*</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-white mb-2">
              Connect Wallet to View Balances
            </h3>
            <p className="text-white/80 leading-relaxed">
              Connect your wallet to view your token balances in this lending
              pool!
            </p>
            <p className="text-sm text-white/60 mt-2">
              Beary is waiting for you!
            </p>
          </div>

          {/* Connect Button */}
          <Button
            onClick={() => (window.location.href = "/profile")}
            className="bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] hover:from-[var(--electric-blue)]/80 hover:to-[var(--neon-green)]/80 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Connect Wallet
            </div>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If no position address found and not loading, show "no position" message
  if (
    !userPositionLoading &&
    !userPosition &&
    !userPositionError &&
    isConnected
  ) {
    return (
      <Card className="bg-[var(--electric-blue)]/10 backdrop-blur-xl border border-[var(--electric-blue)]/30 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-white/70">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--electric-blue)]/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-white mb-1">
              No Position Found
            </p>
            <p className="text-xs text-white/60">
              You don&apos;t have a position in this pool
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-[var(--electric-blue)]/10 backdrop-blur-xl border border-[var(--electric-blue)]/30 mb-10 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            Token Balances
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span>Your collateral balances in</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full overflow-hidden">
                {selectedPool.collateralTokenInfo?.logo ? (
                  <Image
                    src={selectedPool.collateralTokenInfo.logo}
                    alt={selectedPool.collateralTokenInfo.symbol}
                    width={16}
                    height={16}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--electric-blue)]/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white/80">
                      {selectedPool.collateralTokenInfo?.symbol?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="font-medium text-white">
                {selectedPool.collateralTokenInfo?.symbol}
              </span>
            </div>
            <span className="text-white/80">/</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full overflow-hidden">
                {selectedPool.borrowTokenInfo?.logo ? (
                  <Image
                    src={selectedPool.borrowTokenInfo.logo}
                    alt={selectedPool.borrowTokenInfo.symbol}
                    width={16}
                    height={16}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--electric-blue)]/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white/80">
                      {selectedPool.borrowTokenInfo?.symbol?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="font-medium text-white">
                {selectedPool.borrowTokenInfo?.symbol}
              </span>
            </div>
            <span className="text-white/80">pool</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableTokens.map((token) => (
            <TokenBalanceItem
              key={`${token.symbol}-${selectedPool.lendingPool}`}
              token={token}
              poolAddress={selectedPool.lendingPool}
              onRepayClick={handleRepayClick}
              onBalanceCheck={handleBalanceCheck}
              onUsdtValueUpdate={handleUsdtValueUpdate}
            />
          ))}

          {/* Show empty state if no balances found and not loading */}
          {!isAnyLoading && !hasAnyBalance && (
            <div className="text-center py-8 text-white/70">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--electric-blue)]/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-white mb-1">
                No collateral found
              </p>
              <p className="text-xs text-white/60">
                You don&apos;t have any collateral in this pool
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <RepayDialog
        isOpen={repayDialogOpen}
        onClose={handleCloseRepayDialog}
        selectedPool={selectedPool}
        selectedToken={selectedToken}
        borrowBalance={borrowBalance}
        borrowLoading={borrowLoading}
      />
    </>
  );
};
