"use client";

import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import { useReadUserPosition } from "./usereadUserPosition";

export type HexAddress = `0x${string}`;

export const useReadUserCollateralBalance = (
  lendingPoolAddress: HexAddress,
  tokenAddress: HexAddress,
  decimal: number
) => {
  const { userPosition, userPositionLoading, userPositionError } = useReadUserPosition(lendingPoolAddress);
  
  // Check if user has a valid position (not zero address/burn address)
  const hasValidPosition = userPosition && 
    userPosition !== "0x0000000000000000000000000000000000000000" &&
    userPosition !== "0x0000000000000000000000000000000000000001"; // Also exclude GLMR native token address
  
  const {
    data: userCollateralBalance,
    isLoading: userCollateralBalanceLoading,
    error: userCollateralBalanceError,
    refetch: refetchUserCollateralBalance,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userPosition as `0x${string}`],
    query: {
      enabled: hasValidPosition && 
        !userPositionLoading && 
        !userPositionError &&
        !!tokenAddress &&
        tokenAddress !== "0x0000000000000000000000000000000000000000" &&
        !!lendingPoolAddress &&
        lendingPoolAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Parse balance with decimal - return 0 if no valid position
  const parsedBalance = hasValidPosition && userCollateralBalance 
    ? Number(userCollateralBalance) / Math.pow(10, decimal)
    : 0;

  return {
    userCollateralBalance: hasValidPosition ? userCollateralBalance : BigInt(0),
    parsedUserCollateralBalance: parsedBalance,
    userCollateralBalanceLoading: userCollateralBalanceLoading || userPositionLoading,
    userCollateralBalanceError: userCollateralBalanceError || userPositionError,
    refetchUserCollateralBalance,
  };
};
