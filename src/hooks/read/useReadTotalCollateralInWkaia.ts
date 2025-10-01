"use client";

import { useMemo } from "react";
import { useReadUserCollateral } from "./useReadUserCollateral";
import { useReadExchangeRate } from "./useReadExchangeRate";
import { tokens } from "@/lib/addresses/tokenAddress";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { useCurrentChainId } from "@/lib/chain";

export type HexAddress = `0x${string}`;

interface TokenCollateralData {
  token: {
    symbol: string;
    addresses: Record<number, string>;
    decimals: number;
    logoURI?: string;
    logo?: string;
  };
  collateralBalance: string;
  collateralLoading: boolean;
  wkaiaEquivalent: number;
  wkaiaLoading: boolean;
  pool: LendingPoolWithTokens;
}

export const useReadTotalCollateralInWkaia = (
  pools: LendingPoolWithTokens[]
) => {
  const currentChainId = useCurrentChainId();

  // Get native wrapped token for current chain (WGLMR for Moonbeam, WETH for Base)
  const nativeToken = useMemo(() => {
    if (currentChainId === 1284) {
      return tokens.find(token => token.symbol === "WGLMR");
    } else if (currentChainId === 8453) {
      return tokens.find(token => token.symbol === "WETH");
    }
    // Default to WGLMR if chain not recognized
    return tokens.find(token => token.symbol === "WGLMR");
  }, [currentChainId]);

  // For now, limit to first pool to avoid conditional hooks
  // In a production app, you'd want to use a different pattern like:
  // - A custom hook that handles multiple pools
  // - Or use a data fetching library that handles this pattern
  const firstPool = pools[0];
  const collateralToken = firstPool?.collateralTokenInfo;
  
  const {
    userCollateralFormatted: collateralBalance,
    userCollateralLoading: collateralLoading
  } = useReadUserCollateral(
    (firstPool?.lendingPool as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    collateralToken?.decimals || 18
  );

  // Get exchange rate from collateral token to native token
  const collateralAmount = parseFloat(collateralBalance || "0");
  const {
    parsedExchangeRate: exchangeRate,
    exchangeRateLoading: exchangeRateLoading
  } = useReadExchangeRate(
    (firstPool?.lendingPool as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    (collateralToken?.addresses[currentChainId] as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    (nativeToken?.addresses[currentChainId] as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    collateralAmount,
    collateralToken?.decimals || 18,
    nativeToken?.decimals || 18
  );

  // Calculate native token equivalent
  const wkaiaEquivalent = collateralAmount * exchangeRate;

  // Get all token collateral data across all pools
  const tokenCollateralData = useMemo(() => {
    const data: TokenCollateralData[] = [];

    if (firstPool && collateralToken && nativeToken) {
      data.push({
        token: {
          symbol: collateralToken.symbol,
          addresses: collateralToken.addresses,
          decimals: collateralToken.decimals,
          logoURI: collateralToken.logo,
          logo: collateralToken.logo
        },
        collateralBalance: collateralBalance || "0",
        collateralLoading,
        wkaiaEquivalent,
        wkaiaLoading: exchangeRateLoading,
        pool: firstPool
      });
    }

    return data;
  }, [firstPool, collateralToken, nativeToken, collateralBalance, collateralLoading, wkaiaEquivalent, exchangeRateLoading]);

  // Calculate total collateral in native token
  const totalCollateralInWkaia = useMemo(() => {
    return tokenCollateralData.reduce((total, data) => {
      return total + data.wkaiaEquivalent;
    }, 0);
  }, [tokenCollateralData]);

  // Check if any data is loading
  const isLoading = useMemo(() => {
    return tokenCollateralData.some(data => data.collateralLoading || data.wkaiaLoading);
  }, [tokenCollateralData]);

  // Check if any data has error
  const hasError = useMemo(() => {
    return tokenCollateralData.some(data => 
      data.collateralBalance === "0" && !data.collateralLoading && !data.wkaiaLoading
    );
  }, [tokenCollateralData]);

  return {
    tokenCollateralData,
    totalCollateralInWkaia,
    isLoading,
    hasError,
    nativeToken
  };
};
