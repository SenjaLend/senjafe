"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { useAccount } from "wagmi";
import { chains } from "@/lib/addresses/chainAddress";
import { useReadTotalBorrowAssets } from "@/hooks/read/useReadTotalBorrowAssets";
import { useReadTotalBorrowShares } from "@/hooks/read/useReadTotalBorrowShares";
import { parseAmountToBigInt } from "@/utils/format";

export type HexAddress = `0x${string}`;

const calculateUserShares = (
  userAmount: bigint,
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

  // Use BigInt arithmetic to avoid precision loss
  const totalAssetsBigInt = BigInt(totalBorrowAssets);
  const totalSharesBigInt = BigInt(totalBorrowShares);

  // Calculate: userAmount * totalBorrowAssets / totalBorrowShares
  const shares = (userAmount * totalAssetsBigInt) / totalSharesBigInt;
  return shares;
};

export const useRepayByCollateral = (
  chainId: number,
  lendingPoolAddress: HexAddress,
  collateralTokenAddress: HexAddress,
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
  const [isRepaySuccess, setIsRepaySuccess] = useState(false);

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

  // No approval needed for repay by collateral

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

  // No approval error handling needed

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

  // No approval needed for repay by collateral

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

    // No approval needed for repay by collateral

    try {
      setIsRepaying(true);
      setTxHash(undefined);

      // Convert amount to BigInt with proper decimal conversion
      const userAmount = parseAmountToBigInt(amount, decimals);

      // Use data from hooks or fallback to 0 if borrow amount is not found
      const effectiveTotalAssets = totalBorrowAssets?.toString() || "0"; // Return 0 if not found
      const effectiveTotalShares = totalBorrowShares?.toString() || "0"; // Return 0 if not found

      // Calculate user shares based on total assets and shares

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
        args: [
          userShares,
          collateralTokenAddress,
          true,
          address,
          BigInt(10000),
        ],
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

  // No approval functions needed

  const handleCloseFailedAlert = () => {
    setShowFailedAlert(false);
    setErrorMessage("");
  };

  // No approval reset functions needed

  const resetSuccessStates = () => {
    setIsRepaySuccess(false);
  };

  return {
    handleRepayLoan,
    isRepaying: isRepaying || (isWritePending && !writeError),
    isConfirming,
    isSuccess: isRepaySuccess,
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
