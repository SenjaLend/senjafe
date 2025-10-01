"use client";

import { useState, useEffect, useCallback } from "react";
import { graphClient } from "@/lib/graphql/client";
import { queryLendingPoolApy } from "@/lib/graphql/lendingpool-data.query";

interface PoolApyData {
  borrowAPY: string;
  supplyAPY: string;
  address: string;
}

interface GraphQLResponse {
  lendingPools?: {
    items: PoolApyData[];
  };
}

interface UseReadPoolApyReturn {
  borrowAPY: string;
  supplyAPY: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useReadPoolApy = (lendingPoolAddress?: string): UseReadPoolApyReturn => {
  const [borrowAPY, setBorrowAPY] = useState<string>("0.00");
  const [supplyAPY, setSupplyAPY] = useState<string>("0.00");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoolApy = useCallback(async () => {
    if (!lendingPoolAddress) {
      setBorrowAPY("0.00");
      setSupplyAPY("0.00");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const query = queryLendingPoolApy();
      const data = await graphClient.request<GraphQLResponse>(query);

      if (data?.lendingPools?.items) {
        const poolData = data.lendingPools.items.find(
          (pool: PoolApyData) => pool.address.toLowerCase() === lendingPoolAddress.toLowerCase()
        );

        if (poolData) {
          // Convert APY values - they appear to be in basis points (1/100th of a percent)
          // So 214 = 2.14%, 4 = 0.04%
          const borrowAPYValue = poolData.borrowAPY ? (Number(poolData.borrowAPY) / 100).toFixed(2) : "0.00";
          const supplyAPYValue = poolData.supplyAPY ? (Number(poolData.supplyAPY) / 100).toFixed(2) : "0.00";
          
          setBorrowAPY(borrowAPYValue);
          setSupplyAPY(supplyAPYValue);
        } else {
          setBorrowAPY("0.00");
          setSupplyAPY("0.00");
        }
      } else {
        setBorrowAPY("0.00");
        setSupplyAPY("0.00");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch APY data");
      setBorrowAPY("0.00");
      setSupplyAPY("0.00");
    } finally {
      setLoading(false);
    }
  }, [lendingPoolAddress]);

  useEffect(() => {
    fetchPoolApy();
  }, [fetchPoolApy]);

  return {
    borrowAPY,
    supplyAPY,
    loading,
    error,
    refetch: fetchPoolApy,
  };
};
