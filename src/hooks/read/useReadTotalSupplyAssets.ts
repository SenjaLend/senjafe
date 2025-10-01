import { helperAbi } from "@/lib/abis/helperAbi";
import { useReadContract } from "wagmi";
import { useCurrentChain } from "@/lib/chain";
import { useState, useEffect } from "react";
import { formatUnits } from "viem";
import { tokens, helperAddress } from "@/lib/addresses/tokenAddress";

export type HexAddress = `0x${string}`;

// Helper function to find token by address and get decimals
function getTokenDecimals(tokenAddress: HexAddress | undefined, chainId: number): number {
  // Ensure tokenAddress is a string and has the correct format
  if (!tokenAddress || typeof tokenAddress !== 'string') {
    return 18; // Default to 18 if invalid address
  }
  
  const normalizedAddress = tokenAddress.toLowerCase();
  
  const token = tokens.find(token => {
    const tokenAddr = token.addresses[chainId]?.toLowerCase();
    return tokenAddr === normalizedAddress;
  });
  
  return token?.decimals || 18; // Default to 18 if not found
}

export const useReadTotalSupplyAssets = (lendingPoolAddress?: HexAddress, tokenAddress?: HexAddress) => {
  const currentChain = useCurrentChain();
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Get dynamic decimals from token address
  const decimals = getTokenDecimals(tokenAddress, currentChain.id);

  // Use helper contract address for the contract call
  const contractAddress = helperAddress as HexAddress;

  // Check if we have a valid lending pool address
  const hasValidAddress =
    lendingPoolAddress &&
    lendingPoolAddress !== "0x0000000000000000000000000000000000000000" &&
    lendingPoolAddress.length > 2;

  const {
    data: totalSupplyAssets,
    isLoading: totalSupplyAssetsLoading,
    error: totalSupplyAssetsError,
    refetch: refetchTotalSupplyAssets,
  } = useReadContract({
    address: contractAddress,
    abi: helperAbi,
    functionName: "getTotalLiquidity",
    args: hasValidAddress ? [lendingPoolAddress as HexAddress] : undefined,
  });

  // Timeout mechanism - stop loading after 3 seconds
  useEffect(() => {
    if (!hasValidAddress) {
      setTimeoutReached(false);
      return;
    }

    const timer = window.setTimeout(() => {
      if (totalSupplyAssetsLoading) {
        setTimeoutReached(true);
      }
    }, 3000); // 3 seconds timeout

    return () => window.clearTimeout(timer);
  }, [hasValidAddress, totalSupplyAssetsLoading]);

  // Reset timeout when data is received
  useEffect(() => {
    if (totalSupplyAssets !== undefined) {
      setTimeoutReached(false);
    }
  }, [totalSupplyAssets]);

  // Parse total supply assets with dynamic decimals
  const parseTotalSupplyAssets = (rawData: unknown) => {
    if (!rawData || rawData === undefined) return BigInt(0);
    return rawData as bigint;
  };

  const formatTotalSupplyAssets = (rawData: bigint) => {
    try {
      return formatUnits(rawData, decimals);
    } catch {
      return "0";
    }
  };

  // Determine final values based on timeout and loading state
  const finalLoading =
    hasValidAddress && totalSupplyAssetsLoading && !timeoutReached;
  const finalData = timeoutReached
    ? BigInt(0)
    : hasValidAddress
    ? parseTotalSupplyAssets(totalSupplyAssets)
    : BigInt(0);

  const formattedData = formatTotalSupplyAssets(finalData);

  return {
    totalSupplyAssets: finalData,
    totalSupplyAssetsFormatted: formattedData,
    totalSupplyAssetsLoading: finalLoading,
    totalSupplyAssetsError: hasValidAddress ? totalSupplyAssetsError : null,
    refetchTotalSupplyAssets,
  };
};
