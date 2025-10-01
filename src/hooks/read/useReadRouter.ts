"use client";

import { useReadContract } from "wagmi";
import { helperAbi } from "@/lib/abis/helperAbi";
import { helperAddress } from "@/lib/addresses/tokenAddress";

export type HexAddress = `0x${string}`;

export const useReadRouterAddress = (lendingPoolAddress: HexAddress) => {
  const { data, isLoading, error, refetch } = useReadContract({
    abi: helperAbi,
    address: helperAddress,
    functionName: "getRouter",
    args: [lendingPoolAddress as HexAddress],
  });

  return {
    routerAddress: data,
    routerLoading: isLoading,
    routerError: error,
    refetchRouter: refetch,
  };
};
