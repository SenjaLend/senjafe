"use client";

import { useMemo } from "react";
import { useReadExchangeRate } from "./useReadExchangeRate";

export type HexAddress = `0x${string}`;

// Cache untuk menyimpan exchange rate yang sudah dihitung
const exchangeRateCache = new Map<string, { rate: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds cache

export const useOptimizedExchangeRate = (
  lendingPoolAddress: HexAddress,
  fromTokenAddress: HexAddress,
  toTokenAddress: HexAddress,
  fromTokenDecimals: number,
  toTokenDecimals: number,
  enabled: boolean = true
) => {
  // Create cache key
  const cacheKey = useMemo(() => 
    `${lendingPoolAddress}-${fromTokenAddress}-${toTokenAddress}`,
    [lendingPoolAddress, fromTokenAddress, toTokenAddress]
  );

  // Check cache first
  const cachedRate = useMemo(() => {
    if (!enabled) return null;
    
    const cached = exchangeRateCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.rate;
    }
    return null;
  }, [cacheKey, enabled]);

  // Use fixed amount (1 unit) for consistent calculation
  const fixedAmount = useMemo(() => 
    Math.pow(10, fromTokenDecimals), 
    [fromTokenDecimals]
  );

  // Only call the hook if cache miss and enabled
  const shouldFetch = enabled && cachedRate === null;
  
  const { 
    parsedExchangeRate,
    exchangeRateLoading,
    exchangeRateError 
  } = useReadExchangeRate(
    shouldFetch ? lendingPoolAddress : "0x0000000000000000000000000000000000000000",
    shouldFetch ? fromTokenAddress : "0x0000000000000000000000000000000000000000",
    shouldFetch ? toTokenAddress : "0x0000000000000000000000000000000000000000",
    shouldFetch ? fixedAmount : 0,
    fromTokenDecimals,
    toTokenDecimals
  );

  // Update cache when we get new data
  const finalRate = useMemo(() => {
    if (cachedRate !== null) {
      return cachedRate;
    }
    
    if (parsedExchangeRate > 0) {
      exchangeRateCache.set(cacheKey, {
        rate: parsedExchangeRate,
        timestamp: Date.now()
      });
      return parsedExchangeRate;
    }
    
    return 0;
  }, [cacheKey, cachedRate, parsedExchangeRate]);

  const isLoading = shouldFetch && exchangeRateLoading;

  return {
    parsedExchangeRate: finalRate,
    exchangeRateLoading: isLoading,
    exchangeRateError: shouldFetch ? exchangeRateError : null,
    fromCache: cachedRate !== null
  };
};
