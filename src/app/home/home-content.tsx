"use client";

import React, { useState, useCallback } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoolsOverview } from "@/components/table/pools-overview";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { BearyWalletConnectionGuard } from "@/components/wallet/beary-wallet-connection-guard";
import { useWalletConnectionGuard } from "@/hooks/useWalletConnectionGuard";
import { useAccount } from "wagmi";

// Import tab components
import { SupplyTab, BorrowTab, RepayTab, WithdrawTab } from "@/components/tabs";

// Custom PoolsOverview wrapper that accepts onPoolClick prop
interface PoolsOverviewWithCustomHandlerProps {
  onPoolClick: (pool: LendingPoolWithTokens) => void;
}

const PoolsOverviewWithCustomHandler = ({
  onPoolClick,
}: PoolsOverviewWithCustomHandlerProps) => {
  return <PoolsOverview onPoolClick={onPoolClick} />;
};

const Page = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("supply");
  const [selectedPool, setSelectedPool] =
    useState<LendingPoolWithTokens | null>(null);
    const { address: userAddress } = useAccount();
    console.log("User Address:", userAddress);

  // Wallet connection guard
  const {
    isGuardActive,
    selectedPool: guardSelectedPool,
    triggerWalletGuard,
    handleWalletReady,
    handleCancelWallet,
    isWalletReady,
  } = useWalletConnectionGuard();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handlePoolClick = useCallback((pool: LendingPoolWithTokens) => {
    // Use wallet connection guard to ensure wallet is connected and on correct chain
    triggerWalletGuard(pool);
  }, [triggerWalletGuard]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedPool(null);
    // Also clear the guard selected pool to prevent conflicts
    if (guardSelectedPool) {
      handleCancelWallet();
    }
  }, [guardSelectedPool, handleCancelWallet]);

  // Handle when wallet is ready - open the pool dialog
  const handleWalletReadyAndOpenDialog = useCallback(() => {
    if (guardSelectedPool) {
      setSelectedPool(guardSelectedPool);
      setIsDialogOpen(true);
    }
  }, [guardSelectedPool]);

  // Auto-open dialog when wallet becomes ready
  React.useEffect(() => {
    if (isWalletReady && guardSelectedPool && !isDialogOpen && !isGuardActive) {
      handleWalletReadyAndOpenDialog();
    }
  }, [isWalletReady, guardSelectedPool, isDialogOpen, isGuardActive, handleWalletReadyAndOpenDialog]);

  return (
    <div className="min-h-screen w-full pb-20 relative overflow-hidden flex mt-8">
      {/* Mobile-optimized container */}
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 -mt-2">
        {/* Pool Overview */}
        <div className="relative">
          <PoolsOverviewWithCustomHandler onPoolClick={handlePoolClick} />
        </div>

        {/* Tab Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)]/20 w-[calc(100vw-2rem)] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white text-center">
                {selectedPool
                  ? `${selectedPool.collateralTokenInfo?.symbol} / ${selectedPool.borrowTokenInfo?.symbol}`
                  : ""}
              </DialogTitle>
            </DialogHeader>

            {selectedPool && (
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid h-12 w-full grid-cols-4 bg-[var(--electric-blue)]/20 border-2 border-[var(--electric-blue)]/30 rounded-lg p-1 shadow-lg">
                  <TabsTrigger
                    value="supply"
                    className="data-[state=active]:bg-[var(--electric-blue)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center text-white/70"
                  >
                    Supply
                  </TabsTrigger>
                  <TabsTrigger
                    value="borrow"
                    className="data-[state=active]:bg-[var(--electric-blue)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center text-white/70"
                  >
                    Borrow
                  </TabsTrigger>
                  <TabsTrigger
                    value="repay"
                    className="data-[state=active]:bg-[var(--electric-blue)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center text-white/70"
                  >
                    Repay
                  </TabsTrigger>
                  <TabsTrigger
                    value="withdraw"
                    className="data-[state=active]:bg-[var(--electric-blue)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center text-white/70"
                  >
                    Withdraw
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="supply" className="mt-6">
                  <SupplyTab pool={selectedPool} />
                </TabsContent>

                <TabsContent value="borrow" className="mt-6">
                  <BorrowTab pool={selectedPool} />
                </TabsContent>

                <TabsContent value="repay" className="mt-6">
                  <RepayTab pool={selectedPool} />
                </TabsContent>

                <TabsContent value="withdraw" className="mt-6">
                  <WithdrawTab pool={selectedPool} />
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallet Connection Guard */}
      <BearyWalletConnectionGuard
        isActive={isGuardActive}
        onReady={handleWalletReady}
        onCancel={handleCancelWallet}
        pool={guardSelectedPool || undefined}
        targetChainId={1284}
      />
    </div>
  );
};

export default Page;
