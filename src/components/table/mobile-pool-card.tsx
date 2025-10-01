"use client";

import React, { useMemo, memo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useReadTotalSupplyAssets } from "@/hooks/read/useReadTotalSupplyAssets";
import { useReadPoolApy } from "@/hooks/read/useReadPoolApy";
import { formatUnits } from "viem";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { ArrowRight } from "lucide-react";
import { formatLargeNumber } from "@/utils/format";

/**
 * Props for the MobilePoolCard component
 */
interface MobilePoolCardProps {
  /** Pool data */
  pool: LendingPoolWithTokens;
  /** Callback when pool is clicked */
  onClick?: (pool: LendingPoolWithTokens) => void;
  /** Whether the card is clickable */
  clickable?: boolean;
}

/**
 * Mobile-optimized pool card component
 *
 * @param props - Component props
 * @returns JSX element
 */
export const MobilePoolCard = memo(function MobilePoolCard({
  pool,
  onClick,
  clickable = true,
}: MobilePoolCardProps) {
  const { totalSupplyAssets, totalSupplyAssetsLoading } =
    useReadTotalSupplyAssets(
      pool.lendingPool as `0x${string}`,
      pool.borrowToken as `0x${string}`
    );

  const { supplyAPY, loading: apyLoading } = useReadPoolApy(
    pool.lendingPool as `0x${string}`
  );

  const formattedLTV = useMemo(() => {
    if (!pool.ltv) return "0%";
    const ltvNumber = Number(pool.ltv) / 1e18;
    return `${(ltvNumber * 100).toFixed(1)}%`;
  }, [pool.ltv]);

  const formattedLiquidity = useMemo(() => {
    if (totalSupplyAssetsLoading || !pool.borrowTokenInfo) {
      return { amount: "Loading...", symbol: "" };
    }

    // If totalSupplyAssets is undefined, show 0
    if (totalSupplyAssets === undefined) {
      return { amount: "0", symbol: pool.borrowTokenInfo.symbol };
    }

    const liquidity = formatUnits(
      totalSupplyAssets,
      pool.borrowTokenInfo.decimals
    );

    // Use formatLargeNumber for better display
    const formattedAmount = formatLargeNumber(liquidity);

    return {
      amount: formattedAmount,
      symbol: pool.borrowTokenInfo.symbol,
    };
  }, [totalSupplyAssets, totalSupplyAssetsLoading, pool.borrowTokenInfo]);

  const handleClick = () => {
    if (clickable && onClick) {
      onClick(pool);
    }
  };

  return (
    <Card
      className={`w-full py-4 sm:py-1.5 max-w-xl mx-auto overflow-hidden border-0 bg-[var(--electric-blue)]/10 backdrop-blur-xl ring-1 ring-[var(--electric-blue)]/30 hover:shadow-2xl hover:ring-[var(--electric-blue)]/50 transition-all duration-500 group ${
        clickable
          ? "hover:shadow-lg hover:bg-[var(--electric-blue)]/15 cursor-pointer"
          : ""
      }`}
      onClick={handleClick}
    >
      <CardContent className="px-3 sm:p-4">
        {/* Header with token logos and names */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Token logos */}
            <div className="flex items-center">
              <div className="relative group-hover:animate-pulse">
                <Image
                  src={pool.collateralTokenInfo?.logo || "/token/moonbeam-logo.svg"}
                  alt={pool.collateralTokenInfo?.name || "Collateral Token"}
                  width={28}
                  height={28}
                  className="rounded-full border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
              <div
                className="relative -ml-2 group-hover:animate-pulse"
                style={{ animationDelay: "0.1s" }}
              >
                <Image
                  src={pool.borrowTokenInfo?.logo || "/token/moonbeam-logo.svg"}
                  alt={pool.borrowTokenInfo?.name || "Borrow Token"}
                  width={28}
                  height={28}
                  className="rounded-full border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
            </div>

            {/* Token names */}
            <div className="min-w-0 flex-1">
              <div className="text-xs md:text-sm font-semibold text-white truncate">
                {pool.collateralTokenInfo?.symbol || "UNK"} /{" "}
                {pool.borrowTokenInfo?.symbol || "UNK"}
              </div>
              <div className="text-xs md:text-xs text-[var(--neon-green)] truncate">
                {pool.collateralTokenInfo?.name || "Unknown"} →{" "}
                {pool.borrowTokenInfo?.name || "Unknown"}
              </div>
            </div>
          </div>

          {/* Arrow icon for clickable cards */}
          {clickable && (
            <ArrowRight className="h-4 w-4 text-white/50 flex-shrink-0 group-hover:text-[var(--neon-green)] group-hover:translate-x-1 transition-all duration-300" />
          )}
        </div>

        {/* Stats row - APY, LTV and Liquidity in three columns */}
        <div className="bg-[var(--electric-blue)]/20 rounded-xl p-2.5 sm:p-3 border border-[var(--electric-blue)]/40 shadow-inner hover:shadow-md transition-all duration-300">
          <div className="grid grid-cols-3 gap-3">
            {/* APY */}
            <div className="text-center">
              <div className="text-xs md:text-sm font-semibold text-[var(--neon-green)] uppercase tracking-wide mb-1">
                APY
              </div>
              <div className="text-sm sm:text-base font-bold text-white">
                {apyLoading ? "..." : `${supplyAPY}%`}
              </div>
            </div>

            {/* LTV */}
            <div className="text-center">
              <div className="text-xs md:text-sm font-semibold text-cyan-300 uppercase tracking-wide mb-1">
                LTV
              </div>
              <div className="text-sm font-bold text-white">
                {formattedLTV}
              </div>
            </div>

            {/* Liquidity */}
            <div className="text-center">
              <div className="text-xs md:text-sm font-semibold text-yellow-300 uppercase tracking-wide mb-1">
                Liquidity
              </div>
              <div className="flex items-center justify-center gap-1">
                <div className="text-sm sm:text-sm font-bold text-white">
                  {formattedLiquidity.amount}
                </div>
                <div className="text-xs md:text-sm font-bold text-white">
                  {formattedLiquidity.symbol}
                </div>
              </div>
              {totalSupplyAssetsLoading && (
                <div className="text-xs md:text-sm text-[var(--neon-green)] mt-0.5">Updating...</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MobilePoolCard.displayName = "MobilePoolCard";
