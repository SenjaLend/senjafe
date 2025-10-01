import { useAccount, useReadContract } from "wagmi";
import { helperAbi } from "@/lib/abis/helperAbi";
import { helperAddress } from "@/lib/addresses/tokenAddress";

export type HexAddress = `0x${string}`;

export const useReadHealthFactor = (lendingPoolAddress: HexAddress) => {
  const { address } = useAccount();

  const {
    data: healthFactor,
    isLoading,
    error,
    refetch: refetchHealthFactor,
  } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getHealthFactor",
    args: [lendingPoolAddress, address as HexAddress],
  });

  return {
    healthFactor,
    isLoading,
    error,
    refetchHealthFactor,
  };
};
