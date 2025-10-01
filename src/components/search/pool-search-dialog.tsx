"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchLendingPools,
  pairLendingPoolsWithTokens,
  LendingPoolWithTokens,
} from "@/lib/graphql/lendingpool-list.fetch";
// Note: Removed useCurrentChainId import as we now fetch from all chains
import Image from "next/image";
import { PoolSearch, getPoolDisplayName, formatLTV } from "./pool-search";

interface PoolSearchDialogProps {
  selectedPool: LendingPoolWithTokens | null;
  onPoolSelect: (pool: LendingPoolWithTokens) => void;
  triggerText?: string;
  triggerClassName?: string;
  dialogTitle?: string;
}

export const PoolSearchDialog = memo(function PoolSearchDialog({
  selectedPool,
  onPoolSelect,
  triggerText = "Select Pool",
  triggerClassName = "",
  dialogTitle = "Select Lending Pool",
}: PoolSearchDialogProps) {
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
    (query: string) => {
      setSearchQuery(query);
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
        className={`flex items-center gap-3 px-4 py-1 h-auto bg-[#004488] border-2 border-[var(--electric-blue)]/30 hover:border-[var(--electric-blue)]/50 hover:bg-[var(--electric-blue)]/20 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl ${triggerClassName}`}
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
                    className="rounded-full border-2 border-white shadow-sm"
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
                    className="rounded-full border-2 border-white shadow-sm"
                  />
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">
                {getPoolDisplayName(selectedPool)}
              </div>
              <div className="text-xs text-[var(--neon-green)] font-medium">
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
              {triggerText}
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
        <DialogContent className="bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)] shadow-2xl rounded-2xl max-w-xl w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                {dialogTitle}
              </DialogTitle>
              <Button
                onClick={handleCloseDialog}
                className="p-1 hover:bg-[var(--electric-blue)]/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white/70 hover:text-white" />
              </Button>
            </div>
          </DialogHeader>

          <PoolSearch
            selectedPool={selectedPool}
            onPoolSelect={handlePoolSelect}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            loading={loading}
            filteredPools={filteredPools}
            showSearchInput={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
});
