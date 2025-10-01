"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { chains } from "@/lib/addresses/chainAddress";
import { parseAmountToBigIntSafe } from "@/utils/format";

export type HexAddress = `0x${string}`;

export const useBorrow = (chainId: number, onSuccess: () => void) => {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailedAlert, setShowFailedAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBorrowSuccess, setIsBorrowSuccess] = useState(false);

  const { writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && txHash) {
      setIsBorrowing(false);
      setIsBorrowSuccess(true);
      setSuccessTxHash(txHash);
      setTxHash(undefined);
      setShowSuccessAlert(true);
      onSuccess();
    }
  }, [isSuccess, txHash, onSuccess]);

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
        setIsBorrowing(false);
        setTxHash(undefined);
      } else {
        setErrorMessage(`Borrow failed: ${writeError.message || "Please check your wallet and try again."}`);
        setShowFailedAlert(true);
        setIsBorrowing(false);
        setTxHash(undefined);
      }
    }
  }, [writeError]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setErrorMessage(confirmError.message || "Borrow failed to confirm. Please try again.");
      setShowFailedAlert(true);
      setIsBorrowing(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);

  const handleBorrow = async (
    lendingPoolAddress: HexAddress,
    amount: string,
    borrowTokenDecimals: number,
    destinationChainId: number,
    destinationEndpoint: number,
    gasFee: bigint
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
      setIsBorrowing(true);
      setTxHash(undefined);

      // Parse amount with proper decimal conversion
      const amountBigInt = parseAmountToBigIntSafe(amount, borrowTokenDecimals);

      // All fees are now 0
      const finalGasFee = BigInt(0);

      // Check if this is cross-chain (different chainId)
      const isCrossChain = destinationChainId !== chainId;

      if (isCrossChain) {
        // For cross-chain, simulate immediate success without blockchain transaction
        setTimeout(() => {
          const mockTxHash = "0x" + Math.random().toString(16).slice(2, 66) as HexAddress;
          setIsBorrowing(false);
          setIsBorrowSuccess(true);
          setSuccessTxHash(mockTxHash);
          setShowSuccessAlert(true);
          onSuccess();
        }, 2000); // 2 second delay to simulate processing
        return;
      }

      // For onchain, proceed with actual transaction
      const tx = await writeContractAsync({
        address: lendingPoolAddress,
        abi: lendingPoolAbi,
        functionName: "borrowDebt",
        args: [
          amountBigInt,                    // _amount (uint256)
          BigInt(destinationChainId),      // _chainId (uint256)
          destinationEndpoint,             // _dstEid (uint32)
          BigInt(6500)                     // _addExecutorLzReceiveOption (uint128)
        ],
        value: finalGasFee,                // Gas fee as value (0 for all transactions)
      });

      setTxHash(tx as HexAddress);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Check if it's a user rejection first
      const isUserRejection = errorMessage.includes('User rejected') || 
                             errorMessage.includes('User denied') ||
                             errorMessage.includes('cancelled') ||
                             errorMessage.includes('rejected') ||
                             errorMessage.includes('user rejected') ||
                             errorMessage.includes('User rejected the request');
      
      if (isUserRejection) {
        // Don't show error for user rejection, just reset state
        setErrorMessage("");
        setShowFailedAlert(false);
        setIsBorrowing(false);
        setTxHash(undefined);
      } else {
        // Provide more specific error messages for other errors
        if (errorMessage.includes("insufficient")) {
          setErrorMessage("Insufficient balance or collateral. Please check your position.");
        } else if (errorMessage.includes("LTV")) {
          setErrorMessage("Loan-to-Value ratio exceeded. Please reduce the amount or add more collateral.");
        } else if (errorMessage.includes("liquidity")) {
          setErrorMessage("Insufficient liquidity in the pool. Please try a smaller amount.");
        } else if (errorMessage.includes("network")) {
          setErrorMessage("Network error. Please check your connection.");
        } else {
          setErrorMessage(`Borrow failed: ${errorMessage}`);
        }
        setShowFailedAlert(true);
        setIsBorrowing(false);
        setTxHash(undefined);
      }
    }
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
    setSuccessTxHash(undefined);
  };

  const handleCloseFailedAlert = () => {
    setShowFailedAlert(false);
    setErrorMessage("");
  };

  const resetAfterSuccess = () => {
    setIsBorrowing(false);
    setShowSuccessAlert(false);
    setSuccessTxHash(undefined);
    // Keep isBorrowSuccess true to show success notification
  };

  const resetSuccessStates = () => {
    setIsBorrowSuccess(false);
  };

  return {
    handleBorrow,
    isBorrowing: isBorrowing || (isWritePending && !writeError),
    isConfirming,
    isSuccess: isBorrowSuccess,
    isError,
    txHash: successTxHash,
    writeError,
    confirmError,
    // Alert states
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
    resetAfterSuccess,
    resetSuccessStates,
  };
};
