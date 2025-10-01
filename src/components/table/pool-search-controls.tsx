"use client";

import React, { useCallback, memo, useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreatePoolDialog } from "@/components/dialog/create-pool";
import { BaseComponentProps } from "@/types";

/**
 * Props for the PoolSearchControls component
 */
interface PoolSearchControlsProps extends BaseComponentProps {
  /** Current search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Callback to clear the search */
  onClearSearch: () => void;
  /** Total number of pools */
  totalPools: number;
  /** Number of filtered pools */
  filteredPools: number;
  /** Callback when a new pool is created */
  onPoolCreated?: () => void;
  /** Whether to show the create pool button */
  showCreateButton?: boolean;
  /** Custom placeholder text for search input */
  searchPlaceholder?: string;
}

/**
 * PoolSearchControls component for searching and filtering pools
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const PoolSearchControls = memo(function PoolSearchControls({
  searchQuery,
  onSearchChange,
  onClearSearch,
  totalPools,
  filteredPools,
  onPoolCreated,
  showCreateButton = true,
  searchPlaceholder = "Search pools by token name or symbol...",
  className,
}: PoolSearchControlsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  /**
   * Handle search input changes
   */
  const handleSearchChange = useCallback(
     
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  /**
   * Handle successful pool creation
   */
  const handleCreateSuccess = useCallback(() => {
    onPoolCreated?.();
    setIsCreateDialogOpen(false);
  }, [onPoolCreated]);

  /**
   * Handle opening create pool dialog
   */
  const handleOpenCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  /**
   * Handle closing create pool dialog
   */
  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
  }, []);

  return (
    <>
      <div className={`py-2 mt-2 ${className || ''}`}>
        <div 
          className="w-full max-w-xl mx-auto bg-[var(--electric-blue)]/10 backdrop-blur-xl ring-1 ring-[var(--electric-blue)]/30 hover:shadow-2xl hover:ring-[var(--electric-blue)]/50 transition-all duration-500 group relative z-10"
          style={{ borderRadius: '0.75rem', overflow: 'hidden' }}
        >
          <div className="relative z-10 p-3 sm:p-4">
            {/* Mobile Layout */}
            <div className="lg:hidden space-y-3">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-white/60" />
                </div>
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10 py-2.5 border border-[var(--electric-blue)]/30 rounded-xl focus:border-[var(--electric-blue)] focus:ring-2 focus:ring-[var(--electric-blue)]/20 transition-all duration-300 text-sm bg-white/10 backdrop-blur-sm hover:bg-white/20 group-hover:shadow-lg text-white placeholder:text-white/60"
                />
                {searchQuery && (
                  <Button
                    onClick={onClearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white rounded-md transition-all duration-200"
                    size="sm"
                    variant="ghost"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Results Summary and Create Button Row */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-white/80">
                  <span className="font-medium text-white">{filteredPools}</span>{" "}
                  of <span className="font-medium text-white">{totalPools}</span>{" "}
                  pools
                </div>
                
                {showCreateButton && (
                  <Button
                    onClick={handleOpenCreateDialog}
                    className="flex items-center gap-1.5 bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-1.5 text-sm font-semibold"
                    aria-label="Create new pool"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Create Pool</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block space-y-3">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-white/60" />
                </div>
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10 py-2.5 border border-[var(--electric-blue)]/30 rounded-xl focus:border-[var(--electric-blue)] focus:ring-2 focus:ring-[var(--electric-blue)]/20 transition-all duration-300 text-sm bg-white/10 backdrop-blur-sm hover:bg-white/20 group-hover:shadow-lg text-white placeholder:text-white/60"
                />
                {searchQuery && (
                  <Button
                    onClick={onClearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white rounded-md transition-all duration-200"
                    size="sm"
                    variant="ghost"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Results Summary and Create Button Row */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-white/80">
                  <span className="font-medium text-white">{filteredPools}</span>{" "}
                  of <span className="font-medium text-white">{totalPools}</span>{" "}
                  pools
                </div>
                
                {showCreateButton && (
                  <Button
                    onClick={handleOpenCreateDialog}
                    className="flex items-center gap-1.5 bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-1.5 text-sm font-semibold"
                    aria-label="Create new pool"
                  >
                    <Plus className="h-4 w-4" />
                    Create Pool
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Pool Dialog */}
      <CreatePoolDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
});