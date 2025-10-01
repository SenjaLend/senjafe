"use client";

import React, { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserWalletBalance } from "@/hooks/read/useReadUserBalance";
import { useCurrentChainId } from "@/lib/chain";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { textStyles, inputStyles } from "@/styles/common";
import { PLACEHOLDERS } from "@/lib/constants";

interface BalanceInputFormProps {
  /** The selected pool */
  pool: LendingPoolWithTokens | null;
  /** Current amount value */
  amount: string;
  /** Callback when amount changes */
  onAmountChange: (amount: string) => void;
  /** Token type to show balance for */
  tokenType: "borrow" | "collateral";
  /** Whether input is disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Custom label for the amount input */
  customLabel?: string;
}

/**
 * Reusable component for input form with balance display and Max button
 */
export const BalanceInputForm = memo(function BalanceInputForm({
  pool,
  amount,
  onAmountChange,
  tokenType,
  disabled = false,
  className = "",
  customLabel,
}: BalanceInputFormProps) {
  const currentChainId = useCurrentChainId();

  // Get token info based on type
  const tokenInfo = tokenType === "collateral" 
    ? pool?.collateralTokenInfo 
    : pool?.borrowTokenInfo;

  const tokenAddress = tokenInfo?.addresses[currentChainId] as `0x${string}`;
  const tokenDecimals = tokenInfo?.decimals || 18;

  const {
    userWalletBalanceFormatted,
    userWalletBalanceParsed,
    walletBalanceLoading,
  } = useUserWalletBalance(
    tokenAddress || "0x0000000000000000000000000000000000000000",
    tokenDecimals
  );

  /**
   * Handle amount input change
   */
  const handleAmountChange = useCallback(
    (e: { target: { value: string } }) => {
      const inputValue = e.target.value;
      
      // Prevent negative numbers and invalid characters
      const cleanValue = inputValue.replace(/[^0-9.]/g, '');
      
      // Prevent multiple decimal points
      const parts = cleanValue.split('.');
      const sanitizedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;
      
      onAmountChange(sanitizedValue);
    },
    [onAmountChange]
  );

  /**
   * Handle setting maximum balance
   */
  const handleSetMax = useCallback(() => {
    if (userWalletBalanceParsed > 0) {
      onAmountChange(userWalletBalanceFormatted);
    }
  }, [userWalletBalanceFormatted, userWalletBalanceParsed, onAmountChange]);

  if (!pool) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className={`${textStyles.label} flex items-center gap-2`}>
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          {customLabel || "Amount to Supply"}
        </label>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Balance:</span>
          {walletBalanceLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          ) : (
            <span className="font-medium text-gray-700">
              {userWalletBalanceFormatted || "0.00"} {tokenInfo?.symbol}
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <Input
          type="number"
          placeholder={PLACEHOLDERS.AMOUNT_INPUT || "Enter amount"}
          value={amount}
          onChange={handleAmountChange}
          min="0"
          step="0.000001"
          className={inputStyles.default}
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            onClick={handleSetMax}
            disabled={userWalletBalanceParsed <= 0 || disabled}
            className="h-6 px-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 border-0"
            size="sm"
          >
            Max
          </Button>
          <span className="text-sm text-gray-500">{tokenInfo?.symbol}</span>
        </div>
      </div>
    </div>
  );
});
