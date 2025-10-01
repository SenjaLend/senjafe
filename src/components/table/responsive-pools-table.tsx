"use client";

import React, { memo } from "react";
import { Card } from "@/components/ui/card";
import { MobilePoolCard } from "./mobile-pool-card";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { Spinner } from "@/components/ui/spinner";

/**
 * Props for the ResponsivePoolsTable component
 */
interface ResponsivePoolsTableProps {
  /** Array of pools to display */
  pools: LendingPoolWithTokens[];
  /** Whether data is loading */
  loading?: boolean;
  /** Callback when a pool is clicked */
  onPoolClick?: (pool: LendingPoolWithTokens) => void;
}

/**
 * ResponsivePoolsTable component that shows desktop table on large screens
 * and mobile cards on small screens
 *
 * @param props - Component props
 * @returns JSX element
 */
export const ResponsivePoolsTable = memo(function ResponsivePoolsTable({
  pools,
  loading = false,
  onPoolClick,
}: ResponsivePoolsTableProps) {
  // Loading state
  if (loading) {
    return (
      <Card className="w-full max-w-xl mx-auto overflow-hidden border-0 bg-[var(--electric-blue)]/10 backdrop-blur-xl ring-1 ring-[var(--electric-blue)]/30 hover:shadow-2xl hover:ring-[var(--electric-blue)]/50 transition-all duration-500">
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center justify-center">
            <Spinner size="lg" className="mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              Loading Pools
            </h4>
            <p className="text-white/70 text-center">
              Fetching the latest lending pool data...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (pools.length === 0) {
    return (
      <Card className="w-full max-w-xl mx-auto overflow-hidden border-0 bg-[var(--electric-blue)]/10 backdrop-blur-xl ring-1 ring-[var(--electric-blue)]/30 hover:shadow-2xl hover:ring-[var(--electric-blue)]/50 transition-all duration-500">
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[var(--electric-blue)]/20 flex items-center justify-center mb-6">
              <div className="w-8 h-8 bg-[var(--electric-blue)]/50 rounded"></div>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">
              No Pools Available
            </h4>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Card View - Show on all screen sizes */}
      <div className="space-y-3 sm:space-y-4 mt-2">
        {pools.map((pool) => (
          <MobilePoolCard
            key={pool.id}
            pool={pool}
            onClick={onPoolClick}
            clickable={!!onPoolClick}
          />
        ))}
      </div>
    </>
  );
});

ResponsivePoolsTable.displayName = "ResponsivePoolsTable";
