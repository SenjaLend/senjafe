"use client";

import React, { useCallback, memo } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { Wallet, ArrowRight } from "lucide-react";
import { moonbeam, base } from "@/lib/chains";

interface BearyWalletConnectionGuardProps {
  /** Whether the guard is active */
  isActive: boolean;
  /** Callback when wallet is connected and chain is switched */
  onReady: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Pool data for context */
  pool?: LendingPoolWithTokens;
  /** Target chain ID (default: 1284 for Moonbeam) */
  targetChainId?: number;
}

const TARGET_CHAIN_ID = 1284; // Moonbeam chain ID

export const BearyWalletConnectionGuard = memo(
  function BearyWalletConnectionGuard({
    isActive,
    onReady,
    onCancel,
    targetChainId = TARGET_CHAIN_ID,
  }: BearyWalletConnectionGuardProps) {
    const router = useRouter();

    const { isConnected, chainId } = useAccount();
    const { switchChain } = useSwitchChain();

    const isOnTargetChain = chainId === targetChainId;
    const needsConnection = !isConnected;
    const needsChainSwitch = isConnected && !isOnTargetChain;

    // Get target chain name
    const getChainName = (chainId: number) => {
      switch (chainId) {
        case 1284: return "Moonbeam";
        case 8453: return "Base";
        default: return "Unknown";
      }
    };

    const targetChainName = getChainName(targetChainId);

    const handleConnect = useCallback(() => {
      // Simply navigate to profile page
      router.push("/profile");
    }, [router]);

    const handleSwitchChain = useCallback(async () => {
      try {
        await switchChain({ chainId: targetChainId });
      } catch {
        // Handle error silently
      }
    }, [switchChain, targetChainId]);

    const handleReady = useCallback(() => {
      if (isConnected && isOnTargetChain) {
        onReady();
      }
    }, [isConnected, isOnTargetChain, onReady]);

    // Auto-trigger ready when conditions are met
    React.useEffect(() => {
      if (isConnected && isOnTargetChain && isActive) {
        // Add a small delay to prevent race conditions
        const timer = setTimeout(() => {
          handleReady();
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [isConnected, isOnTargetChain, isActive, handleReady]);

    if (!isActive) return null;

    return (
      <Dialog open={isActive} onOpenChange={onCancel}>
        <DialogContent className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-orange-200/30 w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
              <Wallet className="h-5 w-5 text-orange-500" />
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Wallet Connection Required
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Beary Wallet Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 relative">
                  <img
                    src="/beary/beary-wallet.png"
                    alt="Beary with wallet"
                    className="w-full h-full object-contain animate-bounce"
                  />
                </div>
                {/* Sparkle effect */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-white text-xs">*</span>
                </div>
              </div>
            </div>
            {/* Message */}
            <div className="text-center">
              <p className="text-gray-600 leading-relaxed">
                {needsConnection
                  ? "Connect your wallet to access this lending pool!"
                  : needsChainSwitch
                  ? `Switch to ${targetChainName} network to interact with this pool!`
                  : "You're all set to interact with this pool!"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Beary is waiting for you!
              </p>
            </div>
            {/* Main action button - centered */}
            <div className="flex flex-col items-center space-y-4">
              {needsConnection && (
                <Button
                  onClick={handleConnect}
                  className="w-full max-w-xs bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-4 px-8 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    Connect Wallet
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
              )}

              {needsChainSwitch && (
                <Button
                  onClick={handleSwitchChain}
                  className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-8 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-5 w-5" />
                    Switch to {targetChainName} Network
                  </div>
                </Button>
              )}

              {isConnected && isOnTargetChain && (
                <Button
                  onClick={handleReady}
                  className="w-full max-w-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-8 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-5 w-5" />
                    Continue to Pool
                  </div>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

BearyWalletConnectionGuard.displayName = "BearyWalletConnectionGuard";
