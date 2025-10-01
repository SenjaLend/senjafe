"use client";

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { LendingPoolWithTokens } from '@/lib/graphql/lendingpool-list.fetch';

interface UseWalletConnectionGuardReturn {
  /** Whether the guard is currently active */
  isGuardActive: boolean;
  /** Currently selected pool */
  selectedPool: LendingPoolWithTokens | null;
  /** Function to trigger wallet connection guard */
  triggerWalletGuard: (pool: LendingPoolWithTokens) => void;
  /** Function to handle when wallet is ready */
  handleWalletReady: () => void;
  /** Function to cancel wallet connection */
  handleCancelWallet: () => void;
  /** Function to proceed with pool action after wallet is ready */
  proceedWithPoolAction: (callback: (pool: LendingPoolWithTokens) => void) => void;
  /** Whether wallet is ready (connected and on correct chain) */
  isWalletReady: boolean;
}

const TARGET_CHAIN_ID = 1284; // Moonbeam chain ID

export function useWalletConnectionGuard(): UseWalletConnectionGuardReturn {
  const [isGuardActive, setIsGuardActive] = useState(false);
  const [selectedPool, setSelectedPool] = useState<LendingPoolWithTokens | null>(null);
  const [pendingAction, setPendingAction] = useState<((pool: LendingPoolWithTokens) => void) | null>(null);

  const { isConnected, chainId } = useAccount();
  const isOnTargetChain = chainId === TARGET_CHAIN_ID;

  const triggerWalletGuard = useCallback((pool: LendingPoolWithTokens) => {
    setSelectedPool(pool);
    
    // If wallet is already connected and on the right chain, proceed directly
    if (isConnected && isOnTargetChain) {
      return;
    }

    // Otherwise, show the wallet connection guard
    setIsGuardActive(true);
  }, [isConnected, isOnTargetChain]);

  const handleWalletReady = useCallback(() => {
    setIsGuardActive(false);
    
    // Execute pending action if there is one
    if (pendingAction && selectedPool) {
      pendingAction(selectedPool);
      setPendingAction(null);
    }
    
    // Don't clear selectedPool here - let the parent component handle it
    // setSelectedPool(null);
  }, [pendingAction, selectedPool]);

  const handleCancelWallet = useCallback(() => {
    setIsGuardActive(false);
    setSelectedPool(null);
    setPendingAction(null);
  }, []);

  const proceedWithPoolAction = useCallback((callback: (pool: LendingPoolWithTokens) => void) => {
    if (!selectedPool) return;

    // If wallet is ready, execute immediately
    if (isConnected && isOnTargetChain) {
      callback(selectedPool);
      return;
    }

    // Otherwise, store the action and trigger wallet guard
    setPendingAction(() => callback);
    setIsGuardActive(true);
  }, [selectedPool, isConnected, isOnTargetChain]);

  return {
    isGuardActive,
    selectedPool,
    triggerWalletGuard,
    handleWalletReady,
    handleCancelWallet,
    proceedWithPoolAction,
    isWalletReady: isConnected && isOnTargetChain,
  };
}
