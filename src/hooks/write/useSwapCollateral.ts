"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { positionAbi } from "@/lib/abis/positionAbi";
import { chains } from "@/lib/addresses/chainAddress";
import { parseAmountToBigInt } from "@/utils/format";

export type HexAddress = `0x${string}`;

export const useSwapCollateral = (
  chainId: number,
  onSuccess: () => void
) => {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailedAlert, setShowFailedAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSwapSuccess, setIsSwapSuccess] = useState(false);

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


  useEffect(() => {
    if (isSuccess && txHash) {
      setIsSwapping(false);
      setIsSwapSuccess(true);
      setSuccessTxHash(txHash);
      setTxHash(undefined);
      setShowSuccessAlert(true);
      // Don't call onSuccess() automatically - let user close dialog manually
    }
  }, [isSuccess, txHash]);

  // Handle write error
  useEffect(() => {
    if (writeError) {
      // Check if it's a user rejection
      const isUserRejection = writeError.message?.includes('User rejected') || 
                             writeError.message?.includes('User denied') ||
                             writeError.message?.includes('cancelled') ||
                             writeError.message?.includes('rejected');
      
      if (isUserRejection) {
        // Don't show error for user rejection, just reset state
        setErrorMessage("");
        setShowFailedAlert(false);
        setIsSwapping(false);
        setTxHash(undefined);
      } else {
        setErrorMessage(`Swap failed: ${writeError.message || "Please check your wallet and try again."}`);
        setShowFailedAlert(true);
        setIsSwapping(false);
        setTxHash(undefined);
      }
    }
  }, [writeError]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setErrorMessage(`Transaction failed: ${confirmError.message || "Please try again."}`);
      setShowFailedAlert(true);
      setIsSwapping(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);


  const resetAfterSuccess = () => {
    setIsSwapSuccess(false);
    setSuccessTxHash(undefined);
    setShowSuccessAlert(false);
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
    onSuccess();
  };

  const handleCloseFailedAlert = () => {
    setShowFailedAlert(false);
    setErrorMessage("");
  };


  const handleSwapCollateral = async (
    positionAddress: HexAddress,
    tokenInAddress: HexAddress,
    tokenOutAddress: HexAddress,
    amount: string,
    decimals: number
  ) => {
    if (!address) {
      setErrorMessage("Please connect your wallet");
      setShowFailedAlert(true);
      return;
    }

    const chain = chains.find((c) => c.id === chainId);
    if (!chain) {
      setErrorMessage("Unsupported chain");
      setShowFailedAlert(true);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount");
      setShowFailedAlert(true);
      return;
    }


    try {
      setIsSwapping(true);
      setTxHash(undefined);
      setErrorMessage("");
      setShowFailedAlert(false);

      // Convert amount to BigInt with proper decimal conversion
      const amountBigInt = parseAmountToBigInt(amount, decimals);

      const tx = await writeContractAsync({
        address: positionAddress,
        abi: positionAbi,
        functionName: "swapTokenByPosition",
        args: [
          tokenInAddress,
          tokenOutAddress,
          amountBigInt,
          BigInt(10000),
        ],
      });

      setTxHash(tx as HexAddress);
    } catch (error) {
      
      // Check if it's a user rejection
      const errorMessage = error instanceof Error ? error.message : "Please check your wallet and try again.";
      const isUserRejection = errorMessage.includes('User rejected') || 
                             errorMessage.includes('User denied') ||
                             errorMessage.includes('cancelled') ||
                             errorMessage.includes('rejected');
      
      if (isUserRejection) {
        // Silent handling for user rejection
        setIsSwapping(false);
        setTxHash(undefined);
      } else {
        setErrorMessage(`Swap failed: ${errorMessage}`);
        setShowFailedAlert(true);
        setIsSwapping(false);
        setTxHash(undefined);
      }
    }
  };

  return {
    // Swap functions
    handleSwapCollateral,
    isSwapping: isSwapping || isWritePending,
    isConfirming,
    isSuccess: isSwapSuccess,
    isError,
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    resetAfterSuccess,

    // Alert handlers
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
  };
};
