"use client";

import React, { useState, memo, useCallback, FormEvent, ChangeEvent, useEffect } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TokenSelector } from "@/components/select/token";
import { useCreatePool } from "@/hooks/write/useCreatePool";
import { SuccessAlert } from "@/components/alert";
import { useCurrentChainId } from "@/lib/chain";
import { Token, BaseComponentProps } from "@/types";
import { spacing } from "@/styles/common";
import { PLACEHOLDERS, BUTTON_TEXTS, LOADING_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES, VALIDATION } from "@/lib/constants";
import { useConnect, useAccount } from "wagmi";

/**
 * Props for the CreatePoolDialog component
 */
interface CreatePoolDialogProps extends BaseComponentProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when pool creation is successful */
  onSuccess?: () => void;
}

/**
 * CreatePoolDialog component for creating new lending pools
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const CreatePoolDialog = memo(function CreatePoolDialog({
  isOpen,
  onClose,
  onSuccess,
  className,
}: CreatePoolDialogProps) {
  const [collateralToken, setCollateralToken] = useState<Token | undefined>();
  const [borrowToken, setBorrowToken] = useState<Token | undefined>();
  const [ltv, setLtv] = useState("");
  const [isWalletGuardActive, setIsWalletGuardActive] = useState(false);
  const [pendingCreateAction, setPendingCreateAction] = useState<(() => void) | null>(null);
  const currentChainId = useCurrentChainId();
  const { isConnected, chainId, address: userAddress } = useAccount();
  const { connect, connectors } = useConnect();

  console.log("User Address:", userAddress);
  console.log("Is Connected:", isConnected);
  console.log("Chain ID:", chainId);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setCollateralToken(undefined);
    setBorrowToken(undefined);
    setLtv("");
    setIsWalletGuardActive(false);
    setPendingCreateAction(null);
  }, []);

  // Check if wallet is connected and on correct chain
  const isOnTargetChain = chainId === 1284; // Moonbeam chain ID
  const isWalletReady = isConnected && isOnTargetChain;

  // Form validation
  const isValid =
    collateralToken &&
    borrowToken &&
    ltv &&
    parseFloat(ltv) >= VALIDATION.LTV_MIN &&
    parseFloat(ltv) <= VALIDATION.LTV_MAX;

  const { 
    handleCreate, 
    isCreating, 
    isConfirming, 
    isSuccess, 
    isError, 
    txHash, 
    showSuccessAlert, 
    successTxHash, 
    handleCloseSuccessAlert,
    isUserRejection,
    resetUserRejection
  } = useCreatePool(() => {
    onSuccess?.();
    onClose();
    resetForm();
  });

  /**
   * Handle wallet guard ready
   */
  const handleWalletReady = useCallback(() => {
    setIsWalletGuardActive(false);
    
    // Execute pending action if there is one
    if (pendingCreateAction) {
      pendingCreateAction();
      setPendingCreateAction(null);
    }
  }, [pendingCreateAction]);

  // Auto-close wallet guard when user connects
  useEffect(() => {
    if (isConnected && isWalletGuardActive) {
      handleWalletReady();
    }
  }, [isConnected, isWalletGuardActive, handleWalletReady]);

  /**
   * Handle wallet guard cancel
   */
  const handleCancelWallet = useCallback(() => {
    setIsWalletGuardActive(false);
    setPendingCreateAction(null);
  }, []);

  /**
   * Handle connect wallet - show wallet dialog instead of redirect
   */
  const handleConnectWallet = useCallback(() => {
    setIsWalletGuardActive(true);
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if wallet is ready first
    if (!isWalletReady) {
      handleConnectWallet();
      return;
    }

    if (!isValid) {
      return;
    }

    // Proceed with pool creation
    const collateralAddress = collateralToken!.addresses[currentChainId];
    const borrowAddress = borrowToken!.addresses[currentChainId];

    if (!collateralAddress || !borrowAddress) {
      return;
    }

    await handleCreate(collateralAddress, borrowAddress, ltv);
  }, [collateralToken, borrowToken, ltv, handleCreate, isValid, currentChainId, isWalletReady, handleConnectWallet]);

  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    if (!isCreating && !isConfirming) {
      onClose();
      resetForm();
      resetUserRejection(); // Reset user rejection state when closing dialog
    }
  }, [isCreating, isConfirming, onClose, resetForm, resetUserRejection]);

  /**
   * Handle LTV input change
   */
   
  const handleLtvChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLtv(e.target.value);
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[90vw] max-w-[480px] mx-auto bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto p-0 border shadow-2xl rounded-2xl">
          <DialogHeader className="p-6">
            <div className="flex ">
              <div className=" gap-3">
                <div className="text-left">
                  <DialogTitle className="text-lg font-bold text-white">
                    {BUTTON_TEXTS.CREATE_POOL}
                  </DialogTitle>
                </div>
              </div>
            </div>
          </DialogHeader>

        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className={spacing.form} noValidate>
            {/* Token Selection Section */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <label className="text-sm font-medium text-white/90">
                    Collateral Token
                  </label>
                  <TokenSelector
                    selectedToken={collateralToken}
                    onTokenSelect={setCollateralToken}
                    otherToken={borrowToken}
                    label="Select collateral token"
                  />
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-sm font-medium text-white/90">
                    Borrow Token
                  </label>
                  <TokenSelector
                    selectedToken={borrowToken}
                    onTokenSelect={setBorrowToken}
                    otherToken={collateralToken}
                    label="Select borrow token"
                  />
                </div>
              </div>
            </div>

            {/* Pool Information Card */}
            {collateralToken && borrowToken && (
              <div className="bg-[var(--electric-blue)]/20 rounded-xl p-4 mb-6 border border-[var(--electric-blue)]/30 shadow-md backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[var(--neon-green)] font-medium">Collateral Token:</div>
                    <div className="font-bold text-white">{collateralToken.symbol}</div>
                  </div>
                  <div>
                    <div className="text-[var(--neon-green)] font-medium">Borrow Token:</div>
                    <div className="font-bold text-white">{borrowToken.symbol}</div>
                  </div>
                </div>
              </div>
            )}

            {/* LTV Input */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-white/90 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] shadow-sm"></span>
                Loan-to-Value (LTV) %
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={PLACEHOLDERS.LTV_INPUT}
                  value={ltv}
                  onChange={handleLtvChange}
                  min={VALIDATION.LTV_MIN.toString()}
                  max={VALIDATION.LTV_MAX.toString()}
                  step="0.1"
                  className="w-full h-12 px-4 pr-16 border-2 border-[var(--electric-blue)]/30 rounded-xl focus:border-[var(--electric-blue)] focus:ring-2 focus:ring-[var(--electric-blue)]/30 focus:outline-none bg-white/10 backdrop-blur-sm text-white placeholder-white/50 shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-sm text-[var(--neon-green)] font-medium">%</span>
                </div>
              </div>
            </div>

            {/* Transaction Status */}
            {(isCreating || isConfirming || isSuccess || isError || isUserRejection) && (
              <Card className="p-4 bg-[var(--electric-blue)]/20 border border-[var(--electric-blue)]/30 rounded-xl mb-6 backdrop-blur-sm">
                <div className="space-y-3">
                  {isCreating && (
                    <div className="flex items-center gap-3 text-[var(--electric-blue)]">
                      <div className="w-5 h-5 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-semibold text-white">
                         {LOADING_MESSAGES.CREATING_POOL}
                       </span>
                    </div>
                  )}

                  {isConfirming && (
                    <div className="flex items-center gap-3 text-[var(--electric-blue)]">
                      <div className="w-5 h-5 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-semibold text-white">
                         {LOADING_MESSAGES.CONFIRMING_TRANSACTION}
                       </span>
                    </div>
                  )}

                  {isSuccess && (
                    <div className="flex items-center gap-3 text-[var(--neon-green)]">
                      <div className="w-5 h-5 bg-[var(--neon-green)] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                       <span className="text-sm font-semibold text-white">
                         {SUCCESS_MESSAGES.POOL_CREATED}
                       </span>
                    </div>
                  )}

                  {isError && (
                    <div className="flex items-center gap-3 text-red-400">
                      <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                       <span className="text-sm font-semibold text-white">
                         {ERROR_MESSAGES.TRANSACTION_FAILED}
                       </span>
                    </div>
                  )}

                  {isUserRejection && (
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                       <span className="text-sm font-semibold text-white">
                         Transaction cancelled
                       </span>
                    </div>
                  )}

                  {txHash && (
                    <div className="text-xs text-white/60 break-all bg-white/10 p-2 rounded border border-white/20">
                      <span className="font-medium">Transaction Hash:</span>
                      <br />
                      {txHash}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isCreating || isConfirming || !isValid}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] hover:from-[var(--electric-blue)]/80 hover:to-[var(--neon-green)]/80 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                // Reset user rejection state when user tries to submit again
                if (isUserRejection) {
                  resetUserRejection();
                }
              }}
            >
              {isCreating
                ? LOADING_MESSAGES.CREATING_POOL
                : isConfirming
                ? LOADING_MESSAGES.CONFIRMING_TRANSACTION
                : !isWalletReady
                ? (
                    <>
                      <Wallet className="h-5 w-5 mr-2" />
                      Connect Wallet
                    </>
                  )
                : BUTTON_TEXTS.CREATE_POOL}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Success Alert */}
    <SuccessAlert
      isOpen={showSuccessAlert}
      onClose={handleCloseSuccessAlert}
      title="Transaction success"
      description="tx hash:"
      buttonText="Close"
      txHash={successTxHash}
      chainId={currentChainId}
    />

    {/* Wallet Connection Guard - Direct Wallet Connection */}
    {isWalletGuardActive && !isConnected && (
      <Dialog open={isWalletGuardActive} onOpenChange={handleCancelWallet}>
        <DialogContent className="bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)]/30 shadow-2xl rounded-2xl max-w-md w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white text-center">
              Connect Wallet to Continue
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-white/70 text-center mb-6">
              You need to connect your wallet to create a lending pool.
            </p>
            <div className="space-y-3">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="w-full bg-[var(--electric-blue)]/20 hover:bg-[var(--electric-blue)]/30 border border-[var(--electric-blue)]/30 hover:border-[var(--electric-blue)]/50 text-white py-3 px-4 rounded-lg transition-all duration-200"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect with {connector.name}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}
  </>
  );
});
