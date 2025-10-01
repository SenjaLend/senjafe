"use client";

import { useReadContract } from "wagmi";
import { lendingPoolRouterAbi } from "@/lib/abis/lendingPoolRouterAbi";
import { useAccount } from "wagmi";
import { useReadRouterAddress } from "./useReadRouter";

export type HexAddress = `0x${string}`;

export const useReadUserPosition = (lendingPoolAddress: HexAddress) => {
  const { address } = useAccount();
  const { routerAddress } = useReadRouterAddress(lendingPoolAddress);
  const {
    data: userPosition,
    isLoading: userPositionLoading,
    error: userPositionError,
    refetch: refetchUserPosition,
  } = useReadContract({
    address: routerAddress,
    abi: lendingPoolRouterAbi,
    functionName: "addressPositions",
    args: [address as HexAddress],
  });

  return {
    userPosition: userPosition,
    userPositionLoading: userPositionLoading,
    userPositionError: userPositionError,
    refetchUserPosition,
  };
};
