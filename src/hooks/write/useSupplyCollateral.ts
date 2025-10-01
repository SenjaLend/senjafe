"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { chains } from "@/lib/addresses/chainAddress";
import { useApprove } from "./useApprove";
import { parseAmountToBigInt } from "@/utils/format";
import { useCurrentChainId } from "@/lib/chain";

export type HexAddress = `0x${string}`;

export const useSupplyCollateral = (
  chainId: number,
  _onSuccess: () => void
) => {
  const { address } = useAccount();
  const currentChainId = useCurrentChainId();
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isSupplying, setIsSupplying] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailedAlert, setShowFailedAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [needsApproval, setNeedsApproval] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [isSupplySuccess, setIsSupplySuccess] = useState(false);
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

  // Use approve hook
  const {
    handleApprove,
    isApproving: isApprovePending,
    isConfirming: isApproveConfirming,
    isError: isApproveError,
    confirmError: approveConfirmError,
  } = useApprove(currentChainId, (txHash) => {
    setIsApproved(true);
    setNeedsApproval(false);
    setApproveTxHash(txHash);
    setShowApproveSuccessAlert(true);
    setShowApproveSuccess(true);
  });

  useEffect(() => {
    if (isSuccess && txHash) {
      setIsSupplying(false);
      setIsSupplySuccess(true);
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
      const isUserRejection =
        writeError.message?.includes("User rejected") ||
        writeError.message?.includes("User denied") ||
        writeError.message?.includes("cancelled") ||
        writeError.message?.includes("rejected");

      if (isUserRejection) {
        // Don't show error for user rejection, just reset state
        setErrorMessage("");
        setShowFailedAlert(false);
        setIsSupplying(false);
        setTxHash(undefined);
      } else {
        setErrorMessage(
          `Supply failed: ${
            writeError.message || "Please check your wallet and try again."
          }`
        );
        setShowFailedAlert(true);
        setIsSupplying(false);
        setTxHash(undefined);
      }
    }
  }, [writeError]);

  // Handle approval error
  useEffect(() => {
    if (isApproveError && approveConfirmError) {
      const errorMessage = approveConfirmError.message || "";

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
        setShowApproveSuccessAlert(false);
        setApproveTxHash(undefined);
        setShowApproveSuccess(false);
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
  }, [isApproveError, approveConfirmError]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setErrorMessage(
        confirmError.message || "Supply failed to confirm. Please try again."
      );
      setShowFailedAlert(true);
      setIsSupplying(false);
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

  const handleSupplyCollateral = async (
    lendingPoolAddress: HexAddress,
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

    if (!isApproved) {
      setErrorMessage("Please approve token first");
      setShowFailedAlert(true);
      return;
    }

    try {
      setIsSupplying(true);
      setTxHash(undefined);
      setErrorMessage("");
      setShowFailedAlert(false);

      // Convert amount to BigInt with proper decimal conversion
      const amountBigInt = parseAmountToBigInt(amount, decimals);

      const tx = await writeContractAsync({
        address: lendingPoolAddress,
        abi: lendingPoolAbi,
        functionName: "supplyCollateral",
        args: [amountBigInt, address],
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
        setIsSupplying(false);
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
          setErrorMessage(`Supply failed: ${errorMessage}`);
        }
        setShowFailedAlert(true);
        setIsSupplying(false);
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

  const handleCloseApproveSuccessAlert = () => {
    setShowApproveSuccessAlert(false);
    setApproveTxHash(undefined);
  };

  const handleCloseApproveSuccess = () => {
    setShowApproveSuccess(false);
  };

  const resetApproveStates = () => {
    setIsApproved(false);
    setNeedsApproval(true);
    setIsSupplySuccess(false);
    setShowApproveSuccessAlert(false);
    setApproveTxHash(undefined);
    setShowApproveSuccess(false);
  };

  const resetAfterSuccess = () => {
    setIsApproved(false);
    setNeedsApproval(true);
    setIsSupplying(false);
    setShowSuccessAlert(false);
    setSuccessTxHash(undefined);
    // Keep isSupplySuccess true to show success notification
  };

  const resetSuccessStates = () => {
    setIsSupplySuccess(false);
  };

  return {
    handleApproveToken,
    handleSupplyCollateral,
    isSupplying: isSupplying || (isWritePending && !writeError),
    isConfirming,
    isSuccess: isSupplySuccess,
    isError,
    txHash: txHash || successTxHash,
    writeError,
    confirmError,
    // Alert states
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
    // Approval states
    needsApproval,
    isApproved,
    isApproving: isApprovePending,
    isApproveConfirming,
    isApproveSuccess: showApproveSuccess,
    isApproveError,
    approveConfirmError,
    resetApproveStates,
    resetAfterSuccess,
    resetSuccessStates,
    // Approval alert states
    showApproveSuccessAlert,
    approveTxHash,
    handleCloseApproveSuccessAlert,
    handleCloseApproveSuccess,
  };
};
