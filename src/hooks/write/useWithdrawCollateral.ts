"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { chains } from "@/lib/addresses/chainAddress";
import { Chain } from "@/types";

export type HexAddress = `0x${string}`;

export const useWithdrawCollateral = (chainId: number, decimals: number, onSuccess: () => void) => {
  const { address } = useAccount();

  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState<string>("");

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
      setIsWithdrawing(false);
      setSuccessTxHash(txHash);
      setShowSuccessAlert(true);
      setTxHash(undefined);
      // Don't call onSuccess automatically - let user close dialog manually
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
        setError("");
        setIsWithdrawing(false);
        setTxHash(undefined);
      } else {
        setError(`Withdraw failed: ${writeError.message || "Please check your wallet and try again."}`);
        setIsWithdrawing(false);
        setTxHash(undefined);
      }
    }
  }, [writeError]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setError(`Withdraw failed to confirm: ${confirmError.message || "Please try again."}`);
      setIsWithdrawing(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
    onSuccess(); // Call onSuccess when user closes the alert
  };

  const handleWithdrawCollateral = async (lendingPoolAddress: HexAddress, amountParam?: string) => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    const chain = chains.find((c: Chain) => c.id === chainId);
    if (!chain) {
      setError(`Unsupported chain: ${chainId}. Available chains: ${chains.map(c => c.id).join(', ')}`);
      return;
    }

    const amountToUse = amountParam || amount;
    if (!amountToUse || parseFloat(amountToUse) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setIsWithdrawing(true);
      setTxHash(undefined);
      setError("");

      // Convert amount to BigInt with proper decimal conversion
      const parsedAmount = parseFloat(amountToUse);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Invalid amount");
      }
      
      const decimalMultiplier = Math.pow(10, decimals);
      const amountBigInt = BigInt(Math.floor(parsedAmount * decimalMultiplier));
      
      if (amountBigInt <= BigInt(0)) {
        throw new Error("Amount too small");
      }


      // Validate contract address
      if (!lendingPoolAddress || lendingPoolAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("Invalid contract address");
      }

      const tx = await writeContractAsync({
        address: lendingPoolAddress,
        abi: lendingPoolAbi,
        functionName: "withdrawCollateral",
        args: [amountBigInt],
        chainId: chainId,
      });

      setTxHash(tx as HexAddress);
    } catch (error) {
      
      // Check if it's a user rejection
      const errorMessage = error instanceof Error ? error.message : "Please check your wallet and try again.";
      const isUserRejection = errorMessage.includes('User rejected') || 
                             errorMessage.includes('User denied') ||
                             errorMessage.includes('cancelled') ||
                             errorMessage.includes('rejected') ||
                             errorMessage.includes('User rejected the request');
      
      if (isUserRejection) {
        // Don't show error for user rejection, just reset state
        setError("");
        setIsWithdrawing(false);
        setTxHash(undefined);
      } else {
        setError(`Withdraw failed: ${errorMessage}`);
        setIsWithdrawing(false);
        setTxHash(undefined);
      }
    }
  };

  return {
    amount,
    setAmount,
    handleWithdrawCollateral,
    isWithdrawing: isWithdrawing || (isWritePending && !writeError),
    isConfirming,
    isSuccess,
    isError,
    txHash: successTxHash,
    writeError,
    confirmError,
    error,
    clearError: () => setError(""),
    showSuccessAlert,
    successTxHash,
    handleCloseSuccessAlert,
  };
};