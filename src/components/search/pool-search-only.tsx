"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  fetchLendingPools,
  pairLendingPoolsWithTokens,
  LendingPoolWithTokens,
} from "@/lib/graphql/lendingpool-list.fetch";
// Note: Removed useCurrentChainId import as we now fetch from all chains
import { PoolSearch } from "./pool-search";

interface PoolSearchOnlyProps {
  selectedPool: LendingPoolWithTokens | null;
  onPoolSelect: (pool: LendingPoolWithTokens) => void;
  showSearchInput?: boolean;
  className?: string;
  autoSelectFirst?: boolean;
}

export const PoolSearchOnly = memo(function PoolSearchOnly({
  selectedPool,
  onPoolSelect,
  showSearchInput = true,
  className = "",
  autoSelectFirst = false,
}: PoolSearchOnlyProps) {
  const [pools, setPools] = useState<LendingPoolWithTokens[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Note: We now fetch pools from all chains, not just the current chain

  const loadPools = useCallback(async () => {
    setLoading(true);
    try {
      const rawPools = await fetchLendingPools();
      // Fetch pools from all chains, not just current chain
      const enrichedPools = pairLendingPoolsWithTokens(rawPools);
      
      // Filter out pools with unknown tokens
      const validPools = enrichedPools.filter(pool => 
        pool.borrowTokenInfo && pool.collateralTokenInfo
      );
      
      setPools(validPools);

      // Auto-select first pool if requested and no pool is selected
      if (autoSelectFirst && validPools.length > 0 && !selectedPool) {
        onPoolSelect(validPools[0]);
      }
    } catch {
      // Silent error handling for production
      setPools([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPool, onPoolSelect, autoSelectFirst]); // Remove currentChainId dependency

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  // Memoized filtered pools
  const filteredPools = useMemo(() => {
    if (!searchQuery) return pools;

    const query = searchQuery.toLowerCase();
    return pools.filter((pool) => {
      const borrowSymbol = pool.borrowTokenInfo?.symbol?.toLowerCase() || "";
      const collateralSymbol =
        pool.collateralTokenInfo?.symbol?.toLowerCase() || "";
      const borrowName = pool.borrowTokenInfo?.name?.toLowerCase() || "";
      const collateralName =
        pool.collateralTokenInfo?.name?.toLowerCase() || "";

      return (
        borrowSymbol.includes(query) ||
        collateralSymbol.includes(query) ||
        borrowName.includes(query) ||
        collateralName.includes(query)
      );
    });
  }, [pools, searchQuery]);

  // Memoized handlers
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return (
    <PoolSearch
      selectedPool={selectedPool}
      onPoolSelect={onPoolSelect}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onClearSearch={handleClearSearch}
      loading={loading}
      filteredPools={filteredPools}
      showSearchInput={showSearchInput}
      className={className}
    />
  );
});
