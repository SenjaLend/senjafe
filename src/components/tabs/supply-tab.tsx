"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { useCurrentChainId } from "@/lib/chain/use-chain";
import { useSupplyLiquidity } from "@/hooks/write/useSupplyLiquidity";
import { useSupplyCollateral } from "@/hooks/write/useSupplyCollateral";
import { useUserWalletBalance } from "@/hooks/read/useReadUserBalance";
import { useReadPoolApy } from "@/hooks/read/useReadPoolApy";
import { useRefetch } from "@/hooks/useRefetch";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { InlineSpinner } from "@/components/ui/spinner";
import { BearyTabGuard } from "@/components/wallet/beary-tab-guard";
import Image from "next/image";

// Utility function to format large numbers
const formatLargeNumber = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return "0.00";
  
  // Use toLocaleString for proper thousand separators
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  });
};

interface SupplyTabProps {
  pool?: LendingPoolWithTokens;
}

const SupplyTab = ({ pool }: SupplyTabProps) => {
  const [supplyType, setSupplyType] = useState("liquidity");
  const [amount, setAmount] = useState("");

  const currentChainId = useCurrentChainId();

  // Get APY for the pool
  const { supplyAPY, loading: apyLoading, refetch: refetchApy } = useReadPoolApy(pool?.lendingPool);

  // Refetch functionality
  const { addRefetchFunction, removeRefetchFunction, triggerRefetch } = useRefetch({
    refetchInterval: 0, // Disable auto-refetch, we'll trigger manually
    enabled: false,
  });


  // Get user balance for liquidity (borrow token)
  const {
    userWalletBalanceFormatted: liquidityBalanceFormatted,
    userWalletBalanceParsed: liquidityBalanceParsed,
    walletBalanceLoading: liquidityBalanceLoading,
    refetchWalletBalance: refetchLiquidityBalance,
  } = useUserWalletBalance(
    (pool?.borrowTokenInfo?.addresses[currentChainId] as `0x${string}`) || "",
    pool?.borrowTokenInfo?.decimals || 18
  );

  // Get user balance for collateral (collateral token)
  const {
    userWalletBalanceFormatted: collateralBalanceFormatted,
    userWalletBalanceParsed: collateralBalanceParsed,
    walletBalanceLoading: collateralBalanceLoading,
    refetchWalletBalance: refetchCollateralBalance,
  } = useUserWalletBalance(
    (pool?.collateralTokenInfo?.addresses[currentChainId] as `0x${string}`) || "",
    pool?.collateralTokenInfo?.decimals || 18
  );

  // Add refetch functions
  useEffect(() => {
    addRefetchFunction(refetchApy);
    addRefetchFunction(refetchLiquidityBalance);
    addRefetchFunction(refetchCollateralBalance);
    
    return () => {
      removeRefetchFunction(refetchApy);
      removeRefetchFunction(refetchLiquidityBalance);
      removeRefetchFunction(refetchCollateralBalance);
    };
  }, [addRefetchFunction, removeRefetchFunction, refetchApy, refetchLiquidityBalance, refetchCollateralBalance]);

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
    // Trigger refetch after successful supply
    triggerRefetch();
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
    // Trigger refetch after successful supply
    triggerRefetch();
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
    // Reset success alerts
    if (showSuccessAlertLiquidity) handleCloseSuccessAlertLiquidity();
    if (showSuccessAlertCollateral) handleCloseSuccessAlertCollateral();
    // Reset failed alerts
    if (showFailedAlertLiquidity) handleCloseFailedAlertLiquidity();
    if (showFailedAlertCollateral) handleCloseFailedAlertCollateral();
  }, [resetApproveStatesLiquidity, resetSuccessStatesLiquidity, resetApproveStatesCollateral, resetSuccessStatesCollateral, showSuccessAlertLiquidity, handleCloseSuccessAlertLiquidity, showSuccessAlertCollateral, handleCloseSuccessAlertCollateral, showFailedAlertLiquidity, handleCloseFailedAlertLiquidity, showFailedAlertCollateral, handleCloseFailedAlertCollateral]);

  const handleCloseSuccessAlertAndReset = useCallback(() => {
    if (supplyType === "liquidity") {
      handleCloseSuccessAlertLiquidity();
      resetAfterSuccessLiquidity();
    } else if (supplyType === "collateral") {
      handleCloseSuccessAlertCollateral();
      resetAfterSuccessCollateral();
    }
    setAmount("");
  }, [supplyType, handleCloseSuccessAlertLiquidity, resetAfterSuccessLiquidity, handleCloseSuccessAlertCollateral, resetAfterSuccessCollateral]);

  /**
   * Handle setting maximum balance
   */
  const handleSetMax = useCallback(() => {
    if (supplyType === "liquidity" && liquidityBalanceParsed > 0) {
      setAmount(liquidityBalanceFormatted);
    } else if (supplyType === "collateral" && collateralBalanceParsed > 0) {
      setAmount(collateralBalanceFormatted);
    }
  }, [supplyType, liquidityBalanceFormatted, liquidityBalanceParsed, collateralBalanceFormatted, collateralBalanceParsed]);

  /**
   * Handle approve token
   */
  const handleApprove = useCallback(async () => {
    
    if (!pool || !amount || parseFloat(amount) <= 0) {
      return;
    }

    if (supplyType === "liquidity") {
      resetSuccessStatesLiquidity();
      const decimals = pool.borrowTokenInfo?.decimals || 18;
      const tokenAddress = pool.borrowTokenInfo?.addresses[currentChainId] as `0x${string}`;
      const spenderAddress = pool.lendingPool as `0x${string}`;
      
      await handleApproveTokenLiquidity(tokenAddress, spenderAddress, amount, decimals);
    } else if (supplyType === "collateral") {
      resetSuccessStatesCollateral();
      const decimals = pool.collateralTokenInfo?.decimals || 18;
      const tokenAddress = pool.collateralTokenInfo?.addresses[currentChainId] as `0x${string}`;
      const spenderAddress = pool.lendingPool as `0x${string}`;
      
      await handleApproveTokenCollateral(tokenAddress, spenderAddress, amount, decimals);
    }
  }, [amount, pool, supplyType, handleApproveTokenLiquidity, handleApproveTokenCollateral, currentChainId, resetSuccessStatesLiquidity, resetSuccessStatesCollateral]);

  /**
   * Handle supply (liquidity or collateral)
   */
  const handleSupply = useCallback(async () => {
    if (!pool || !amount || parseFloat(amount) <= 0) {
      return;
    }

    if (supplyType === "liquidity") {
      const decimals = pool.borrowTokenInfo?.decimals || 18;
      await handleSupplyLiquidity(pool.lendingPool as `0x${string}`, amount, decimals);
    } else if (supplyType === "collateral") {
      const decimals = pool.collateralTokenInfo?.decimals || 18;
      await handleSupplyCollateral(pool.lendingPool as `0x${string}`, amount, decimals);
    }
  }, [amount, pool, supplyType, handleSupplyLiquidity, handleSupplyCollateral]);

  // Early return if no pool is provided
  if (!pool) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No pool selected</p>
          <p className="text-gray-400 text-sm mt-2">Please select a pool to continue</p>
        </div>
      </div>
    );
  }

  return (
    <BearyTabGuard
      showGuard={true}
      tabName="Supply"
      title="Connect Wallet to Supply Assets"
      message="Connect your wallet to supply liquidity or collateral to this lending pool!"
    >
      <div className="space-y-6">
      <Tabs value={supplyType} onValueChange={setSupplyType} className="w-full">
        <TabsList className="grid h-12 w-full grid-cols-2 bg-[var(--electric-blue)]/20 border-2 border-[var(--electric-blue)]/30 rounded-lg p-1 shadow-lg">
          <TabsTrigger 
            value="liquidity" 
            className="data-[state=active]:bg-[var(--electric-blue)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center text-white/70"
          >
            Supply Liquidity
          </TabsTrigger>
          <TabsTrigger 
            value="collateral" 
            className="data-[state=active]:bg-[var(--electric-blue)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center text-white/70"
          >
            Supply Collateral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liquidity" className="mt-4">
          <div className="space-y-4">
            {/* Pool Information Card */}
            <Card className="p-4 bg-[var(--electric-blue)]/10 backdrop-blur-xl border-2 border-[var(--electric-blue)]/30 rounded-lg shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/70 mb-1">Collateral Token:</p>
                  <div className="flex items-center space-x-2">
                    <Image
                      src={pool.collateralTokenInfo?.logo || "/token/moonbeam-logo.svg"}
                      alt={pool.collateralTokenInfo?.symbol || "Token"}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <p className="font-semibold text-white">{pool.collateralTokenInfo?.symbol}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/70 mb-1">Borrow Token:</p>
                  <div className="flex items-center space-x-2">
                    <Image
                      src={pool.borrowTokenInfo?.logo || "/token/usdt.png"}
                      alt={pool.borrowTokenInfo?.symbol || "Token"}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <p className="font-semibold text-white">{pool.borrowTokenInfo?.symbol}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/70 mb-1">APY:</p>
                  <p className="font-semibold text-[var(--neon-green)]">{apyLoading ? <InlineSpinner size="sm" /> : `${supplyAPY}%`}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70 mb-1">LTV:</p>
                  <p className="font-semibold text-cyan-300">{((Number(pool.ltv) / 1e16)).toFixed(1)}%</p>
                </div>
              </div>
            </Card>

            {/* Amount Input Section */}
            <Card className="p-4 bg-gradient-to-br from-[var(--electric-blue)]/10 to-[var(--electric-blue)]/5 backdrop-blur-sm border-2 border-[var(--electric-blue)]/20 rounded-lg shadow-lg">
              <div className="space-y-4">
                {/* Wallet Balance Card */}
                <div className="p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-[var(--electric-blue)]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Balance:</span>
                    <span className="text-md font-bold text-white">
                      {liquidityBalanceLoading ? (
                        <InlineSpinner size="sm" />
                      ) : (
                        `${formatLargeNumber(liquidityBalanceFormatted || "0.00")} ${pool.borrowTokenInfo?.symbol}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[var(--neon-green)] rounded-full"></div>
                    <label className="text-sm font-medium text-white">
                      Amount to Supply
                    </label>
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter amount to supply"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-black/30 backdrop-blur-sm border-2 border-[var(--electric-blue)]/30 focus:border-[var(--electric-blue)] focus:ring-4 focus:ring-[var(--electric-blue)]/20 transition-all duration-300 rounded-lg shadow-md pr-20 text-white placeholder:text-white/50"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <button
                          className="bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                          onClick={handleSetMax}
                          disabled={liquidityBalanceParsed <= 0}
                        >
                          Max
                        </button>
                        <span className="text-sm font-medium text-white">{pool.borrowTokenInfo?.symbol}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collateral" className="mt-4">
          <div className="space-y-4">
            {/* Pool Information Card */}
            <Card className="p-4 bg-gradient-to-br from-[var(--electric-blue)]/10 to-[var(--electric-blue)]/5 backdrop-blur-sm border-2 border-[var(--electric-blue)]/20 rounded-lg shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/70 mb-1">Collateral Token:</p>
                  <div className="flex items-center space-x-2">
                    <Image
                      src={pool.collateralTokenInfo?.logo || "/token/moonbeam-logo.svg"}
                      alt={pool.collateralTokenInfo?.symbol || "Token"}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <p className="font-semibold text-white">{pool.collateralTokenInfo?.symbol}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/70 mb-1">Borrow Token:</p>
                  <div className="flex items-center space-x-2">
                    <Image
                      src={pool.borrowTokenInfo?.logo || "/token/usdt.png"}
                      alt={pool.borrowTokenInfo?.symbol || "Token"}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <p className="font-semibold text-white">{pool.borrowTokenInfo?.symbol}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/70 mb-1">LTV:</p>
                  <p className="font-semibold text-cyan-300">{((Number(pool.ltv) / 1e16)).toFixed(1)}%</p>
                </div>
              </div>
            </Card>

            {/* Amount Input Section */}
            <Card className="p-4 bg-gradient-to-br from-[var(--electric-blue)]/10 to-[var(--electric-blue)]/5 backdrop-blur-sm border-2 border-[var(--electric-blue)]/20 rounded-lg shadow-lg">
              <div className="space-y-4">
                {/* Wallet Balance Card */}
                <div className="p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-[var(--electric-blue)]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Balance:</span>
                    <span className="text-md font-bold text-white">
                      {collateralBalanceLoading ? (
                        <InlineSpinner size="sm" />
                      ) : (
                        `${formatLargeNumber(collateralBalanceFormatted || "0.00")} ${pool.collateralTokenInfo?.symbol}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[var(--neon-green)] rounded-full"></div>
                    <label className="text-sm font-medium text-white">
                      Amount to Supply
                    </label>
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter amount to supply"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-black/30 backdrop-blur-sm border-2 border-[var(--electric-blue)]/30 focus:border-[var(--electric-blue)] focus:ring-4 focus:ring-[var(--electric-blue)]/20 transition-all duration-300 rounded-lg shadow-md pr-20 text-white placeholder:text-white/50"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <button
                          className="bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                          onClick={handleSetMax}
                          disabled={collateralBalanceParsed <= 0}
                        >
                          Max
                        </button>
                        <span className="text-sm font-medium text-white">{pool.collateralTokenInfo?.symbol}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Status */}
      {((supplyType === "liquidity" && (isApprovingLiquidity || isApproveConfirmingLiquidity || isApproveSuccessLiquidity || isSupplyingLiquidity || isConfirmingLiquidity || isSuccessLiquidity || isErrorLiquidity)) ||
        (supplyType === "collateral" && (isApprovingCollateral || isApproveConfirmingCollateral || isApproveSuccessCollateral || isSupplyingCollateral || isConfirmingCollateral || isSuccessCollateral || isErrorCollateral))) && (
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
              <div className="flex items-center gap-3 text-[var(--electric-blue)]">
                <div className="w-5 h-5 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
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
                  {supplyType === "collateral" ? "Supplying collateral..." : "Supplying liquidity..."}
                </span>
              </div>
            )}

            {(isConfirmingCollateral || isConfirmingLiquidity) && (
              <div className="flex items-center gap-3 text-[var(--electric-blue)]">
                <div className="w-5 h-5 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
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
                  {supplyType === "collateral" ? "Collateral supplied successfully!" : "Liquidity supplied successfully!"}
                </span>
              </div>
            )}

            {/* Error Status */}
            {(isErrorCollateral || isErrorLiquidity) && (
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
      <div className="space-y-3">
        {/* Approve Button */}
        {((supplyType === "collateral" && !isApprovedCollateral) || 
          (supplyType === "liquidity" && !isApprovedLiquidity)) && (
          <Button
            type="button"
            onClick={handleApprove}
            disabled={!amount || parseFloat(amount) <= 0 || 
              (isApprovingCollateral || isApproveConfirmingCollateral || 
               isApprovingLiquidity || isApproveConfirmingLiquidity)}
            className="w-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] hover:from-[var(--electric-blue)]/80 hover:to-[var(--neon-green)]/80 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isApprovingCollateral || isApprovingLiquidity)
              ? "Approving..."
              : (isApproveConfirmingCollateral || isApproveConfirmingLiquidity)
              ? "Confirming Approval..."
              : "Approve Token"}
          </Button>
        )}

        {/* Supply Button */}
        {((supplyType === "collateral" && isApprovedCollateral) || 
          (supplyType === "liquidity" && isApprovedLiquidity)) && (
          <Button
            type="button"
            onClick={handleSupply}
            disabled={!amount || parseFloat(amount) <= 0 || 
              (isSupplyingCollateral || isConfirmingCollateral || 
               isSupplyingLiquidity || isConfirmingLiquidity)}
            className="w-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] hover:from-[var(--electric-blue)]/80 hover:to-[var(--neon-green)]/80 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isSupplyingCollateral || isSupplyingLiquidity)
              ? "Supplying..."
              : (isConfirmingCollateral || isConfirmingLiquidity)
              ? "Confirming..."
              : supplyType === "collateral" 
                ? "Supply Collateral"
                : "Supply Liquidity"}
          </Button>
        )}
      </div>

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

      {/* Failed Alert */}
      {(showFailedAlertLiquidity || showFailedAlertCollateral) && (
        <FailedAlert
          isOpen={showFailedAlertLiquidity || showFailedAlertCollateral}
          onClose={() => {
            if (showFailedAlertLiquidity) handleCloseFailedAlertLiquidity();
            if (showFailedAlertCollateral) handleCloseFailedAlertCollateral();
          }}
          title="Transaction Failed"
          description={errorMessageLiquidity || errorMessageCollateral}
          buttonText="Close"
        />
      )}
      </div>
    </BearyTabGuard>
  );
};

export default SupplyTab;
