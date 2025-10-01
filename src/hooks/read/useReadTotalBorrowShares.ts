import { useReadContract } from "wagmi";

import { lendingPoolRouterAbi } from "@/lib/abis/lendingPoolRouterAbi";
import { useReadRouterAddress } from "./useReadRouter";

export type HexAddress = `0x${string}`;

export const useReadTotalBorrowShares = (lendingPoolAddress: HexAddress) => {
  const { routerAddress } = useReadRouterAddress(lendingPoolAddress);
  const {
    data: totalBorrowShares,
    isLoading: totalBorrowSharesLoading,
    error: totalBorrowSharesError,
    refetch: refetchTotalBorrowShares,
  } = useReadContract({
    address: routerAddress,
    abi: lendingPoolRouterAbi,
    functionName: "totalBorrowShares",
    args: [],
  });
  
  // If borrow shares is not found, return 0
  const effectiveTotalBorrowShares = totalBorrowShares || BigInt(0);
  

  return {
    totalBorrowShares: effectiveTotalBorrowShares,
    totalBorrowSharesLoading: totalBorrowSharesLoading,
    totalBorrowSharesError: totalBorrowSharesError,
    refetchTotalBorrowShares,
  };
};
