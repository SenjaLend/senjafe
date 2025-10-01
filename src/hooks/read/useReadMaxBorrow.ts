"use client";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { helperAbi } from "@/lib/abis/helperAbi";
import { helperAddress } from "@/lib/addresses/tokenAddress";

export type HexAddress = `0x${string}`;

export const useReadMaxBorrow = (
  lendingPoolAddress: HexAddress,
  decimal: number
) => {
  const { address } = useAccount();
  const {
    data: maxBorrow,
    isLoading: maxBorrowLoading,
    error: maxBorrowError,
    refetch: refetchMaxBorrow,
  } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getMaxBorrowAmount",
    args: [lendingPoolAddress, address as HexAddress],
    query: {
      enabled: !!address && !!lendingPoolAddress && lendingPoolAddress !== "0x0000000000000000000000000000000000000000",
      retry: 2,
      retryDelay: 1000,
    },
  });

  // Format max borrow with dynamic decimal places
  const formatMaxBorrow = (rawMaxBorrowData: unknown, hasError: boolean): string => {
    // If there's an error, return 0 instead of showing error
    if (hasError || !rawMaxBorrowData || rawMaxBorrowData === undefined)
      return "0.000";

    try {
      // getMaxBorrowAmount returns bigint
      const maxBorrowBigInt = rawMaxBorrowData as bigint;

      // Handle zero or negative values
      if (maxBorrowBigInt <= BigInt(0)) {
        return "0.000000";
      }

      // Convert from raw bigint to decimal number with better precision handling
      // Use string manipulation to avoid precision loss with large numbers
      const divisor = BigInt(Math.pow(10, decimal));
      const quotient = maxBorrowBigInt / divisor;
      const remainder = maxBorrowBigInt % divisor;
      
      // Convert to string for precise decimal handling
      const quotientStr = quotient.toString();
      const remainderStr = remainder.toString().padStart(decimal, '0');
      
      // Combine quotient and remainder with decimal point
      const result = quotientStr + '.' + remainderStr;
      
      // Use dynamic decimal places based on token decimals, but cap at 6 for display
      const decimalPlaces = Math.min(decimal, 6);
      const formattedResult = parseFloat(result).toFixed(decimalPlaces);
      
      return formattedResult;
    } catch {
      return "0.0000";
    }
  };

  const maxBorrowFormatted = formatMaxBorrow(maxBorrow, !!maxBorrowError);

  return {
    maxBorrow: maxBorrowError ? BigInt(0) : (maxBorrow as bigint | undefined),
    maxBorrowFormatted,
    maxBorrowLoading: maxBorrowLoading,
    maxBorrowError: null, // Always return null for error to prevent error UI
    refetchMaxBorrow,
  };
};
