"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { mockErc20Abi } from "@/lib/abis/mockErc20Abi";
import { chains } from "@/lib/addresses/chainAddress";
import { isUserRejection } from "@/utils/error-handling";
import { parseAmountToBigInt } from "@/utils/format";

export type HexAddress = `0x${string}`;

export const useApprove = (chainId: number, onSuccess?: (txHash?: HexAddress) => void) => {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isApproving, setIsApproving] = useState(false);
  const [isApproveSuccess, setIsApproveSuccess] = useState(false);

  const { writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && txHash) {
      setIsApproving(false);
      setIsApproveSuccess(true);
      setSuccessTxHash(txHash);
      if (onSuccess) {
        onSuccess(txHash);
      }
      setTxHash(undefined);
    }
  }, [isSuccess, onSuccess, txHash]);

  // Handle write error (including user rejection)
  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError.message || "";
      
      if (isUserRejection(errorMessage)) {
        // Automatically revert state for user rejection
        setIsApproving(false);
        setTxHash(undefined);
        setIsApproveSuccess(false);
        setSuccessTxHash(undefined);
      }
    }
  }, [writeError]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setIsApproving(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);

  const handleApprove = async (tokenAddress: HexAddress, spenderAddress: HexAddress, amount: string, decimals: number) => {
    if (!address) {
      return;
    }

    const chain = chains.find((c) => c.id === chainId);
    if (!chain) {
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      setIsApproving(true);
      setTxHash(undefined);

      // Convert amount to BigInt with proper decimal conversion
      const amountBigInt = parseAmountToBigInt(amount, decimals);

      const tx = await writeContractAsync({
        address: tokenAddress,
        abi: mockErc20Abi,
        functionName: "approve",
        args: [spenderAddress, amountBigInt],
      });

      setTxHash(tx as HexAddress);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (isUserRejection(errorMessage)) {
        // Don't log error for user rejection, just reset state
        setIsApproving(false);
        setTxHash(undefined);
      } else {
        // Only log non-user-rejection errors
        setIsApproving(false);
        setTxHash(undefined);
      }
    }
  };

  return {
    handleApprove,
    isApproving: isApproving || (isWritePending && !writeError && !isApproveSuccess),
    isConfirming,
    isSuccess: isApproveSuccess,
    isError,
    txHash: txHash || successTxHash,
    writeError,
    confirmError,
  };
};