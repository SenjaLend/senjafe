import { useAccount, useReadContract } from "wagmi";

import { helperAbi } from "@/lib/abis/helperAbi";
import { helperAddress } from "@/lib/addresses/tokenAddress";

export type HexAddress = `0x${string}`;

export const useReadUserCollateral = (
  lendingPoolAddress: HexAddress,
  decimal: number
) => {
  const { address } = useAccount();
  const {
    data: userCollateral,
    isLoading: userCollateralLoading,
    error: userCollateralError,
    refetch: refetchUserCollateral,
  } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getCollateralBalance",
    args: [lendingPoolAddress, address as HexAddress],
  });

  // Format user collateral with dynamic decimal places
  const formatUserCollateral = (rawUserCollateralData: unknown): string => {
    if (!rawUserCollateralData || rawUserCollateralData === undefined)
      return "0.00000";

    try {
      // getCollateralBalance returns bigint
      const userCollateralBigInt = rawUserCollateralData as bigint;

      // Convert from raw bigint to decimal number
      const userCollateralNumber =
        Number(userCollateralBigInt) / Math.pow(10, decimal);
      
      // Use dynamic decimal places based on token decimals
      const decimalPlaces = Math.min(decimal, 6); // Cap at 6 decimal places for display
      return userCollateralNumber.toFixed(decimalPlaces);
    } catch {
      return "0.00000";
    }
  };

  const userCollateralFormatted = formatUserCollateral(userCollateral);

  return {
    userCollateral: userCollateral as bigint | undefined,
    userCollateralFormatted,
    userCollateralLoading: userCollateralLoading,
    userCollateralError: userCollateralError,
    refetchUserCollateral,
  };
};
