"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { useCurrentChainId } from "@/lib/chain";
import { useReadUserCollateralBalance } from "@/hooks/read/useReadUserCollateralBalance";
import { useOptimizedExchangeRate } from "@/hooks/read/useOptimizedExchangeRate";
import { formatLargeNumber } from "@/utils/format";
import { tokens } from "@/lib/addresses/tokenAddress";
import { useAccount } from "wagmi";
import Image from "next/image";

interface CollateralBalanceTableProps {
  selectedPool: LendingPoolWithTokens | null;
  className?: string;
  onTotalUsdtUpdate?: (totalUsdt: number) => void;
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
  onBalanceCheck: (hasBalance: boolean, isLoading: boolean, tokenBalance?: number, usdtValue?: number) => void;
}

// Shared styles
const CARD_STYLES = "bg-white/80 backdrop-blur-sm border border-[var(--electric-blue)]/30 shadow-xl";
const TIMEOUT_DURATION = 10000; // 10 seconds

// Reusable component for token logo display
const TokenLogo = React.memo(function TokenLogo({ token, size = 16 }: { 
  token: { symbol: string; logo?: string } | null; 
  size?: number 
}) {
  if (!token) return null;
  
  return (
    <div className={`w-4 h-4 rounded-full overflow-hidden`}>
      {token.logo ? (
        <Image
          src={token.logo}
          alt={token.symbol}
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-600">
            {token.symbol?.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
});

// Component to handle individual token balance calculation with optimized approach
const TokenBalanceItem = React.memo(function TokenBalanceItem({
  token,
  poolAddress,
  onBalanceCheck,
}: TokenBalanceItemProps) {
  const currentChainId = useCurrentChainId();

  // Get RAW collateral balance for this specific token (without parsing first for performance)
  const { 
    userCollateralBalance: rawUserCollateralBalance, // Use raw balance instead of parsed
    userCollateralBalanceLoading
  } = useReadUserCollateralBalance(
    (poolAddress as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    (token.addresses[currentChainId] as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    token.decimals
  );


  // Filter first: Check if raw balance is greater than 0 before any parsing
  const hasRawBalance = useMemo(() => {
    if (!rawUserCollateralBalance || userCollateralBalanceLoading) return false;
    // Quick check on raw BigInt/string before parsing
    const rawString = rawUserCollateralBalance.toString();
    const hasBalance = rawString !== "0" && rawString !== "0x0";
    
    
    return hasBalance;
  }, [rawUserCollateralBalance, userCollateralBalanceLoading]);

  // Only parse if we have raw balance (performance optimization)
  const { parsedBalance, hasBalance } = useMemo(() => {
    if (!hasRawBalance) {
      return { parsedBalance: "0", hasBalance: false };
    }

    // Parse only when we know there's a balance
    const parsed = rawUserCollateralBalance?.toString() || "0";
    const hasActualBalance = parseFloat(parsed) > 0;
    

    return { 
      parsedBalance: hasActualBalance ? parsed : "0", 
      hasBalance: hasActualBalance 
    };
  }, [hasRawBalance, rawUserCollateralBalance]);

  // Find USDT token for conversion (memoized) - only if we have balance
  const usdtToken = useMemo(() => {
    if (!hasBalance) return null; // Don't find USDT if no balance
    return tokens.find(t => t.symbol === "USDT");
  }, [hasBalance]);
  
  const usdtAddress = useMemo(() => 
    usdtToken?.addresses[currentChainId] as `0x${string}`, 
    [usdtToken, currentChainId]
  );


  // Use fixed amount for exchange rate calculation - only calculate if we have balance
  const amountIn = useMemo(() => {
    if (!hasBalance) {
      return 0;
    }
    
    const fixedAmount = Math.pow(10, token.decimals); // 1 unit of token
    
    
    return fixedAmount;
  }, [hasBalance, token.decimals]);

  // Only call exchange rate if we have a valid balance (optimized conditions)
  const shouldFetchExchangeRate = Boolean(
    hasBalance && 
    poolAddress && 
    token.addresses[currentChainId] && 
    usdtAddress && 
    amountIn > 0
  );


  const { 
    parsedExchangeRate
  } = useOptimizedExchangeRate(
    (poolAddress as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    (token.addresses[currentChainId] as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    usdtAddress || "0x0000000000000000000000000000000000000000",
    token.decimals,
    usdtToken?.decimals || 6,
    shouldFetchExchangeRate
  );



  // Calculate USDT value (optimized - only if we have balance)
  const usdtValue = useMemo(() => {
    if (!hasBalance) {
      return "0";
    }
    
    const result = parsedExchangeRate > 0 
      ? (parseFloat(parsedBalance) * parsedExchangeRate).toFixed(6)
      : "0";
    
    
    return result;
  }, [hasBalance, parsedBalance, parsedExchangeRate]);

  // Notify parent component about balance status with values for totals (optimized)
  useEffect(() => {
    const tokenBalanceValue = hasBalance ? parseFloat(parsedBalance) : 0;
    const usdtBalanceValue = hasBalance && parsedExchangeRate > 0 ? parseFloat(usdtValue) : 0;
    
    
    onBalanceCheck(hasBalance, userCollateralBalanceLoading, tokenBalanceValue, usdtBalanceValue);
  }, [hasBalance, userCollateralBalanceLoading, parsedBalance, usdtValue, parsedExchangeRate, onBalanceCheck, token.symbol]);

  // This component only calculates balances, no visual rendering
  return null;
});

// Fast parallel token processor component
const ParallelTokenProcessor = React.memo(function ParallelTokenProcessor({
  tokens,
  poolAddress,
  onTokenProcessed,
  onProgressUpdate
}: {
  tokens: Array<{
    symbol: string;
    addresses: Record<number, string>;
    decimals: number;
    logoURI?: string;
    logo?: string;
  }>;
  poolAddress: string;
  onTokenProcessed: (hasBalance: boolean, isLoading: boolean, tokenBalance?: number, usdtValue?: number) => void;
  onProgressUpdate: (processed: number, total: number) => void;
}) {
  const processedCount = useRef(0);
  const [mounted, setMounted] = useState(true);

  const handleTokenResult = useCallback((hasBalance: boolean, isLoading: boolean, tokenBalance?: number, usdtValue?: number) => {
    if (!mounted) return;
    
    processedCount.current += 1;
    
    onTokenProcessed(hasBalance, isLoading, tokenBalance, usdtValue);
    onProgressUpdate(processedCount.current, tokens.length);
  }, [tokens.length, onTokenProcessed, onProgressUpdate, mounted]);

  useEffect(() => {
    processedCount.current = 0;
    onProgressUpdate(0, tokens.length);
  }, [tokens.length, onProgressUpdate]);

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  return (
    <>
      {tokens.map((token: { symbol: string; addresses: Record<number, string>; decimals: number; logoURI?: string; logo?: string; }, index: number) => (
        <div key={`${token.symbol}-${poolAddress}-${index}`} style={{ display: 'none' }}>
          <TokenBalanceItem
            token={token}
            poolAddress={poolAddress}
            onBalanceCheck={handleTokenResult}
          />
        </div>
      ))}
    </>
  );
});

export const SwapTokenBalanceTable = React.memo(function SwapTokenBalanceTable({ 
  selectedPool, 
  className = "",
  onTotalUsdtUpdate
}: CollateralBalanceTableProps) {
  const [hasAnyBalance, setHasAnyBalance] = useState(false);
  const [isAnyLoading, setIsAnyLoading] = useState(false);
  const [totalUsdtValue, setTotalUsdtValue] = useState(0);
  const [showTimeoutFallback, setShowTimeoutFallback] = useState(false);
  
  // Progressive loading states
  const [processedTokens, setProcessedTokens] = useState(0);
  const [totalTokensToProcess, setTotalTokensToProcess] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const currentChainId = useCurrentChainId();
  const { isConnected } = useAccount();

  // Optimized token filtering: prioritize tokens likely to have balance
  const availableTokens = useMemo(() => {
    
    const filtered = tokens.filter(
      (token) =>
        token.addresses[currentChainId] &&
        token.addresses[currentChainId] !==
          "0x0000000000000000000000000000000000000000" &&
        token.symbol !== "GLMR" // Exclude native GLMR token
    );
    
    // Prioritize common tokens that are more likely to have balances
    // Order by likelihood of having balance: USDT > USDC > WETH > others
    const priorityOrder = ["USDT", "USDC", "WETH", "WBTC", "WGLMR"];
    const sorted = filtered.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.symbol);
      const bIndex = priorityOrder.indexOf(b.symbol);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
    
    // Increase limit to 5 tokens but process them efficiently
    const result = sorted.slice(0, 5);
    
    
    return result;
  }, [currentChainId]);

  // Get exchange rate for converting USDT to collateral token (moved before conditional returns)
  const usdtToken = useMemo(() => tokens.find(t => t.symbol === "USDT"), []);
  const collateralToken = selectedPool?.collateralTokenInfo;
  
  // Use fixed amount for exchange rate (1 USDT) to avoid dependency on totalUsdtValue
  const fixedAmountInUsdt = useMemo(() => {
    return usdtToken ? Math.floor(1 * Math.pow(10, usdtToken.decimals)) : 1000000; // 1 USDT
  }, [usdtToken]);
  
  // Only call exchange rate if we have valid pool and tokens
  const shouldFetchExchangeRate = Boolean(
    selectedPool?.lendingPool &&
    usdtToken?.addresses[currentChainId] &&
    collateralToken?.addresses[currentChainId] &&
    fixedAmountInUsdt > 0
  );

  const { parsedExchangeRate: usdtToCollateralRate, exchangeRateLoading: conversionLoading } = useOptimizedExchangeRate(
    (selectedPool?.lendingPool as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    (usdtToken?.addresses[currentChainId] as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    (collateralToken?.addresses[currentChainId] as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    usdtToken?.decimals || 6,
    collateralToken?.decimals || 18,
    shouldFetchExchangeRate
  );



  // Calculate total collateral equivalent with fallback estimation
  const totalCollateralEquivalent = useMemo(() => {
    if (totalUsdtValue > 0 && usdtToCollateralRate > 0) {
      const result = totalUsdtValue * usdtToCollateralRate;
      return result;
    }
    
    // Fallback estimation based on historical rates (can be updated)
    if (totalUsdtValue > 0 && showTimeoutFallback) {
      const fallbackRates: Record<string, number> = {
        'WGLMR': 0.15, // 1 USDT ≈ 0.15 WGLMR (estimate)
        'GLMR': 0.15,
        'ETH': 0.0003, // 1 USDT ≈ 0.0003 ETH (estimate)
        'BTC': 0.000015, // 1 USDT ≈ 0.000015 BTC (estimate)
      };
      
      const tokenSymbol = selectedPool?.collateralTokenInfo?.symbol;
      const fallbackRate = tokenSymbol ? fallbackRates[tokenSymbol] || 1 : 1;
      const result = totalUsdtValue * fallbackRate;
      
      return result;
    }
    

    
    return 0;
  }, [totalUsdtValue, usdtToCollateralRate, showTimeoutFallback, selectedPool?.collateralTokenInfo?.symbol]);


  const handleBalanceCheck = useCallback(
    (hasBalance: boolean, isLoading: boolean, _tokenBalance?: number, usdtValue?: number) => {
      
      // Immediate update for faster UI response
      if (hasBalance) {
        setHasAnyBalance(true);
      }
      
      setIsAnyLoading(isLoading);
      
      // Update totals immediately when we get valid data
      if (hasBalance && usdtValue !== undefined && usdtValue > 0) {
        setTotalUsdtValue(prev => {
          const newValue = prev + usdtValue;
          return newValue;
        });
      }
    },
    []
  );

  const handleProgressUpdate = useCallback((processed: number, total: number) => {
    setProcessedTokens(processed);
    setTotalTokensToProcess(total);
    setLoadingProgress(total > 0 ? (processed / total) * 100 : 0);
    
  }, []);

  // Reset states when pool changes
  useEffect(() => {
    
    setHasAnyBalance(false);
    setIsAnyLoading(true); // Start with loading true
    setTotalUsdtValue(0);
    setShowTimeoutFallback(false);
    
    // Reset progressive loading states
    setProcessedTokens(0);
    setTotalTokensToProcess(0);
    setLoadingProgress(0);
  }, [selectedPool?.lendingPool, selectedPool?.collateralTokenInfo?.symbol, selectedPool?.borrowTokenInfo?.symbol]);

  // Update loading state based on progress
  useEffect(() => {
    if (totalTokensToProcess > 0 && processedTokens >= totalTokensToProcess) {
      setIsAnyLoading(false);
    }
  }, [processedTokens, totalTokensToProcess]);

  // Send total USDT to parent component (for portfolio integration)
  useEffect(() => {
    if (onTotalUsdtUpdate) {
      onTotalUsdtUpdate(totalUsdtValue);
    }
  }, [totalUsdtValue, onTotalUsdtUpdate]);

  // Add timeout for loading state to show fallback after 10 seconds
  useEffect(() => {
    if (conversionLoading) {
      setShowTimeoutFallback(false);
      const timer = setTimeout(() => {
        setShowTimeoutFallback(true);
      }, TIMEOUT_DURATION);
      
      return () => clearTimeout(timer);
    }
  }, [conversionLoading]);

  if (!selectedPool) {
    return (
      <Card className={`${CARD_STYLES} ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Select a pool to view token balances</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If wallet is not connected, show beary guard inside the card
  if (!isConnected) {
    return (
      <Card className={`${CARD_STYLES} ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Token Balances
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Your collateral balances in</span>
            <div className="flex items-center gap-1">
              <TokenLogo token={selectedPool.collateralTokenInfo} size={16} />
              <span className="font-medium">
                {selectedPool.collateralTokenInfo?.symbol}
              </span>
            </div>
            <span>/</span>
            <div className="flex items-center gap-1">
              <TokenLogo token={selectedPool.borrowTokenInfo} size={16} />
              <span className="font-medium">
                {selectedPool.borrowTokenInfo?.symbol}
              </span>
            </div>
            <span>pool</span>
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Connect Wallet to View Balances
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Connect your wallet to view your token balances in this lending pool!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Beary is waiting for you!
            </p>
          </div>

          {/* Connect Button */}
          <Button
            onClick={() => window.location.href = '/profile'}
            className="bg-gradient-to-r from-[var(--electric-blue)] to-[var(--soft-teal)] hover:from-[var(--electric-blue)]/80 hover:to-[var(--soft-teal)]/80 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Connect Wallet
            </div>
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <>
      {/* Fast parallel token processing */}
      <ParallelTokenProcessor
        tokens={availableTokens}
        poolAddress={selectedPool.lendingPool}
        onTokenProcessed={handleBalanceCheck}
        onProgressUpdate={handleProgressUpdate}
      />

      {/* Total Collateral Summary Cards */}
      <div className="space-y-4">
        {/* Total USDT Value Card */}
        <Card className={`${CARD_STYLES} ${className}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Total Collateral Value
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Sum of all tokens in</span>
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
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">
                        {selectedPool.collateralTokenInfo?.symbol?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="font-medium">
                  {selectedPool.collateralTokenInfo?.symbol}
                </span>
              </div>
              <span>/</span>
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
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">
                        {selectedPool.borrowTokenInfo?.symbol?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="font-medium">
                  {selectedPool.borrowTokenInfo?.symbol}
                </span>
              </div>
              <span>pool</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Collateral Value in USDT</p>
                  <div className="text-2xl font-bold text-green-700">
                    {isAnyLoading ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">
                            {totalTokensToProcess > 0 
                              ? `Processing tokens ${processedTokens}/${totalTokensToProcess} (${loadingProgress.toFixed(0)}%)`
                              : "Reading collateral positions..."
                            }
                          </span>
                        </div>
                        {totalTokensToProcess > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${loadingProgress}%` }}
                            ></div>
                          </div>
                        )}
                        {totalUsdtValue > 0 && (
                          <div className="text-lg text-green-600">
                            Current: {formatLargeNumber(totalUsdtValue.toFixed(6))} USDT
                          </div>
                        )}
                      </div>
                    ) : (
                      `${formatLargeNumber(totalUsdtValue.toFixed(6))} USDT`
                    )}
                  </div>
                  {!isAnyLoading && totalUsdtValue > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Sum of all token positions converted to USDT
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  USDT Value
                </Badge>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Total Collateral in {selectedPool.collateralTokenInfo?.symbol || "Pool Token"}
                  </p>
                  <div className="text-2xl font-bold text-blue-700">
                    {isAnyLoading || (conversionLoading && !showTimeoutFallback) ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">
                          {showTimeoutFallback ? "Taking longer than expected..." : "Converting USDT to collateral..."}
                        </span>
                      </div>
                    ) : usdtToCollateralRate > 0 ? (
                      `${formatLargeNumber(totalCollateralEquivalent.toFixed(6))} ${selectedPool.collateralTokenInfo?.symbol || "TOKEN"}`
                    ) : totalCollateralEquivalent > 0 && showTimeoutFallback ? (
                      <div className="text-sm">
                        <div className="text-blue-700">≈ {formatLargeNumber(totalCollateralEquivalent.toFixed(6))} {selectedPool.collateralTokenInfo?.symbol}</div>
                        <div className="text-xs text-[var(--soft-teal)] mt-1">Estimated rate (exchange rate unavailable)</div>
                      </div>
                    ) : totalUsdtValue > 0 ? (
                      <div className="text-sm">
                        <div className="text-blue-700">≈ {formatLargeNumber(totalUsdtValue.toFixed(6))} USDT value</div>
                        <div className="text-xs text-[var(--soft-teal)] mt-1">Converting to {selectedPool.collateralTokenInfo?.symbol}...</div>
                      </div>
                    ) : (
                      "0 " + (selectedPool.collateralTokenInfo?.symbol || "TOKEN")
                    )}
                  </div>
                  {usdtToCollateralRate > 0 && !conversionLoading && totalUsdtValue > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Converted from {formatLargeNumber(totalUsdtValue.toFixed(2))} USDT at rate 1 USDT = {usdtToCollateralRate.toFixed(6)} {selectedPool.collateralTokenInfo?.symbol}
                    </p>
                  )}
                  {!conversionLoading && usdtToCollateralRate === 0 && totalUsdtValue > 0 && (
                    <p className="text-xs text-[var(--soft-teal)] mt-1">
                      Unable to get exchange rate for this pool
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {selectedPool.collateralTokenInfo?.symbol} Equivalent
                </Badge>
              </div>
            </div>

            {/* Show empty state if no balances found and not loading */}
            {!isAnyLoading && !hasAnyBalance && (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                <p className="text-sm font-medium text-gray-700 mb-1">
                  No collateral found
                </p>
                <p className="text-xs text-gray-500">
                  You don&apos;t have any collateral in this pool
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
});


