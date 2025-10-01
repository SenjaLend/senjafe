"use client";
import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { factoryAbi } from "@/lib/abis/factoryAbi";
import { chains } from "@/lib/addresses/chainAddress";
import { useCurrentChainId } from "@/lib/chain/use-chain";

export type HexAddress = `0x${string}`;

export const useCreatePool = (onSuccess?: () => void) => {
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState<string>("");
  const [isUserRejection, setIsUserRejection] = useState(false);
  const currentChainId = useCurrentChainId();

  const {
    writeContractAsync,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && txHash) {
      setSuccessTxHash(txHash);
      setShowSuccessAlert(true);
      setIsCreating(false);
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isSuccess, txHash, onSuccess]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setIsCreating(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);

  // Handle write error
  useEffect(() => {
    if (writeError) {
      setIsCreating(false);
      // Check if it's a user rejection error
      const errorMessage = writeError.message || writeError.toString();
      if (errorMessage.includes("User denied") || 
          errorMessage.includes("User rejected") || 
          errorMessage.includes("User denied request signature") ||
          errorMessage.includes("cancelled") ||
          errorMessage.includes("rejected")) {
        // Silent handling for user rejection - no console error
        setIsUserRejection(true);
      } else {
        // Log other errors
        setIsUserRejection(false);
      }
    }
  }, [writeError]);

  const handleCreate = async (
    collateralTokenAddress: string,
    borrowTokenAddress: string,
    ltvValue: string
  ) => {
    try {
      setIsCreating(true);
      setTxHash(undefined);

      const ltvFloat = parseFloat(ltvValue);
      const ltvBigInt = BigInt(Math.floor(ltvFloat * 1e16));

      // Get current chain
      const chain = chains.find((c) => c.id === currentChainId);
      if (!chain) {
        throw new Error(`Chain with ID ${currentChainId} not found`);
      }

      const tx = await writeContractAsync({
        address: chain.contracts.factory as HexAddress,
        abi: factoryAbi,
        functionName: "createLendingPool",
        args: [
          collateralTokenAddress as HexAddress,
          borrowTokenAddress as HexAddress,
          ltvBigInt,
        ],
      });

      setTxHash(tx as HexAddress);
    } catch (err: unknown) {
      setIsCreating(false);
      // Check if it's a user rejection error
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("User denied") || 
          errorMessage.includes("User rejected") || 
          errorMessage.includes("User denied request signature") ||
          errorMessage.includes("cancelled") ||
          errorMessage.includes("rejected")) {
        // Silent handling for user rejection - no console error
        setIsUserRejection(true);
      } else {
        // Log other errors
        setIsUserRejection(false);
      }
    }
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
    setSuccessTxHash("");
    setTxHash(undefined);
  };

  const resetUserRejection = () => {
    setIsUserRejection(false);
  };

  return {
    handleCreate,
    isCreating: isCreating || isWritePending,
    isConfirming,
    isSuccess,
    isError: isError && !isUserRejection, // Only show error if it's not a user rejection
    txHash,
    writeError,
    confirmError,
    showSuccessAlert,
    successTxHash,
    handleCloseSuccessAlert,
    isUserRejection,
    resetUserRejection,
  };
};
