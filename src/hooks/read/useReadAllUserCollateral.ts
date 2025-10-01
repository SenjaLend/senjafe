import { useMemo } from "react";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { useReadUserCollateral } from "./useReadUserCollateral";

export interface UserCollateralData {
  pool: LendingPoolWithTokens;
  collateralBalance: bigint;
  collateralBalanceFormatted: string;
  collateralTokenSymbol: string;
  usdValue: number;
}

export const useReadAllUserCollateral = (pools: LendingPoolWithTokens[]) => {
  // For now, let's just handle the first 2 pools to avoid too many hooks
  const {
    userCollateral: collateral1,
    userCollateralFormatted: formatted1,
    userCollateralLoading: loading1,
    userCollateralError: error1,
  } = useReadUserCollateral(
    pools[0]?.lendingPool || "0x0000000000000000000000000000000000000000",
    pools[0]?.collateralTokenInfo?.decimals || 18
  );

  const {
    userCollateral: collateral2,
    userCollateralFormatted: formatted2,
    userCollateralLoading: loading2,
    userCollateralError: error2,
  } = useReadUserCollateral(
    pools[1]?.lendingPool || "0x0000000000000000000000000000000000000000",
    pools[1]?.collateralTokenInfo?.decimals || 18
  );

  // Process all collateral data
  const allCollateralData = useMemo(() => {
    const collateralData: UserCollateralData[] = [];
    let totalUsdValue = 0;

    const poolData = [
      {
        pool: pools[0],
        collateral: collateral1,
        formatted: formatted1,
        loading: loading1,
        error: error1,
      },
      {
        pool: pools[1],
        collateral: collateral2,
        formatted: formatted2,
        loading: loading2,
        error: error2,
      },
    ];

    poolData.forEach(({ pool, collateral, formatted }) => {
      if (pool && collateral && collateral > BigInt(0)) {
        const collateralTokenSymbol =
          pool.collateralTokenInfo?.symbol || "Unknown";

        // Simple USD calculation - you might want to use price feeds
        const usdValue = parseFloat(formatted) * 1; // Placeholder: 1 USD per token
        totalUsdValue += usdValue;

        collateralData.push({
          pool,
          collateralBalance: collateral,
          collateralBalanceFormatted: formatted,
          collateralTokenSymbol,
          usdValue,
        });
      }
    });

    return {
      collateralData,
      totalUsdValue,
      totalCollateralFormatted: totalUsdValue.toFixed(2),
    };
  }, [
    pools,
    collateral1,
    formatted1,
    loading1,
    error1,
    collateral2,
    formatted2,
    loading2,
    error2,
  ]);

  // Check if any data is loading
  const isLoading = loading1 || loading2;

  // Check if any data has errors
  const hasError = error1 || error2;

  return {
    ...allCollateralData,
    isLoading,
    hasError,
    totalPools: pools.length,
    activePools: allCollateralData.collateralData.length,
  };
};
