"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoolInfoCard } from "./shared/pool-info-card";
import { AmountInput } from "./shared/amount-input";
import { useRefetch } from "@/hooks/useRefetch";
import { useReadPoolApy } from "@/hooks/read/useReadPoolApy";
import { useReadUserSupply } from "@/hooks/read/useReadUserSupply";
import { useReadUserCollateralBalance } from "@/hooks/read/useReadUserCollateralBalance";
import { useCurrentChainId } from "@/lib/chain/use-chain";
import { useAccount } from "wagmi";
import { useWithdrawLiquidity } from "@/hooks/write/useWithdrawLiquidity";
import { useWithdrawCollateral } from "@/hooks/write/useWithdrawCollateral";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { InlineSpinner } from "@/components/ui/spinner";
import { BearyTabGuard } from "@/components/wallet/beary-tab-guard";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";

interface WithdrawTabProps {
  pool?: LendingPoolWithTokens;
}

const WithdrawTab = ({ pool }: WithdrawTabProps) => {
  const [withdrawType, setWithdrawType] = useState("liquidity");
  const [amount, setAmount] = useState("");

  const currentChainId = useCurrentChainId();
  const { address, isConnected } = useAccount();

  // Refetch functionality
  const { addRefetchFunction, removeRefetchFunction } = useRefetch({
    refetchInterval: 0, // Disable auto-refetch, we'll trigger manually
    enabled: false,
  });

  // Get APY for the pool
  const {
    supplyAPY,
    loading: apyLoading,
    refetch: refetchApy,
  } = useReadPoolApy(pool?.lendingPool);

  // Withdraw Liquidity Hook
  const {
    handleWithdrawLiquidity,
    isWithdrawing: isWithdrawingLiquidity,
    isConfirming: isConfirmingLiquidity,
    isSuccess: isSuccessLiquidity,
    isError: isErrorLiquidity,
    showSuccessAlert: showSuccessAlertLiquidity,
    successTxHash: successTxHashLiquidity,
    handleCloseSuccessAlert: handleCloseSuccessAlertLiquidity,
    error: errorLiquidity,
  } = useWithdrawLiquidity(
    currentChainId,
    pool?.borrowTokenInfo?.decimals || 18,
    () => {
      setAmount("");
    }
  );

  // Withdraw Collateral Hook
  const {
    handleWithdrawCollateral,
    isWithdrawing: isWithdrawingCollateral,
    isConfirming: isConfirmingCollateral,
    isSuccess: isSuccessCollateral,
    isError: isErrorCollateral,
    showSuccessAlert: showSuccessAlertCollateral,
    successTxHash: successTxHashCollateral,
    handleCloseSuccessAlert: handleCloseSuccessAlertCollateral,
  } = useWithdrawCollateral(
    currentChainId,
    pool?.collateralTokenInfo?.decimals || 18,
    () => {
      setAmount("");
    }
  );

  // Get user supply shares for liquidity withdrawal
  const {
    userSupplySharesFormatted: liquidityBalanceFormatted,
    userSupplyShares: userSupplySharesRaw,
    userSupplySharesLoading: liquidityBalanceLoading,
    userSupplySharesError: liquidityBalanceError,
    refetchUserSupplyShares: refetchLiquidityBalance,
  } = useReadUserSupply(
    (pool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    pool?.borrowTokenInfo?.decimals || 18
  );

  // Get user collateral balance for collateral withdrawal
  const {
    parsedUserCollateralBalance: collateralBalanceFormatted,
    userCollateralBalanceLoading: collateralBalanceLoading,
    userCollateralBalanceError: collateralBalanceError,
    refetchUserCollateralBalance: refetchCollateralBalance,
  } = useReadUserCollateralBalance(
    (pool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    (pool?.collateralTokenInfo?.addresses[currentChainId] as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    pool?.collateralTokenInfo?.decimals || 18
  );

  // Parse the raw values for max button functionality
  const liquidityBalanceParsed = userSupplySharesRaw
    ? Number(userSupplySharesRaw) /
      Math.pow(10, pool?.borrowTokenInfo?.decimals || 18)
    : 0;
  const collateralBalanceParsed = collateralBalanceFormatted || 0;

  // Add refetch functions
  useEffect(() => {
    if (isConnected && address) {
      addRefetchFunction(refetchApy);
      addRefetchFunction(refetchLiquidityBalance);
      addRefetchFunction(refetchCollateralBalance);
    }

    return () => {
      removeRefetchFunction(refetchApy);
      removeRefetchFunction(refetchLiquidityBalance);
      removeRefetchFunction(refetchCollateralBalance);
    };
  }, [
    addRefetchFunction,
    removeRefetchFunction,
    refetchApy,
    refetchLiquidityBalance,
    refetchCollateralBalance,
    isConnected,
    address,
  ]);

  const handleSetMaxLiquidity = useCallback(() => {
    if (liquidityBalanceParsed > 0 && liquidityBalanceFormatted) {
      setAmount(liquidityBalanceFormatted);
    }
  }, [liquidityBalanceFormatted, liquidityBalanceParsed]);

  const handleSetMaxCollateral = useCallback(() => {
    if (collateralBalanceParsed > 0 && collateralBalanceFormatted !== undefined) {
      setAmount(collateralBalanceFormatted.toString());
    }
  }, [collateralBalanceFormatted, collateralBalanceParsed]);

  const handleWithdraw = useCallback(async () => {
    if (!pool || !amount || parseFloat(amount) <= 0) {
      return;
    }

    if (withdrawType === "liquidity") {
      await handleWithdrawLiquidity(pool.lendingPool as `0x${string}`, amount);
    } else if (withdrawType === "collateral") {
      await handleWithdrawCollateral(pool.lendingPool as `0x${string}`, amount);
    }
  }, [
    withdrawType,
    amount,
    pool,
    handleWithdrawLiquidity,
    handleWithdrawCollateral,
  ]);

  if (!pool || !pool.collateralTokenInfo || !pool.borrowTokenInfo) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-white/70">
            No pool selected or invalid pool data
          </p>
        </Card>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-white/70">
            Please connect your wallet to view balances
          </p>
        </Card>
      </div>
    );
  }

  return (
    <BearyTabGuard
      showGuard={true}
      tabName="Withdraw"
      title="Connect Wallet to Withdraw Assets"
      message="Connect your wallet to withdraw your supplied liquidity or collateral!"
    >
      <div className="space-y-6">
      <Tabs
        value={withdrawType}
        onValueChange={setWithdrawType}
        className="w-full"
      >
        <TabsList className="grid h-12 w-full grid-cols-2 bg-[var(--electric-blue)]/20 border-2 border-[var(--electric-blue)]/30 rounded-lg p-1 shadow-lg mb-4">
          <TabsTrigger
            value="liquidity"
            className="data-[state=active]:bg-[var(--electric-blue)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center text-white/70"
          >
            Withdraw Liquidity
          </TabsTrigger>
          <TabsTrigger
            value="collateral"
            className="data-[state=active]:bg-[var(--electric-blue)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center text-white/70"
          >
            Withdraw Collateral
          </TabsTrigger>
        </TabsList>

        {/* Pool Information Card */}
        <PoolInfoCard
          collateralToken={{
            symbol: pool.collateralTokenInfo.symbol,
            logo: pool.collateralTokenInfo.logo,
          }}
          borrowToken={{
            symbol: pool.borrowTokenInfo.symbol,
            logo: pool.borrowTokenInfo.logo,
          }}
          apy={apyLoading ? "Loading..." : supplyAPY}
          ltv={(Number(pool.ltv) / 1e16).toFixed(1)}
          showApy={withdrawType === "liquidity"}
        />

        <TabsContent value="liquidity" className="mt-4">
          <Card className="p-4 bg-gradient-to-br from-[var(--electric-blue)]/10 to-[var(--electric-blue)]/5 backdrop-blur-sm border-2 border-[var(--electric-blue)]/20 rounded-lg shadow-lg">
            <div className="space-y-4">
              {/* User Position Info */}
              <div className="p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-[var(--electric-blue)]/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Your Liquidity:</span>
                  <span className="text-md font-bold text-white">
                    {liquidityBalanceLoading ? (
                      <InlineSpinner size="sm" />
                    ) : liquidityBalanceError ? (
                      <span className="text-red-400 text-xs">Error loading balance</span>
                    ) : (
                      `${liquidityBalanceFormatted || "0.00"} ${
                        pool.borrowTokenInfo.symbol
                      }`
                    )}
                  </span>
                </div>
              </div>

              <AmountInput
                label="Amount to Withdraw"
                placeholder="Enter amount to withdraw"
                value={amount}
                onChange={setAmount}
                onMaxClick={handleSetMaxLiquidity}
                tokenSymbol={pool.borrowTokenInfo.symbol}
                maxDisabled={liquidityBalanceParsed <= 0}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="collateral" className="mt-4">
          <Card className="p-4 bg-gradient-to-br from-[var(--electric-blue)]/10 to-[var(--electric-blue)]/5 backdrop-blur-sm border-2 border-[var(--electric-blue)]/20 rounded-lg shadow-lg">
            <div className="space-y-4">
              {/* User Position Info */}
              <div className="p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-[var(--electric-blue)]/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">
                    Collateral Balance:
                  </span>
                  <span className="font-bold text-md text-white">
                    {collateralBalanceLoading ? (
                      <InlineSpinner size="sm" />
                    ) : collateralBalanceError ? (
                      <span className="text-red-400 text-xs">Error loading balance</span>
                    ) : (
                      `${collateralBalanceFormatted || "0.00"} ${
                        pool.collateralTokenInfo.symbol
                      }`
                    )}
                  </span>
                </div>
              </div>

              <AmountInput
                label="Amount to Withdraw"
                placeholder="Enter amount to withdraw"
                value={amount}
                onChange={setAmount}
                onMaxClick={handleSetMaxCollateral}
                tokenSymbol={pool.collateralTokenInfo.symbol}
                maxDisabled={collateralBalanceParsed <= 0}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Status */}
      {((withdrawType === "liquidity" &&
        (isWithdrawingLiquidity ||
          isConfirmingLiquidity ||
          isSuccessLiquidity ||
          isErrorLiquidity)) ||
        (withdrawType === "collateral" &&
          (isWithdrawingCollateral ||
            isConfirmingCollateral ||
            isSuccessCollateral ||
            isErrorCollateral))) && (
        <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
          <div className="space-y-3">
            {/* Withdraw Status */}
            {(isWithdrawingLiquidity || isWithdrawingCollateral) && (
              <div className="flex items-center gap-3 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">
                  {withdrawType === "collateral"
                    ? "Withdrawing collateral..."
                    : "Withdrawing liquidity..."}
                </span>
              </div>
            )}

            {(isConfirmingLiquidity || isConfirmingCollateral) && (
              <div className="flex items-center gap-3 text-[var(--electric-blue)]">
                <div className="w-5 h-5 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">
                  Confirming transaction...
                </span>
              </div>
            )}

            {(isSuccessLiquidity || isSuccessCollateral) && (
              <div className="flex items-center gap-3 text-green-600">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold">
                  {withdrawType === "collateral"
                    ? "Collateral withdrawn successfully!"
                    : "Liquidity withdrawn successfully!"}
                </span>
              </div>
            )}

            {/* Error Status */}
            {(isErrorLiquidity || isErrorCollateral) && (
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm font-semibold">
                  Transaction failed
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      <Button
        onClick={handleWithdraw}
        disabled={
          !amount ||
          parseFloat(amount) <= 0 ||
          isWithdrawingLiquidity ||
          isConfirmingLiquidity ||
          isWithdrawingCollateral ||
          isConfirmingCollateral
        }
        className="w-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] hover:from-[var(--electric-blue)]/80 hover:to-[var(--neon-green)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg"
      >
        {isWithdrawingLiquidity || isWithdrawingCollateral
          ? "Withdrawing..."
          : isConfirmingLiquidity || isConfirmingCollateral
          ? "Confirming..."
          : `Withdraw ${
              withdrawType === "liquidity" ? "Liquidity" : "Collateral"
            }`}
      </Button>

      {/* Withdraw Liquidity Success Alert */}
      {showSuccessAlertLiquidity && (
        <SuccessAlert
          isOpen={showSuccessAlertLiquidity}
          onClose={handleCloseSuccessAlertLiquidity}
          title="Transaction Success"
          description="Liquidity withdrawn successfully!"
          buttonText="Close"
          txHash={successTxHashLiquidity}
          chainId={currentChainId}
        />
      )}

      {/* Withdraw Collateral Success Alert */}
      {showSuccessAlertCollateral && (
        <SuccessAlert
          isOpen={showSuccessAlertCollateral}
          onClose={handleCloseSuccessAlertCollateral}
          title="Transaction Success"
          description="Collateral withdrawn successfully!"
          buttonText="Close"
          txHash={successTxHashCollateral}
          chainId={currentChainId}
        />
      )}

      {/* Failed Alert */}
      {(isErrorLiquidity || isErrorCollateral) && (
        <FailedAlert
          isOpen={isErrorLiquidity || isErrorCollateral}
          onClose={() => {
            // Reset error states
            if (isErrorLiquidity) {
              // Error will be cleared automatically by the hook
            }
            if (isErrorCollateral) {
              // Error will be cleared automatically by the hook
            }
          }}
          title="Transaction Failed"
          description={
            errorLiquidity || "Transaction failed. Please try again."
          }
          buttonText="Close"
        />
      )}
      </div>
    </BearyTabGuard>
  );
};

export default WithdrawTab;
