"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { useAccount } from "wagmi";
import { useApprove } from "./useApprove";
import { chains } from "@/lib/addresses/chainAddress";
import { useReadTotalBorrowAssets } from "@/hooks/read/useReadTotalBorrowAssets";
import { useReadTotalBorrowShares } from "@/hooks/read/useReadTotalBorrowShares";

export type HexAddress = `0x${string}`;

const calculateUserShares = (
  userAmount: number,
  totalBorrowAssets: string,
  totalBorrowShares: string
): bigint => {
  if (
    !totalBorrowAssets ||
    !totalBorrowShares ||
    Number(totalBorrowAssets) === 0 ||
    Number(totalBorrowShares) === 0
  ) {
    return BigInt(0);
  }

  const shares =
    (userAmount * Number(totalBorrowAssets)) / Number(totalBorrowShares);
  return BigInt(Math.round(shares));
};

export const useRepay = (
  chainId: number,
  lendingPoolAddress: HexAddress,
  borrowTokenAddress: HexAddress,
  onSuccess: () => void,
  refetchUserBorrowShares?: () => void
) => {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isRepaying, setIsRepaying] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailedAlert, setShowFailedAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [needsApproval, setNeedsApproval] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [isRepaySuccess, setIsRepaySuccess] = useState(false);
  const [showApproveSuccessAlert, setShowApproveSuccessAlert] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<HexAddress | undefined>();
  const [showApproveSuccess, setShowApproveSuccess] = useState(false);

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

  // Read total borrow assets and shares for shares calculation
  const {
    totalBorrowAssets,
    totalBorrowAssetsLoading,
    refetchTotalBorrowAssets,
  } = useReadTotalBorrowAssets(lendingPoolAddress);

  const {
    totalBorrowShares,
    totalBorrowSharesLoading,
    refetchTotalBorrowShares,
  } = useReadTotalBorrowShares(lendingPoolAddress);

  // Use approve hook
  const {
    handleApprove,
    isApproving: isApprovePending,
    isConfirming: isApproveConfirming,
    isError: isApproveError,
  } = useApprove(chainId, (txHash) => {
    setIsApproved(true);
    setNeedsApproval(false);
    setApproveTxHash(txHash);
    setShowApproveSuccessAlert(true);
    setShowApproveSuccess(true);
  });

  useEffect(() => {
    if (isSuccess && txHash) {
      setIsRepaying(false);
      setIsRepaySuccess(true);
      setSuccessTxHash(txHash);
      setTxHash(undefined);
      setShowSuccessAlert(true);
      onSuccess();

      // Refetch user borrow shares after successful repay
      if (refetchUserBorrowShares) {
        refetchUserBorrowShares();
      }
    }
  }, [isSuccess, txHash, onSuccess, refetchUserBorrowShares]);

  // Handle write error
  useEffect(() => {
    if (writeError) {
      // Check if it's a user rejection
      const isUserRejection =
        writeError.message?.includes("User rejected") ||
        writeError.message?.includes("User denied") ||
        writeError.message?.includes("cancelled") ||
        writeError.message?.includes("rejected");

      if (isUserRejection) {
        // Don't show error for user rejection, just reset state
        setErrorMessage("");
        setShowFailedAlert(false);
        setIsRepaying(false);
        setTxHash(undefined);
      } else {
        setErrorMessage(
          `Repay failed: ${
            writeError.message || "Please check your wallet and try again."
          }`
        );
        setShowFailedAlert(true);
        setIsRepaying(false);
        setTxHash(undefined);
      }
    }
  }, [writeError]);

  // Handle approval error
  useEffect(() => {
    if (isApproveError) {
      const errorMessage = "Approval failed";

      // Check if it's a user rejection with more comprehensive patterns
      const isUserRejection =
        errorMessage.includes("User rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("cancelled") ||
        errorMessage.includes("rejected") ||
        errorMessage.includes("user rejected") ||
        errorMessage.includes("User rejected the request") ||
        errorMessage.includes("User rejected the transaction") ||
        errorMessage.includes("User denied transaction") ||
        errorMessage.includes("Transaction was rejected") ||
        errorMessage.includes("User cancelled") ||
        errorMessage.includes("User canceled");

      if (isUserRejection) {
        // Automatically revert state for user rejection
        setIsApproved(false);
        setNeedsApproval(true);
        setErrorMessage("");
        setShowFailedAlert(false);
      } else {
        // Show error for non-user-rejection errors
        setErrorMessage(`Approval failed: ${errorMessage}`);
        setShowFailedAlert(true);
        setIsApproved(false);
        setNeedsApproval(true);
      }
    }
  }, [isApproveError]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setErrorMessage(
        confirmError.message || "Repay failed to confirm. Please try again."
      );
      setShowFailedAlert(true);
      setIsRepaying(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);

  const handleApproveToken = async (
    tokenAddress: HexAddress,
    spenderAddress: HexAddress,
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

    // Add 10% buffer to the amount for approval
    const amountWithBuffer = parseFloat(amount) * 1.1;
    const amountString = amountWithBuffer.toString();

    await handleApprove(tokenAddress, spenderAddress, amountString, decimals);
  };

  const handleRepayLoan = async (amount: string, decimals: number) => {
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

    if (!isApproved) {
      setErrorMessage("Please approve token first");
      setShowFailedAlert(true);
      return;
    }

    try {
      setIsRepaying(true);
      setTxHash(undefined);

      // Convert amount to BigInt with proper decimal conversion
      const userAmount = Number(amount) * Math.pow(10, decimals);

      // Use data from hooks or fallback to 0 if borrow amount is not found
      const effectiveTotalAssets = totalBorrowAssets?.toString() || "0";
      const effectiveTotalShares = totalBorrowShares?.toString() || "0";

      const userShares = calculateUserShares(
        userAmount,
        effectiveTotalAssets,
        effectiveTotalShares
      );

      if (userShares === BigInt(0)) {
        setErrorMessage("Calculated shares amount is zero");
        setShowFailedAlert(true);
        setIsRepaying(false);
        return;
      }

      const tx = await writeContractAsync({
        address: lendingPoolAddress,
        abi: lendingPoolAbi,
        functionName: "repayWithSelectedToken",
        args: [userShares, borrowTokenAddress, false, address, BigInt(10000)],
      });

      setTxHash(tx as HexAddress);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Check if it's a user rejection first
      const isUserRejection =
        errorMessage.includes("User rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("cancelled") ||
        errorMessage.includes("rejected") ||
        errorMessage.includes("user rejected") ||
        errorMessage.includes("User rejected the request");

      if (isUserRejection) {
        // Don't show error for user rejection, just reset state
        setErrorMessage("");
        setShowFailedAlert(false);
        setIsRepaying(false);
        setTxHash(undefined);
      } else {
        // Provide more specific error messages for other errors
        if (errorMessage.includes("insufficient")) {
          setErrorMessage(
            "Insufficient balance. Please check your token balance."
          );
        } else if (errorMessage.includes("allowance")) {
          setErrorMessage(
            "Insufficient allowance. Please approve more tokens."
          );
        } else if (errorMessage.includes("network")) {
          setErrorMessage("Network error. Please check your connection.");
        } else {
          setErrorMessage(`Repay failed: ${errorMessage}`);
        }
        setShowFailedAlert(true);
        setIsRepaying(false);
        setTxHash(undefined);
      }
    }
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
    setSuccessTxHash(undefined);
  };

  const handleCloseApproveSuccessAlert = () => {
    setShowApproveSuccessAlert(false);
    setApproveTxHash(undefined);
  };

  const handleCloseApproveSuccess = () => {
    setShowApproveSuccess(false);
  };

  const handleCloseFailedAlert = () => {
    setShowFailedAlert(false);
    setErrorMessage("");
  };

  const resetApproveStates = () => {
    setIsApproved(false);
    setNeedsApproval(true);
    setIsRepaySuccess(false);
    setShowApproveSuccessAlert(false);
    setApproveTxHash(undefined);
    setShowApproveSuccess(false);
  };

  const resetAfterSuccess = () => {
    setIsApproved(false);
    setNeedsApproval(true);
    setIsRepaying(false);
    setShowSuccessAlert(false);
    setSuccessTxHash(undefined);
    // Keep isRepaySuccess true to show success notification
  };

  const resetSuccessStates = () => {
    setIsRepaySuccess(false);
  };

  return {
    handleApproveToken,
    handleRepayLoan,
    isRepaying: isRepaying || (isWritePending && !writeError),
    isConfirming,
    isSuccess: isRepaySuccess,
    isError,
    txHash: successTxHash, // Only return repay tx hash, not approve tx hash
    writeError,
    confirmError,
    // Alert states
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
    // Approval alert states
    showApproveSuccessAlert,
    approveTxHash,
    handleCloseApproveSuccessAlert,
    // Approval states
    needsApproval,
    isApproved,
    isApproving: isApprovePending,
    isApproveConfirming,
    isApproveSuccess: showApproveSuccess,
    isApproveError,
    handleCloseApproveSuccess,
    resetApproveStates,
    resetAfterSuccess,
    resetSuccessStates,
    // Data states
    totalBorrowAssets,
    totalBorrowShares,
    totalBorrowAssetsLoading,
    totalBorrowSharesLoading,
    // Refetch functions
    refetchTotalBorrowAssets,
    refetchTotalBorrowShares,
  };
};
