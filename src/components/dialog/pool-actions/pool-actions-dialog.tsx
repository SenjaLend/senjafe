"use client";

import React, { useState, memo, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { useCurrentChainId } from "@/lib/chain";
import { useReadApy } from "@/hooks/read/useReadApy";
import { useSupplyLiquidity } from "@/hooks/write/useSupplyLiquidity";
import { useSupplyCollateral } from "@/hooks/write/useSupplyCollateral";
import { useWithdrawLiquidity } from "@/hooks/write/useWithdrawLiquidity";
import { useWithdrawCollateral } from "@/hooks/write/useWithdrawCollateral";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { useUserWalletBalance } from "@/hooks/read/useReadUserBalance";
import { BearyWalletConnectionGuard } from "@/components/wallet/beary-wallet-connection-guard";
import { useAccount } from "wagmi";
import {
  dialogStyles,
  buttonStyles,
  textStyles,
} from "@/styles/common";
import Image from "next/image";

// Utility function to format LTV percentage
const formatLTV = (ltv: bigint | number | string): string => {
  const ltvNumber = typeof ltv === "bigint" ? Number(ltv) : Number(ltv);
  const percentage = ltvNumber / 1e16;
  return percentage.toFixed(1);
};

/**
 * Pool action types
 */
export type PoolActionType =
  | "supply-collateral"
  | "supply-liquidity"
  | "borrow"
  | "repay"
  | "repay-by-collateral"
  | "withdraw-collateral"
  | "withdraw-liquidity";

/**
 * Props for the PoolActionsDialog component
 */
interface PoolActionsDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** The selected pool */
  pool: LendingPoolWithTokens | null;
  /** Callback when action is selected */
  onActionSelect?: (action: PoolActionType) => void;
  /** Custom className */
  className?: string;
}

/**
 * Action configuration for pool actions
 */
