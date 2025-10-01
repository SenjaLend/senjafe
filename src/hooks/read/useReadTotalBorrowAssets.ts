import { useReadContract } from "wagmi";

import { lendingPoolRouterAbi } from "@/lib/abis/lendingPoolRouterAbi";
import { useReadRouterAddress } from "./useReadRouter";

export type HexAddress = `0x${string}`;

export const useReadTotalBorrowAssets = (lendingPoolAddress: HexAddress) => {
  const { routerAddress } = useReadRouterAddress(lendingPoolAddress);
  const {
    data: totalBorrowAssets,
    isLoading: totalBorrowAssetsLoading,
    error: totalBorrowAssetsError,
    refetch: refetchTotalBorrowAssets,
  } = useReadContract({
    address: routerAddress,
    abi: lendingPoolRouterAbi,
    functionName: "totalBorrowAssets",
    args: [],
  });
  
  // If borrow amount is not found, return 0
  const effectiveTotalBorrowAssets = totalBorrowAssets || BigInt(0);
  

  return {
    totalBorrowAssets: effectiveTotalBorrowAssets,
    totalBorrowAssetsLoading: totalBorrowAssetsLoading,
    totalBorrowAssetsError: totalBorrowAssetsError,
    refetchTotalBorrowAssets,
  };
};
