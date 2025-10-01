import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { useMemo } from "react";
import { helperAbi } from "@/lib/abis/helperAbi";
import { helperAddress } from "@/lib/addresses/tokenAddress";
import { parseAmountToBigIntSafe } from "@/utils/format";
import { Token } from "@/types";

export type HexAddress = `0x${string}`;

export const useReadFee = (
  destinationEndpoint: number,
  amount: string | bigint,
  decimal: number,
  token: Token,
  chainFrom?: string,
  chainTo?: string
) => {
  const { address } = useAccount();
  const oftAddress = token.oftAddress;
  
  // Validate that token has oftAddress
  if (!oftAddress) {
    throw new Error(`Token ${token.symbol} does not have an OFT address configured`);
  }
  
  // Parse amount to bigint with proper decimal handling
  const parsedAmount = useMemo(() => {
    if (typeof amount === "bigint") {
      return amount;
    }
    return parseAmountToBigIntSafe(amount, decimal);
  }, [amount, decimal]);

  // Check if this is onchain borrowing on Moonbeam (fee = 0)
  const isMoonbeamOnchain = chainFrom === "1284" && chainTo === "1284";
  
  // All fees are now 0 - both onchain and cross-chain
  const shouldSkipBlockchainRead = true;

  const {
    data: rawFee,
    isLoading: feeLoading,
    error: feeError,
    refetch: refetchFee,
  } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getFee",
    args: [
      oftAddress as HexAddress,
      destinationEndpoint,
      address as HexAddress,
      parsedAmount,
    ],
    query: {
      enabled: false, // Never call contract - all fees are 0
    },
  });

  // Convert fee to 18 decimals and handle special cases
  const fee = useMemo(() => {
    // All fees are 0 - both onchain and cross-chain
    return BigInt(0);
  }, []);

  return {
    fee: fee,
    feeLoading: false, // No loading - all fees are 0
    feeError: null, // No error - all fees are 0
    refetchFee,
    parsedAmount,
  };
};