const actionConfig = [
  {
    id: "supply-collateral" as PoolActionType,
    label: "Supply Collateral",
    description: "Supply collateral to earn interest",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "supply-liquidity" as PoolActionType,
    label: "Supply Liquidity",
    description: "Supply liquidity to the pool",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "borrow" as PoolActionType,
    label: "Borrow",
    description: "Borrow against your collateral",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "repay" as PoolActionType,
    label: "Repay",
    description: "Repay borrowed amount",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  {
    id: "repay-by-collateral" as PoolActionType,
    label: "Repay by Collateral",
    description: "Repay using collateral",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
  {
    id: "withdraw-collateral" as PoolActionType,
    label: "Withdraw Collateral",
    description: "Withdraw your collateral",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    id: "withdraw-liquidity" as PoolActionType,
    label: "Withdraw Liquidity",
    description: "Withdraw your liquidity",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

/**
 * PoolActionsDialog component for managing pool actions
 *
 * @param props - Component props
 * @returns JSX element
 */
export const PoolActionsDialog = memo(function PoolActionsDialog({
  isOpen,
  onClose,
  pool,
  onActionSelect,
  className,
}: PoolActionsDialogProps) {
  const [selectedAction, setSelectedAction] =
    useState<PoolActionType>("supply-collateral");
  const [amount, setAmount] = useState("");
  const currentChainId = useCurrentChainId();
  const { isConnected } = useAccount();

  // Get APY for the pool
  const { apyFormatted } = useReadApy(pool?.lendingPool as `0x${string}`);

  // Get user balance for the token being supplied/used
  const getTokenAddress = () => {
    if (selectedAction === "supply-collateral" || selectedAction === "withdraw-collateral" || selectedAction === "repay-by-collateral") {
      return pool?.collateralTokenInfo?.addresses[currentChainId] as `0x${string}`;
    }
    return pool?.borrowTokenInfo?.addresses[currentChainId] as `0x${string}`;
  };

  const getTokenDecimals = () => {
    if (selectedAction === "supply-collateral" || selectedAction === "withdraw-collateral" || selectedAction === "repay-by-collateral") {
      return pool?.collateralTokenInfo?.decimals || 18;
    }
    return pool?.borrowTokenInfo?.decimals || 18;
  };

  const tokenAddress = getTokenAddress();
  const tokenDecimals = getTokenDecimals();

  const {
    userWalletBalanceFormatted,
    userWalletBalanceParsed,
    walletBalanceLoading,
  } = useUserWalletBalance(
    tokenAddress || "0xCEb5c8903060197e46Ab5ea5087b9F99CBc8da49",
    tokenDecimals
  );


  // Supply Liquidity Hook
  const {
    handleApproveToken: handleApproveTokenLiquidity,
    handleSupplyLiquidity,
    isSupplying: isSupplyingLiquidity,
    isConfirming: isConfirmingLiquidity,
    isSuccess: isSuccessLiquidity,
    isError: isErrorLiquidity,
    showSuccessAlert: showSuccessAlertLiquidity,
    showFailedAlert: showFailedAlertLiquidity,
    errorMessage: errorMessageLiquidity,
    successTxHash: successTxHashLiquidity,
    handleCloseSuccessAlert: handleCloseSuccessAlertLiquidity,
    handleCloseFailedAlert: handleCloseFailedAlertLiquidity,
    isApproved: isApprovedLiquidity,
    isApproving: isApprovingLiquidity,
    isApproveConfirming: isApproveConfirmingLiquidity,
    isApproveSuccess: isApproveSuccessLiquidity,
    resetApproveStates: resetApproveStatesLiquidity,
    resetAfterSuccess: resetAfterSuccessLiquidity,
    resetSuccessStates: resetSuccessStatesLiquidity,
  } = useSupplyLiquidity(currentChainId, () => {
    resetForm();
  });

  // Supply Collateral Hook
  const {
    handleApproveToken: handleApproveTokenCollateral,
    handleSupplyCollateral,
    isSupplying: isSupplyingCollateral,
    isConfirming: isConfirmingCollateral,
    isSuccess: isSuccessCollateral,
    isError: isErrorCollateral,
    showSuccessAlert: showSuccessAlertCollateral,
    showFailedAlert: showFailedAlertCollateral,
    errorMessage: errorMessageCollateral,
    successTxHash: successTxHashCollateral,
    handleCloseSuccessAlert: handleCloseSuccessAlertCollateral,
    handleCloseFailedAlert: handleCloseFailedAlertCollateral,
    isApproved: isApprovedCollateral,
    isApproving: isApprovingCollateral,
    isApproveConfirming: isApproveConfirmingCollateral,
    isApproveSuccess: isApproveSuccessCollateral,
    resetApproveStates: resetApproveStatesCollateral,
    resetAfterSuccess: resetAfterSuccessCollateral,
    resetSuccessStates: resetSuccessStatesCollateral,
  } = useSupplyCollateral(currentChainId, () => {
    resetForm();
  });

  // Withdraw Liquidity Hook
  const {
    shares: withdrawShares,
    setShares: setWithdrawShares,
    handleWithdrawLiquidity,
    isWithdrawing: isWithdrawingLiquidity,
    isConfirming: isConfirmingWithdrawLiquidity,
    isSuccess: isSuccessWithdrawLiquidity,
    error: errorWithdrawLiquidity,
    clearError: clearErrorWithdrawLiquidity,
    showSuccessAlert: showSuccessAlertWithdrawLiquidity,
    successTxHash: successTxHashWithdrawLiquidity,
    handleCloseSuccessAlert: handleCloseSuccessAlertWithdrawLiquidity,
  } = useWithdrawLiquidity(currentChainId, tokenDecimals, () => {
    resetForm();
  });

  // Withdraw Collateral Hook
  const {
    setAmount: setWithdrawAmount,
    handleWithdrawCollateral,
    isWithdrawing: isWithdrawingCollateral,
    isConfirming: isConfirmingWithdrawCollateral,
    isSuccess: isSuccessWithdrawCollateral,
    confirmError: errorWithdrawCollateral,
    showSuccessAlert: showSuccessAlertWithdrawCollateral,
    successTxHash: successTxHashWithdrawCollateral,
    handleCloseSuccessAlert: handleCloseSuccessAlertWithdrawCollateral,
  } = useWithdrawCollateral(currentChainId, tokenDecimals, () => {
    resetForm();
  });


  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setAmount("");
    resetApproveStatesLiquidity();
    resetSuccessStatesLiquidity();
    resetApproveStatesCollateral();
    resetSuccessStatesCollateral();
    setWithdrawShares("");
    clearErrorWithdrawLiquidity();
    // Reset success alerts
    if (showSuccessAlertLiquidity) handleCloseSuccessAlertLiquidity();
    if (showSuccessAlertCollateral) handleCloseSuccessAlertCollateral();
    if (showSuccessAlertWithdrawLiquidity) handleCloseSuccessAlertWithdrawLiquidity();
    if (showSuccessAlertWithdrawCollateral) handleCloseSuccessAlertWithdrawCollateral();
    // Reset failed alerts
    if (showFailedAlertLiquidity) handleCloseFailedAlertLiquidity();
    if (showFailedAlertCollateral) handleCloseFailedAlertCollateral();
  }, [resetApproveStatesLiquidity, resetSuccessStatesLiquidity, resetApproveStatesCollateral, resetSuccessStatesCollateral, setWithdrawShares, clearErrorWithdrawLiquidity, showSuccessAlertLiquidity, handleCloseSuccessAlertLiquidity, showSuccessAlertCollateral, handleCloseSuccessAlertCollateral, showSuccessAlertWithdrawLiquidity, handleCloseSuccessAlertWithdrawLiquidity, showSuccessAlertWithdrawCollateral, handleCloseSuccessAlertWithdrawCollateral, showFailedAlertLiquidity, handleCloseFailedAlertLiquidity, showFailedAlertCollateral, handleCloseFailedAlertCollateral]);

  const handleCloseSuccessAlertAndReset = useCallback(() => {
    if (selectedAction === "supply-liquidity") {
      handleCloseSuccessAlertLiquidity();
      resetAfterSuccessLiquidity();
    } else if (selectedAction === "supply-collateral") {
      handleCloseSuccessAlertCollateral();
      resetAfterSuccessCollateral();
    } else if (selectedAction === "withdraw-liquidity") {
      handleCloseSuccessAlertWithdrawLiquidity();
    } else if (selectedAction === "withdraw-collateral") {
      handleCloseSuccessAlertWithdrawCollateral();
    }
    setAmount("");
  }, [selectedAction, handleCloseSuccessAlertLiquidity, resetAfterSuccessLiquidity, handleCloseSuccessAlertCollateral, resetAfterSuccessCollateral, handleCloseSuccessAlertWithdrawLiquidity, handleCloseSuccessAlertWithdrawCollateral]);

  /**
   * Handle action selection
   */
  const handleActionSelect = useCallback(
    (action: PoolActionType) => {
      setSelectedAction(action);
      // Reset form when action changes
      resetForm();
      // Don't call onActionSelect for integrated actions
      if (action === "borrow" || action === "repay" || action === "repay-by-collateral") {
        onActionSelect?.(action);
      }
    },
    [onActionSelect, resetForm]
  );

  /**
   * Handle setting maximum balance
   */
  const handleSetMax = useCallback(() => {
    if (userWalletBalanceParsed > 0) {
      setAmount(userWalletBalanceFormatted);
    }
  }, [userWalletBalanceFormatted, userWalletBalanceParsed]);

  /**
   * Handle approve token
   */
  const handleApprove = useCallback(async () => {
    if (!pool || !amount || parseFloat(amount) <= 0) {
      return;
    }

    if (selectedAction === "supply-liquidity") {
      resetSuccessStatesLiquidity();
      const decimals = pool.borrowTokenInfo?.decimals || 18;
      await handleApproveTokenLiquidity(
        pool.borrowTokenInfo?.addresses[currentChainId] as `0x${string}`, 
        pool.lendingPool as `0x${string}`, 
        amount,
        decimals
      );
    } else if (selectedAction === "supply-collateral") {
      resetSuccessStatesCollateral();
      const decimals = pool.collateralTokenInfo?.decimals || 18;
      await handleApproveTokenCollateral(
        pool.collateralTokenInfo?.addresses[currentChainId] as `0x${string}`, 
        pool.lendingPool as `0x${string}`, 
        amount,
        decimals
      );
    }
  }, [amount, pool, selectedAction, handleApproveTokenLiquidity, handleApproveTokenCollateral, currentChainId, resetSuccessStatesLiquidity, resetSuccessStatesCollateral]);

  /**
   * Handle supply (liquidity or collateral)
   */
  const handleSupply = useCallback(async () => {
    if (!pool || !amount || parseFloat(amount) <= 0) {
      return;
    }

    if (selectedAction === "supply-liquidity") {
      const decimals = pool.borrowTokenInfo?.decimals || 18;
      await handleSupplyLiquidity(pool.lendingPool as `0x${string}`, amount, decimals);
    } else if (selectedAction === "supply-collateral") {
      const decimals = pool.collateralTokenInfo?.decimals || 18;
      await handleSupplyCollateral(pool.lendingPool as `0x${string}`, amount, decimals);
    }
  }, [amount, pool, selectedAction, handleSupplyLiquidity, handleSupplyCollateral]);

  /**
   * Handle withdraw actions
   */
  const handleWithdraw = useCallback(async () => {
    if (!pool) {
      return;
    }

    if (selectedAction === "withdraw-liquidity") {
      if (!withdrawShares || parseFloat(withdrawShares) <= 0) {
        return;
      }
      await handleWithdrawLiquidity(pool.lendingPool as `0x${string}`);
    } else if (selectedAction === "withdraw-collateral") {
      if (!amount || parseFloat(amount) <= 0) {
        return;
      }
      setWithdrawAmount(amount);
      await handleWithdrawCollateral(pool.lendingPool as `0x${string}`);
    }
  }, [pool, selectedAction, withdrawShares, amount, handleWithdrawLiquidity, setWithdrawAmount, handleWithdrawCollateral]);


  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    // Don't close dialog if transactions are in progress
    const isAnyTransactionInProgress = 
      isSupplyingLiquidity || isConfirmingLiquidity || isApprovingLiquidity || isApproveConfirmingLiquidity ||
      isSupplyingCollateral || isConfirmingCollateral || isApprovingCollateral || isApproveConfirmingCollateral ||
      isWithdrawingLiquidity || isConfirmingWithdrawLiquidity ||
      isWithdrawingCollateral || isConfirmingWithdrawCollateral;
    
    if (isAnyTransactionInProgress) {
      return;
    }
    onClose();
    setSelectedAction("supply-collateral"); // Reset to default
    resetForm();
  }, [onClose, isSupplyingLiquidity, isConfirmingLiquidity, isApprovingLiquidity, isApproveConfirmingLiquidity, isSupplyingCollateral, isConfirmingCollateral, isApprovingCollateral, isApproveConfirmingCollateral, isWithdrawingLiquidity, isConfirmingWithdrawLiquidity, isWithdrawingCollateral, isConfirmingWithdrawCollateral, resetForm]);

  /**
   * Get current action config
   */
  const currentAction = actionConfig.find(
    (action) => action.id === selectedAction
  );

  if (!pool) return null;

  // If wallet is not connected, show BearyWalletConnectionGuard
  if (!isConnected) {
    return (
      <BearyWalletConnectionGuard
        isActive={isOpen}
        onReady={onClose}
        onCancel={onClose}
        pool={pool}
        targetChainId={1284}
      />
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className={`${dialogStyles.content} max-w-2xl ${className || ""}`}
        >
        <DialogHeader className={dialogStyles.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-sm text-gray-600 mt-1 flex items-center">
                  <Image
                    src={pool.collateralTokenInfo?.logo || ""}
                    alt={pool.collateralTokenInfo?.symbol || ""}
                    width={24}
                    height={24}
                  />
                  <Image
                    src={pool.borrowTokenInfo?.logo || ""}
                    alt={pool.borrowTokenInfo?.symbol || ""}
                    width={24}
                    height={24}
                  />
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  {pool.collateralTokenInfo?.symbol} /{" "}
                  {pool.borrowTokenInfo?.symbol}
                </DialogDescription>
              </div>
            </div>
            <Button
              onClick={handleClose}
              disabled={isSupplyingLiquidity || isConfirmingLiquidity || isApprovingLiquidity || isApproveConfirmingLiquidity || isSupplyingCollateral || isConfirmingCollateral || isApprovingCollateral || isApproveConfirmingCollateral || isWithdrawingLiquidity || isConfirmingWithdrawLiquidity || isWithdrawingCollateral || isConfirmingWithdrawCollateral}
              className="p-2 hover:bg-orange-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4 text-gray-600 hover:text-gray-800" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          {/* Action Selection Dropdown */}
          <div className="mb-6">
            <Select value={selectedAction} onValueChange={handleActionSelect}>
              <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-orange-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none transition-colors bg-white [&[data-state=open]]:border-orange-400 [&[data-state=open]]:ring-0 [&[data-state=open]]:outline-none">
                <SelectValue placeholder="Choose an action">
                  {currentAction && (
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{currentAction.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-lg focus:outline-none focus-visible:ring-0 focus-visible:outline-none [&[data-state=open]]:border-gray-200 [&[data-state=open]]:ring-0 [&[data-state=open]]:outline-none">
                {actionConfig.map((action) => (
                  <SelectItem
                    key={action.id}
                    value={action.id}
                    className="hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:ring-0 focus-visible:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3 py-2">
                      <div>
                        <div className={`font-medium ${action.color}`}>
                          {action.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Content - Render form based on selection */}
          <Card
            className={`p-6 ${currentAction?.bgColor} ${currentAction?.borderColor} border-2`}
          >
            <div className="flex items-center gap-3 mb-4">
              {currentAction && (
                <div>
                  <h3 className={`font-bold text-lg ${currentAction.color}`}>
                    {currentAction.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentAction.description}
                  </p>
                </div>
              )}
            </div>

            {/* Pool Information */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 font-medium">
                    Collateral Token:
                  </div>
                  <div className="font-semibold text-gray-900">
                    {pool.collateralTokenInfo?.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">
                    Borrow Token:
                  </div>
                  <div className="font-semibold text-gray-900">
                    {pool.borrowTokenInfo?.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">APY:</div>
                  <div className="font-semibold text-gray-900">{apyFormatted}%</div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">LTV:</div>
                  <div className="font-semibold text-gray-900">
                    {formatLTV(pool.ltv)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Action-specific form */}
            <div className="space-y-4">
              {/* Show form for integrated actions */}
              {(selectedAction === "supply-collateral" || selectedAction === "supply-liquidity" || selectedAction === "withdraw-liquidity" || selectedAction === "withdraw-collateral") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={`${textStyles.label} flex items-center gap-2`}>
                      <span className={`w-2 h-2 rounded-full ${currentAction?.color.replace("text-", "bg-").replace("-600", "-500")}`}></span>
                      {selectedAction === "withdraw-liquidity" 
                        ? "Shares to Withdraw" 
                        : selectedAction === "withdraw-collateral"
                        ? "Amount to Withdraw"
                        : "Amount to Supply"}
                    </label>
                    {/* Show balance for supply actions */}
                    {(selectedAction === "supply-collateral" || selectedAction === "supply-liquidity") && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Balance:</span>
                        {walletBalanceLoading ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        ) : (
                          <span className="font-medium text-gray-700">
                            {userWalletBalanceFormatted || "0.00"}{" "}
                            {selectedAction === "supply-collateral" 
                              ? pool.collateralTokenInfo?.symbol 
                              : pool.borrowTokenInfo?.symbol}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder={
                        selectedAction === "withdraw-liquidity" 
                          ? "Enter shares amount" 
                          : selectedAction === "withdraw-collateral"
                          ? "Enter amount to withdraw"
                          : "Enter amount to supply"
                      }
                      value={selectedAction === "withdraw-liquidity" ? withdrawShares : amount}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        
                        // Prevent negative numbers and invalid characters
                        const cleanValue = inputValue.replace(/[^0-9.]/g, '');
                        
                        // Prevent multiple decimal points
                        const parts = cleanValue.split('.');
                        const sanitizedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;
                        
                        if (selectedAction === "withdraw-liquidity") {
                          setWithdrawShares(sanitizedValue);
                        } else {
                          setAmount(sanitizedValue);
                        }
                      }}
                      min="0"
                      step="0.000001"
                      className="w-full h-12 px-4 pr-24 sm:pr-28 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:border-orange-400 bg-white text-gray-900 placeholder-gray-500"
                      disabled={isSupplyingLiquidity || isConfirmingLiquidity || isApprovingLiquidity || isSupplyingCollateral || isConfirmingCollateral || isApprovingCollateral || isWithdrawingLiquidity || isConfirmingWithdrawLiquidity || isWithdrawingCollateral || isConfirmingWithdrawCollateral}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {/* Show Max button for supply actions */}
                      {(selectedAction === "supply-collateral" || selectedAction === "supply-liquidity") && (
                        <Button
                          type="button"
                          onClick={handleSetMax}
                          disabled={userWalletBalanceParsed <= 0 || isSupplyingLiquidity || isConfirmingLiquidity || isApprovingLiquidity || isSupplyingCollateral || isConfirmingCollateral || isApprovingCollateral}
                          className="h-6 px-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 border-0"
                          size="sm"
                        >
                          Max
                        </Button>
                      )}
                      <span className="text-sm text-gray-500 font-medium">
                        {selectedAction === "withdraw-liquidity"
                          ? "Shares"
                          : (selectedAction === "supply-collateral" || selectedAction === "withdraw-collateral")
                          ? pool.collateralTokenInfo?.symbol
                          : pool.borrowTokenInfo?.symbol}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Show description for non-integrated actions */}
              {(selectedAction === "borrow" || selectedAction === "repay" || selectedAction === "repay-by-collateral") && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">
                    Select an action above to proceed with your transaction.
                  </p>
                </div>
              )}

              {/* Transaction Status */}
              {((selectedAction === "supply-collateral" && (isApprovingCollateral || isApproveConfirmingCollateral || isApproveSuccessCollateral || isSupplyingCollateral || isConfirmingCollateral || isSuccessCollateral || isErrorCollateral)) ||
                (selectedAction === "supply-liquidity" && (isApprovingLiquidity || isApproveConfirmingLiquidity || isApproveSuccessLiquidity || isSupplyingLiquidity || isConfirmingLiquidity || isSuccessLiquidity || isErrorLiquidity)) ||
                (selectedAction === "withdraw-liquidity" && (isWithdrawingLiquidity || isConfirmingWithdrawLiquidity || isSuccessWithdrawLiquidity || errorWithdrawLiquidity)) ||
                (selectedAction === "withdraw-collateral" && (isWithdrawingCollateral || isConfirmingWithdrawCollateral || isSuccessWithdrawCollateral || errorWithdrawCollateral))) && (
                <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                  <div className="space-y-3">
                    {/* Approve Status */}
                    {(isApprovingCollateral || isApprovingLiquidity) && (
                      <div className="flex items-center gap-3 text-blue-600">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold">Approving token...</span>
                      </div>
                    )}

                    {(isApproveConfirmingCollateral || isApproveConfirmingLiquidity) && (
                      <div className="flex items-center gap-3 text-orange-600">
                        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold">Confirming approval...</span>
                      </div>
                    )}

                    {(isApproveSuccessCollateral || isApproveSuccessLiquidity) && (
                      <div className="flex items-center gap-3 text-green-600">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold">Token approved successfully!</span>
                      </div>
                    )}

                    {/* Supply Status */}
                    {(isSupplyingCollateral || isSupplyingLiquidity) && (
                      <div className="flex items-center gap-3 text-blue-600">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold">
                          {selectedAction === "supply-collateral" ? "Supplying collateral..." : "Supplying liquidity..."}
                        </span>
                      </div>
                    )}

                    {(isConfirmingCollateral || isConfirmingLiquidity) && (
                      <div className="flex items-center gap-3 text-orange-600">
                        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold">Confirming transaction...</span>
                      </div>
                    )}

                    {(isSuccessCollateral || isSuccessLiquidity) && (
                      <div className="flex items-center gap-3 text-green-600">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold">
                          {selectedAction === "supply-collateral" ? "Collateral supplied successfully!" : "Liquidity supplied successfully!"}
                        </span>
                      </div>
                    )}

                    {/* Withdraw Status */}
                    {(isWithdrawingLiquidity || isWithdrawingCollateral) && (
                      <div className="flex items-center gap-3 text-blue-600">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold">
                          {selectedAction === "withdraw-liquidity" ? "Withdrawing liquidity..." : "Withdrawing collateral..."}
                        </span>
                      </div>
                    )}

                    {(isConfirmingWithdrawLiquidity || isConfirmingWithdrawCollateral) && (
                      <div className="flex items-center gap-3 text-orange-600">
                        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold">Confirming transaction...</span>
                      </div>
                    )}

                    {(isSuccessWithdrawLiquidity || isSuccessWithdrawCollateral) && (
                      <div className="flex items-center gap-3 text-green-600">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold">
                          {selectedAction === "withdraw-liquidity" ? "Liquidity withdrawn successfully!" : "Collateral withdrawn successfully!"}
                        </span>
                      </div>
                    )}

                    {/* Error Status */}
                    {(isErrorCollateral || isErrorLiquidity || errorWithdrawLiquidity || errorWithdrawCollateral) && (
                      <div className="flex items-center gap-3 text-red-600">
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-sm font-semibold">Transaction failed</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              {(selectedAction === "supply-collateral" || selectedAction === "supply-liquidity") ? (
                <div className="space-y-3">
                  {/* Approve Button */}
                  {((selectedAction === "supply-collateral" && !isApprovedCollateral) || 
                    (selectedAction === "supply-liquidity" && !isApprovedLiquidity)) && (
                    <Button
                      type="button"
                      onClick={handleApprove}
                      disabled={!amount || parseFloat(amount) <= 0 || 
                        (isApprovingCollateral || isApproveConfirmingCollateral || 
                         isApprovingLiquidity || isApproveConfirmingLiquidity)}
                      className={`w-full h-14 text-lg font-bold bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
                    >
                      {(isApprovingCollateral || isApprovingLiquidity)
                        ? "Approving..."
                        : (isApproveConfirmingCollateral || isApproveConfirmingLiquidity)
                        ? "Confirming Approval..."
                        : "Approve Token"}
                    </Button>
                  )}

                  {/* Supply Button */}
                  {((selectedAction === "supply-collateral" && isApprovedCollateral) || 
                    (selectedAction === "supply-liquidity" && isApprovedLiquidity)) && (
                    <Button
                      type="button"
                      onClick={handleSupply}
                      disabled={!amount || parseFloat(amount) <= 0 || 
                        (isSupplyingCollateral || isConfirmingCollateral || 
                         isSupplyingLiquidity || isConfirmingLiquidity)}
                      className={`w-full h-14 text-lg font-bold ${buttonStyles.primary} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
                    >
                      {(isSupplyingCollateral || isSupplyingLiquidity)
                        ? "Supplying..."
                        : (isConfirmingCollateral || isConfirmingLiquidity)
                        ? "Confirming..."
                        : selectedAction === "supply-collateral" 
                          ? "Supply Collateral"
                          : "Supply Liquidity"}
                    </Button>
                  )}
                </div>
              ) : (selectedAction === "withdraw-liquidity" || selectedAction === "withdraw-collateral") ? (
                <Button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={
                    (selectedAction === "withdraw-liquidity" && (!withdrawShares || parseFloat(withdrawShares) <= 0)) ||
                    (selectedAction === "withdraw-collateral" && (!amount || parseFloat(amount) <= 0)) ||
                    isWithdrawingLiquidity || isConfirmingWithdrawLiquidity ||
                    isWithdrawingCollateral || isConfirmingWithdrawCollateral
                  }
                  className={`w-full h-14 text-lg font-bold ${buttonStyles.primary} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
                >
                  {(isWithdrawingLiquidity || isWithdrawingCollateral)
                    ? "Withdrawing..."
                    : (isConfirmingWithdrawLiquidity || isConfirmingWithdrawCollateral)
                    ? "Confirming..."
                    : selectedAction === "withdraw-liquidity" 
                      ? "Withdraw Liquidity"
                      : "Withdraw Collateral"}
                </Button>
              ) : (
                <Button
                  className={`w-full h-14 text-lg font-bold ${buttonStyles.primary} rounded-xl`}
                  onClick={() => {
                    onActionSelect?.(selectedAction);
                  }}
                >
                  Execute {currentAction?.label}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>

    {/* Supply Liquidity Success Alert */}
    {showSuccessAlertLiquidity && (
      <SuccessAlert
        isOpen={showSuccessAlertLiquidity}
        onClose={handleCloseSuccessAlertAndReset}
        title="Transaction Success"
        description="Liquidity supplied successfully!"
        buttonText="Close"
        txHash={successTxHashLiquidity}
        chainId={currentChainId}
      />
    )}

    {/* Supply Collateral Success Alert */}
    {showSuccessAlertCollateral && (
      <SuccessAlert
        isOpen={showSuccessAlertCollateral}
        onClose={handleCloseSuccessAlertAndReset}
        title="Transaction Success"
        description="Collateral supplied successfully!"
        buttonText="Close"
        txHash={successTxHashCollateral}
        chainId={currentChainId}
      />
    )}

    {/* Withdraw Liquidity Success Alert */}
    {showSuccessAlertWithdrawLiquidity && (
      <SuccessAlert
        isOpen={showSuccessAlertWithdrawLiquidity}
        onClose={handleCloseSuccessAlertAndReset}
        title="Transaction Success"
        description="Liquidity withdrawn successfully!"
        buttonText="Close"
        txHash={successTxHashWithdrawLiquidity}
        chainId={currentChainId}
      />
    )}

    {/* Withdraw Collateral Success Alert */}
    {showSuccessAlertWithdrawCollateral && (
      <SuccessAlert
        isOpen={showSuccessAlertWithdrawCollateral}
        onClose={handleCloseSuccessAlertAndReset}
        title="Transaction Success"
        description="Collateral withdrawn successfully!"
        buttonText="Close"
        txHash={successTxHashWithdrawCollateral}
        chainId={currentChainId}
      />
    )}

    {/* Failed Alert */}
    {(showFailedAlertLiquidity || showFailedAlertCollateral || errorWithdrawLiquidity || errorWithdrawCollateral) && (
      <FailedAlert
        isOpen={showFailedAlertLiquidity || showFailedAlertCollateral || !!errorWithdrawLiquidity || !!errorWithdrawCollateral}
        onClose={() => {
          if (showFailedAlertLiquidity) handleCloseFailedAlertLiquidity();
          if (showFailedAlertCollateral) handleCloseFailedAlertCollateral();
          if (errorWithdrawLiquidity) clearErrorWithdrawLiquidity();
        }}
        title="Transaction Failed"
        description={errorMessageLiquidity || errorMessageCollateral || errorWithdrawLiquidity || (errorWithdrawCollateral?.message || "")}
        buttonText="Close"
      />
    )}

  </>
  );
});
