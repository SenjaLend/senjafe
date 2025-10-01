"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  fetchLendingPools,
  pairLendingPoolsWithTokens,
  LendingPoolWithTokens,
} from "@/lib/graphql/lendingpool-list.fetch";
// Note: Removed useCurrentChainId import as we now fetch from all chains
import { BearyNotFound } from "@/components/search/beary-not-found";
import Image from "next/image";

interface PoolSelectorProps {
  selectedPool: LendingPoolWithTokens | null;
  onPoolSelect: (pool: LendingPoolWithTokens) => void;
}

// Removed hardcoded chain ID - now using dynamic chain system

// Memoized helper functions
const formatLTV = (ltv: string): string => {
  return ltv ? ((parseInt(ltv) / 1e18) * 100).toFixed(2) + "%" : "N/A";
};

const getPoolDisplayName = (pool: LendingPoolWithTokens): string => {
  const borrowSymbol = pool.borrowTokenInfo?.symbol || "Unknown";
  const collateralSymbol = pool.collateralTokenInfo?.symbol || "Unknown";
  return `${collateralSymbol} → ${borrowSymbol}`;
};

// Memoized pool item component
const PoolItem = memo(
  ({
    pool,
    isSelected,
    onSelect,
  }: {
    pool: LendingPoolWithTokens;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <Button
      key={pool.id}
      onClick={onSelect}
      className="w-full px-4 py-6 text-left hover:bg-[var(--electric-blue)]/10 hover:backdrop-blur-sm transition-all duration-200 flex items-center justify-between group rounded-xl border border-[var(--electric-blue)]/20 hover:border-[var(--electric-blue)]/40 bg-[#004488]/20"
    >
      <div className="flex items-center gap-4">
        <div className="flex space-x-2">
          {pool.collateralTokenInfo && (
            <div className="relative">
              <Image
                src={pool.collateralTokenInfo.logo}
                alt={pool.collateralTokenInfo.name}
                width={32}
                height={32}
                className="rounded-full border-2 border-[var(--electric-blue)]/30 shadow-md group-hover:shadow-lg transition-shadow"
              />
            </div>
          )}
          {pool.borrowTokenInfo && (
            <div className="relative">
              <Image
                src={pool.borrowTokenInfo.logo}
                alt={pool.borrowTokenInfo.name}
                width={32}
                height={32}
                className="rounded-full border-2 border-[var(--electric-blue)]/30 shadow-md group-hover:shadow-lg transition-shadow"
              />
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-white group-hover:text-[var(--neon-green)] transition-colors">
            {getPoolDisplayName(pool)}
          </div>
          <div className="text-xs text-[var(--electric-blue)] font-medium">
            LTV: {formatLTV(pool.ltv)}
          </div>
        </div>
      </div>
      {isSelected && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </Button>
  )
);

PoolItem.displayName = "PoolItem";

export const PoolSelector = memo(function PoolSelector({
  selectedPool,
  onPoolSelect,
}: PoolSelectorProps) {
  const [pools, setPools] = useState<LendingPoolWithTokens[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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

      // Set first pool as default if no pool is selected
      if (validPools.length > 0 && !selectedPool) {
        onPoolSelect(validPools[0]);
      }
    } catch {
      // Silent error handling for production
      setPools([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPool, onPoolSelect]); // Remove currentChainId dependency

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
  const handleCloseDialog = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
  }, []);

  const handlePoolSelect = useCallback(
    (pool: LendingPoolWithTokens) => {
      onPoolSelect(pool);
      handleCloseDialog();
    },
    [onPoolSelect, handleCloseDialog]
  );

  const handleSearchChange = useCallback(
     
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-1 h-auto bg-[var(--electric-blue)]/10 backdrop-blur-sm border-2 border-[var(--electric-blue)]/30 hover:border-[var(--electric-blue)]/50 hover:bg-[var(--electric-blue)]/20 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
      >
        {selectedPool ? (
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {selectedPool.collateralTokenInfo && (
                <div className="relative">
                  <Image
                    src={selectedPool.collateralTokenInfo.logo}
                    alt={selectedPool.collateralTokenInfo.name}
                    width={24}
                    height={24}
                    className="rounded-full border-2 border-[var(--electric-blue)]/30 shadow-sm"
                  />
                </div>
              )}
              {selectedPool.borrowTokenInfo && (
                <div className="relative">
                  <Image
                    src={selectedPool.borrowTokenInfo.logo}
                    alt={selectedPool.borrowTokenInfo.name}
                    width={24}
                    height={24}
                    className="rounded-full border-2 border-[var(--electric-blue)]/30 shadow-sm"
                  />
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">
                {getPoolDisplayName(selectedPool)}
              </div>
              <div className="text-xs text-[var(--electric-blue)] font-medium">
                LTV: {formatLTV(selectedPool.ltv)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-sm font-medium text-white">
              Select Pool
            </span>
          </div>
        )}
        <ChevronDown
          className={`h-4 w-4 text-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-[var(--electric-blue)]/10 backdrop-blur-xl border-2 border-[var(--electric-blue)]/30 shadow-2xl rounded-2xl max-w-md w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              Select Lending Pool
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
            <Input
              type="text"
              placeholder="Search pools by token name or symbol..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 bg-[#004488]/50 border border-[var(--electric-blue)]/30 rounded-xl focus:border-[var(--electric-blue)] focus:ring-2 focus:ring-[var(--electric-blue)]/50 text-white placeholder-gray-300"
            />
            {searchQuery && (
              <Button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Pools List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center gap-2 text-gray-300">
                  <div className="w-4 h-4 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
                  Loading pools...
                </div>
              </div>
            ) : filteredPools.length === 0 ? (
              <BearyNotFound
                searchQuery={searchQuery}
                title={searchQuery ? "No Pools Found" : "No Pools Available"}
                description={searchQuery 
                  ? `No lending pools found matching "${searchQuery}". Try searching with different keywords.`
                  : "No lending pools are available on this network. Switch to a different network to see available pools."
                }
                onRetry={() => setSearchQuery("")}
                onClearSearch={handleClearSearch}
                showRetry={!searchQuery}
                showClearSearch={!!searchQuery}
              />
            ) : (
              <div className="space-y-2">
                {filteredPools.map((pool) => (
                  <PoolItem
                    key={pool.id}
                    pool={pool}
                    isSelected={selectedPool?.id === pool.id}
                    onSelect={() => handlePoolSelect(pool)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
