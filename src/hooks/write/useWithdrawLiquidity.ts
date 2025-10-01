"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnect,
} from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { chains } from "@/lib/addresses/chainAddress";

export type HexAddress = `0x${string}`;

export const useWithdrawLiquidity = (
  chainId: number,
  decimals: number,
  _onSuccess?: () => void
) => {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();

  const [shares, setShares] = useState("");
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isWithdrawSuccess, setIsWithdrawSuccess] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState<string>("");

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
      setIsWithdrawing(false);
      setIsWithdrawSuccess(true);
      setSuccessTxHash(txHash);
      setTxHash(undefined);
      setShowSuccessAlert(true);
      setError("");
      // Don't call onSuccess automatically - let user close dialog manually
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
        setError("");
        setIsWithdrawing(false);
        setTxHash(undefined);
      } else {
        setError(
          `Withdraw failed: ${
            writeError.message || "Please check your wallet and try again."
          }`
        );
        setIsWithdrawing(false);
        setTxHash(undefined);
      }
    }
  }, [writeError]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setError(
        `Withdraw failed to confirm: ${
          confirmError.message || "Please try again."
        }`
      );
      setIsWithdrawing(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);

  const handleWithdrawLiquidity = async (
    lendingPoolAddress: HexAddress,
    amount?: string
  ) => {
    // Try to connect wallet if not connected
    if (!address) {
      try {
        await connect({ connector: connectors[0] });
        // Wait a bit for connection to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch {
        setError("Failed to connect wallet. Please try again.");
        // Handle connection error silently
        return;
      }
    }

    const chain = chains.find((c) => c.id === chainId);
    if (!chain) {
      setError(
        `Unsupported chain: ${chainId}. Available chains: ${chains
          .map((c) => c.id)
          .join(", ")}`
      );
      return;
    }

    const amountToUse = amount || shares;
    if (!amountToUse || parseFloat(amountToUse) <= 0) {
      setError("Please enter a valid amount of shares");
      return;
    }

    try {
      setIsWithdrawing(true);
      setTxHash(undefined);
      setError("");

      // Convert shares to BigInt with proper decimal conversion
      const parsedShares = parseFloat(amountToUse);
      if (isNaN(parsedShares) || parsedShares <= 0) {
        throw new Error("Invalid shares amount");
      }

      const decimalMultiplier = Math.pow(10, decimals);
      const sharesBigInt = BigInt(Math.floor(parsedShares * decimalMultiplier));

      if (sharesBigInt <= BigInt(0)) {
        throw new Error("Shares amount too small");
      }

      // Validate contract address
      if (
        !lendingPoolAddress ||
        lendingPoolAddress === "0x0000000000000000000000000000000000000000"
      ) {
        throw new Error("Invalid contract address");
      }

      // Check if contract address is valid for current chain
      const currentChain = chains.find((c) => c.id === chainId);
      if (!currentChain) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      // Use chain's lending pool address if available, otherwise use pool address from API
      let finalContractAddress = lendingPoolAddress;

      // First priority: Use chain's lending pool address if available
      if (
        currentChain.contracts.lendingPool &&
        currentChain.contracts.lendingPool.length > 0
      ) {
        finalContractAddress = currentChain.contracts.lendingPool as HexAddress;
      } else if (
        lendingPoolAddress &&
        lendingPoolAddress.length > 0 &&
        lendingPoolAddress !== "0x0000000000000000000000000000000000000000"
      ) {
        // Second priority: Use pool address from API
        finalContractAddress = lendingPoolAddress;
      } else {
        throw new Error(
          `No valid lending pool address found for chain ${currentChain.name}`
        );
      }

      const tx = await writeContractAsync({
        address: finalContractAddress,
        abi: lendingPoolAbi,
        functionName: "withdrawLiquidity",
        args: [sharesBigInt],
        chainId: chainId,
        value: BigInt(0), // Explicitly set value to 0 for payable functions
      });

      setTxHash(tx as HexAddress);
    } catch (error) {
      // Check if it's a user rejection
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Please check your wallet and try again.";
      const isUserRejection =
        errorMessage.includes("User rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("cancelled") ||
        errorMessage.includes("rejected") ||
        errorMessage.includes("User rejected the request");

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

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
    setSuccessTxHash(undefined);
  };

  return {
    shares,
    setShares,
    handleWithdrawLiquidity,
    isWithdrawing: isWithdrawing || (isWritePending && !writeError),
    isConfirming,
    isSuccess: isWithdrawSuccess,
    isError,
    txHash: successTxHash,
    writeError,
    confirmError,
    error,
    clearError: () => setError(""),
    // Alert states
    showSuccessAlert,
    successTxHash,
    handleCloseSuccessAlert,
  };
};
