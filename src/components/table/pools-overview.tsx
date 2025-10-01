"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";

import { Card } from "@/components/ui/card";
import { PoolSearchControls } from "./pool-search-controls";
import { ResponsivePoolsTable } from "./responsive-pools-table";
import { PoolActionsDialog } from "@/components/dialog/pool-actions";
import { BearyNotFound } from "@/components/search/beary-not-found";
import {
  fetchLendingPools,
  pairLendingPoolsWithTokens,
  LendingPoolWithTokens,
} from "@/lib/graphql/lendingpool-list.fetch";
// Note: Removed useCurrentChainId import as we now fetch from all chains

/**
 * Props for PoolsOverview component
 */
interface PoolsOverviewProps {
  onPoolClick?: (pool: LendingPoolWithTokens) => void;
}

/**
 * PoolsOverview component for displaying and managing lending pools
 *
 * @param props - Component props
 * @returns JSX element
 */
export const PoolsOverview = memo(function PoolsOverview({ onPoolClick }: PoolsOverviewProps = {}) {
  const [pools, setPools] = useState<LendingPoolWithTokens[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPool, setSelectedPool] =
    useState<LendingPoolWithTokens | null>(null);
  const [isPoolDialogOpen, setIsPoolDialogOpen] = useState(false);
  // Note: We now fetch pools from all chains, not just the current chain

  // Reset internal dialog state when external onPoolClick is provided
  useEffect(() => {
    if (onPoolClick) {
      setIsPoolDialogOpen(false);
      setSelectedPool(null);
    }
  }, [onPoolClick]);

  /**
   * Handle pool click for mobile cards
   */
  const handlePoolClickInternal = useCallback((pool: LendingPoolWithTokens) => {
    if (onPoolClick) {
      // Use external handler if provided (e.g., from home page with wallet guard)
      onPoolClick(pool);
    } else {
      // Fallback to internal dialog - but this should not be used when onPoolClick is provided
      setSelectedPool(pool);
      setIsPoolDialogOpen(true);
    }
  }, [onPoolClick]);

  /**
   * Handle pool dialog close
   */
  const handlePoolDialogClose = useCallback(() => {
    setIsPoolDialogOpen(false);
    setSelectedPool(null);
  }, []);



  // Fetch pools data
  useEffect(() => {
    const loadPools = async () => {
      try {
        setLoading(true);
        setError(null);
        const rawPools = await fetchLendingPools();
        // Fetch pools from all chains, not just current chain
        const poolsWithTokens = pairLendingPoolsWithTokens(rawPools);
        // Filter out pools with missing token info
        const validPools = poolsWithTokens.filter(
          (pool) => pool.borrowTokenInfo && pool.collateralTokenInfo
        );
        
        setPools(validPools);
      } catch {
        setError("Failed to load pools data");
        setPools([]); // Ensure pools is set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadPools();
  }, []); // Remove currentChainId dependency to fetch from all chains

  // Filtered pools based on search
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

  // Handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handlePoolCreated = useCallback(() => {
    // Reload pools data when a new pool is created
    const loadPools = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const rawPools = await fetchLendingPools();
        // Fetch pools from all chains, not just current chain
        const poolsWithTokens = pairLendingPoolsWithTokens(rawPools);
        // Filter out pools with missing token info
        const validPools = poolsWithTokens.filter(
          (pool) => pool.borrowTokenInfo && pool.collateralTokenInfo
        );
        setPools(validPools);
      } catch {
        setError("Failed to reload pools data");
        setPools([]); // Ensure pools is set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadPools();
  }, []); // Remove currentChainId dependency to fetch from all chains

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Card className="p-6 border-0 shadow-2xl bg-white/95 backdrop-blur-sm ring-1 ring-white/20 hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-red-100/30 pointer-events-none rounded-lg"></div>
          <div className="relative z-10 text-center text-red-600">
            <p>{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Please check your internet connection and try again.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // No filtered results
  if (filteredPools.length === 0 && searchQuery) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="relative">
          <PoolSearchControls
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            totalPools={pools.length}
            filteredPools={filteredPools.length}
            onPoolCreated={handlePoolCreated}
          />

          <BearyNotFound
            searchQuery={searchQuery}
            title="No Pools Found"
            description={`No lending pools found matching "${searchQuery}". Try searching with different keywords.`}
            onRetry={() => setSearchQuery("")}
            onClearSearch={handleClearSearch}
            showRetry={false}
            showClearSearch={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="relative">
        <PoolSearchControls
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          totalPools={pools.length}
          filteredPools={filteredPools.length}
          onPoolCreated={handlePoolCreated}
        />

        <ResponsivePoolsTable
          pools={filteredPools}
          loading={loading}
          onPoolClick={handlePoolClickInternal}
        />
      </div>

      {/* Pool Actions Dialog - only show if no external onPoolClick handler is provided */}
      {!onPoolClick && isPoolDialogOpen && (
        <PoolActionsDialog
          isOpen={isPoolDialogOpen}
          onClose={handlePoolDialogClose}
          pool={selectedPool}
        />
      )}


    </div>
  );
});
