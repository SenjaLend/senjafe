import { helperAbi } from "@/lib/abis/helperAbi";
import { useReadContract } from "wagmi";
import { useCurrentChain } from "@/lib/chain";

export type HexAddress = `0x${string}`;

export const useReadApy = (lendingPoolAddress?: HexAddress) => {
  const currentChain = useCurrentChain();

  // Use provided address or fallback to chain's lending pool address
  const contractAddress =
    lendingPoolAddress || (currentChain.contracts.lendingPool as HexAddress);

  // Check if we have a valid contract address
  const hasValidAddress =
    contractAddress &&
    contractAddress !== "0x0000000000000000000000000000000000000000" &&
    contractAddress.length > 2;

  const {
    data: apyData,
    isLoading: apyLoading,
    error: apyError,
    refetch: refetchApy,
  } = useReadContract({
    address: hasValidAddress ? contractAddress : undefined,
    abi: helperAbi,
    functionName: "getAPY",
    args: [lendingPoolAddress as HexAddress],
  });

  // Format APY with 5 decimal places
  const formatApy = (rawApyData: unknown): string => {
    if (!rawApyData || rawApyData === undefined) return "0.00000";
    
    try {
      // getAPY returns [supplyAPY, borrowAPY, utilizationRate]
      const apyArray = rawApyData as [bigint, bigint, bigint];
      const supplyAPY = apyArray[0];
      
      // Use supplyAPY and convert from 5 decimal places to percentage
      const apyNumber = Number(supplyAPY) / Math.pow(10, 5);
      return apyNumber.toFixed(5);
    } catch {
      return "0.00000";
    }
  };

  const apyFormatted = formatApy(apyData);

  return {
    apy: apyData as [bigint, bigint, bigint] | undefined,
    apyFormatted,
    apyLoading: hasValidAddress ? apyLoading : false,
    apyError: hasValidAddress ? apyError : null,
    refetchApy,
  };
};
