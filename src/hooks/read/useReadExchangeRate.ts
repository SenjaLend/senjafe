"use client";

import { useReadContract } from "wagmi";
import { useReadUserPosition } from "./usereadUserPosition";
import { helperAddress } from "@/lib/addresses/tokenAddress";
import { helperAbi } from "@/lib/abis/helperAbi";

export type HexAddress = `0x${string}`;

export const useReadExchangeRate = (
  lendingPoolAddress: HexAddress,
  fromTokenAddress: HexAddress,
  toTokenAddress: HexAddress,
  amountIn: number,
  fromTokenDecimals: number,
  toTokenDecimals: number
) => {
  const { userPosition, userPositionLoading, userPositionError } =
    useReadUserPosition(lendingPoolAddress);
  
  // Validate amountIn to prevent Infinity or invalid values
  const isValidAmount = amountIn > 0 && isFinite(amountIn) && !isNaN(amountIn);
  
  // Use a minimum amount for exchange rate calculation to ensure it always works
  const getSafeAmountIn = () => {
    if (isValidAmount) return Math.floor(amountIn); // Ensure integer for BigInt conversion
    // Use a more meaningful amount (0.01 in token units) for better exchange rate calculation
    return Math.pow(10, fromTokenDecimals - 2); // 0.01 in token decimals
  };
  
  const safeAmountIn = getSafeAmountIn();
  
  // Allow exchange rate calculation when we have all required data
  const canCalculateRate = !!userPosition && 
    !userPositionLoading && 
    !userPositionError && 
    !!fromTokenAddress && 
    !!toTokenAddress &&
    fromTokenAddress !== "0x0000000000000000000000000000000000000000" &&
    toTokenAddress !== "0x0000000000000000000000000000000000000000" &&
    lendingPoolAddress !== "0x0000000000000000000000000000000000000000";
  
  // Ensure safeAmountIn is a valid integer for BigInt conversion
  const safeAmountInBigInt = Number.isInteger(safeAmountIn) && safeAmountIn > 0 
    ? BigInt(safeAmountIn) 
    : BigInt(1);

  const {
    data: exchangeRate,
    isLoading: exchangeRateLoading,
    error: exchangeRateError,
    refetch: refetchExchangeRate,
  } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getExchangeRate",
    args: [
      fromTokenAddress,
      toTokenAddress,
      safeAmountInBigInt,
      userPosition as `0x${string}`,
    ],
    query: {
      enabled: canCalculateRate && Number.isInteger(safeAmountIn) && safeAmountIn > 0, // Additional validation
      refetchInterval: 30000, // Refetch every 30 seconds to reduce API calls
      staleTime: 20000, // Consider data fresh for 20 seconds
    },
  });

  // Parse exchange rate - the contract returns amount out in token out decimals
  // We need to convert it to human readable format by dividing by toTokenDecimals
  // Also account for the input amount to get the actual rate per unit
  const parsedExchangeRate = exchangeRate && safeAmountIn > 0
    ? (Number(exchangeRate) / Math.pow(10, toTokenDecimals)) / (safeAmountIn / Math.pow(10, fromTokenDecimals))
    : 0;


  return {
    exchangeRate: exchangeRate,
    exchangeRateLoading: exchangeRateLoading || userPositionLoading,
    parsedExchangeRate: parsedExchangeRate,
    exchangeRateError: exchangeRateError || userPositionError,
    refetchExchangeRate,
  };
};
