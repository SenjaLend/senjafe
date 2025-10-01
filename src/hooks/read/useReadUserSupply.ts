import { useReadContract } from "wagmi";

import { lendingPoolRouterAbi } from "@/lib/abis/lendingPoolRouterAbi";
import { useAccount } from "wagmi";
import { useReadRouterAddress } from "./useReadRouter";

export type HexAddress = `0x${string}`;

export const useReadUserSupply = (
  lendingPoolAddress: HexAddress,
  decimal: number
) => {
  const { address } = useAccount();
const { routerAddress } = useReadRouterAddress(lendingPoolAddress);
  const {
    data: userSupplyShares,
    isLoading: userSupplySharesLoading,
    error: userSupplySharesError,
    refetch: refetchUserSupplyShares,
  } = useReadContract({
    address: routerAddress,
    abi: lendingPoolRouterAbi,
    functionName: "userSupplyShares",
    args: [address as HexAddress],
  });

  // Format user supply shares with dynamic decimal places
  const formatUserSupplyShares = (rawUserSupplySharesData: unknown): string => {
    if (!rawUserSupplySharesData || rawUserSupplySharesData === undefined)
      return "0.0000";

    try {
      // userSupplyShares returns a single bigint value (supply shares)
      const userSupplySharesBigInt = rawUserSupplySharesData as bigint;


      // Convert from raw bigint to decimal number
      const userSupplySharesNumber =
        Number(userSupplySharesBigInt) / Math.pow(10, decimal);
      
      
      // Use dynamic decimal places based on token decimals
      const decimalPlaces = Math.min(decimal, 6); // Cap at 6 decimal places for display
      const result = userSupplySharesNumber.toFixed(decimalPlaces);
      
      return result;
    } catch {
      return "0.0000";
    }
  };

  const userSupplySharesFormatted = formatUserSupplyShares(userSupplyShares);

  return {
    userSupplyShares: userSupplyShares as bigint | undefined,
    userSupplySharesFormatted,
    userSupplySharesLoading: userSupplySharesLoading,
    userSupplySharesError: userSupplySharesError,
    refetchUserSupplyShares,
  };
};
