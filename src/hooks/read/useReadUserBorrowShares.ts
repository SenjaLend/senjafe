import { useReadContract } from "wagmi";

import { lendingPoolRouterAbi } from "@/lib/abis/lendingPoolRouterAbi";
import { useAccount } from "wagmi";
import { useReadRouterAddress } from "./useReadRouter";

export type HexAddress = `0x${string}`;

export const useReadUserBorrowShares = (
  lendingPoolAddress: HexAddress,
  decimal: number
) => {
  const { address } = useAccount();
  const { routerAddress } = useReadRouterAddress(lendingPoolAddress);
  const {
    data: userBorrowShares,
    isLoading: userBorrowSharesLoading,
    error: userBorrowSharesError,
    refetch: refetchUserBorrowShares,
  } = useReadContract({
    address: routerAddress,
    abi: lendingPoolRouterAbi,
    functionName: "userBorrowShares",
    args: [address as HexAddress],
  });

  // Format user borrow shares with dynamic decimal places
  const formatUserBorrowShares = (rawUserBorrowSharesData: unknown): string => {
    if (!rawUserBorrowSharesData || rawUserBorrowSharesData === undefined)
      return "0.00000";

    try {
      // userBorrowShares returns a single bigint value (borrow shares)
      const userBorrowSharesBigInt = rawUserBorrowSharesData as bigint;

      // If borrow amount is not found or is 0, return 0
      if (userBorrowSharesBigInt === BigInt(0)) {
        return "0.00000";
      }


      // Convert from raw bigint to decimal number
      const userBorrowSharesNumber =
        Number(userBorrowSharesBigInt) / Math.pow(10, decimal);


      // Use dynamic decimal places based on token decimals
      const decimalPlaces = Math.min(decimal, 6); // Cap at 6 decimal places for display
      const result = userBorrowSharesNumber.toFixed(decimalPlaces);

      return result;
    } catch {
      return "0.00000";
    }
  };

  const userBorrowSharesFormatted = formatUserBorrowShares(userBorrowShares);

  return {
    userBorrowShares: userBorrowShares as bigint | undefined,
    userBorrowSharesFormatted,
    userBorrowSharesLoading: userBorrowSharesLoading,
    userBorrowSharesError: userBorrowSharesError,
    refetchUserBorrowShares,
  };
};
