import { useMemo } from "react";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { useReadUserCollateral } from "./useReadUserCollateral";
import { useReadHealthFactor } from "./useReadHealthFactor";

export interface UserPortfolioData {
  pool: LendingPoolWithTokens;
  collateralBalance: bigint;
  collateralBalanceFormatted: string;
  collateralTokenSymbol: string;
  usdValue: number;
  healthFactor?: bigint;
  healthFactorFormatted?: string;
}

export const useReadUserPortfolio = (pools: LendingPoolWithTokens[]) => {

  // For now, we'll handle only the first pool to avoid conditional hooks
  // In a real implementation, you might want to use a different approach
  const firstPool = pools[0];
  
  const { 
    userCollateral, 
    userCollateralFormatted,
    userCollateralLoading, 
    userCollateralError 
  } = useReadUserCollateral(
    firstPool?.lendingPool || "0x0",
    firstPool?.collateralTokenInfo?.decimals || 18
  );

  const { 
    healthFactor, 
    isLoading: healthFactorLoading, 
    error: healthFactorError 
  } = useReadHealthFactor(firstPool?.lendingPool || "0x0");

  const collateralData = useMemo(() => {
    if (!firstPool) return [];
    
    return [{
      pool: firstPool,
      collateralBalance: userCollateral || BigInt(0),
      collateralLoading: userCollateralLoading,
      collateralError: userCollateralError,
      healthFactor: healthFactor || BigInt(0),
      healthFactorLoading,
      healthFactorError,
    }];
  }, [firstPool, userCollateral, userCollateralLoading, userCollateralError, healthFactor, healthFactorLoading, healthFactorError]);

  // Process portfolio data
  const portfolioData = useMemo(() => {
    const processedData: UserPortfolioData[] = [];
    let totalUsdValue = 0;

    collateralData.forEach(({ pool, collateralBalance, healthFactor }) => {
      if (collateralBalance > BigInt(0)) {
        const collateralTokenSymbol = pool.collateralTokenInfo?.symbol || "Unknown";
        
        // Use the already formatted collateral balance from the hook
        const collateralBalanceFormatted = userCollateralFormatted;
        
        // Simple USD calculation - you might want to use price feeds
        // For now, assuming 1 USD per token (placeholder)
        const usdValue = parseFloat(collateralBalanceFormatted) * 1;
        totalUsdValue += usdValue;

        // Format health factor
        const healthFactorFormatted = healthFactor > BigInt(0) 
          ? (Number(healthFactor) / 1e18).toFixed(2)
          : undefined;

        processedData.push({
          pool,
          collateralBalance,
          collateralBalanceFormatted,
          collateralTokenSymbol,
          usdValue,
          healthFactor,
          healthFactorFormatted,
        });
      }
    });

    return {
      portfolioData: processedData,
      totalUsdValue,
      totalCollateralFormatted: totalUsdValue.toFixed(2),
    };
  }, [collateralData, userCollateralFormatted]);

  // Check if any data is loading
  const isLoading = collateralData.some(data => data.collateralLoading || data.healthFactorLoading);
  
  // Check if any data has errors
  const hasError = collateralData.some(data => data.collateralError || data.healthFactorError);

  return {
    ...portfolioData,
    isLoading,
    hasError,
    totalPools: pools.length,
    activePools: portfolioData.portfolioData.length,
  };
};
