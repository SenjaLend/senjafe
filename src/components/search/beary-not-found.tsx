"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface BearyNotFoundProps {
  /** Search query that was not found */
  searchQuery?: string;
  /** Custom title for the not found message */
  title?: string;
  /** Custom description for the not found message */
  description?: string;
  /** Callback when user clicks retry button */
  onRetry?: () => void;
  /** Callback when user clicks clear search button */
  onClearSearch?: () => void;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Whether to show clear search button */
  showClearSearch?: boolean;
  /** Custom className */
  className?: string;
}

export const BearyNotFound = ({
  searchQuery,
  title = "No Results Found",
  description,
  onRetry,
  onClearSearch,
  showRetry = true,
  showClearSearch = true,
  className = "",
}: BearyNotFoundProps) => {
  const defaultDescription = searchQuery 
    ? `No results found for "${searchQuery}". Try adjusting your search terms.`
    : "No results found. Try adjusting your search terms.";

  return (
    <Card className={`w-full max-w-xl mx-auto bg-gradient-to-b from-[#004488] to-[#003366] backdrop-blur-sm border-2 border-[var(--electric-blue)]/30 shadow-xl rounded-2xl overflow-hidden ${className}`}>
      <div className="p-8 text-center">
        {/* Beary Not Found Image */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 relative">
            <img
              src="/beary/beary-not-found.png"
              alt="Beary not found"
              className="w-full h-full object-contain animate-bounce drop-shadow-lg"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-3 drop-shadow-sm">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-200 text-sm leading-relaxed mb-6 max-w-md mx-auto">
          {description || defaultDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              className="w-full sm:w-auto bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] hover:from-[var(--electric-blue)]/90 hover:to-[var(--neon-green)]/90 focus:from-[var(--electric-blue)]/90 focus:to-[var(--neon-green)]/90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:shadow-xl border-0 focus:ring-2 focus:ring-[var(--electric-blue)]/50 focus:outline-none transition-all duration-300 transform hover:scale-105 focus:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </div>
            </Button>
          )}

          {showClearSearch && onClearSearch && (
            <Button
              onClick={onClearSearch}
              className="w-full sm:w-auto bg-[#004488]/60 hover:bg-[var(--electric-blue)]/30 focus:bg-[var(--electric-blue)]/30 border-2 border-[var(--electric-blue)]/40 hover:border-[var(--electric-blue)]/80 focus:border-[var(--electric-blue)]/80 text-white hover:text-white focus:text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:shadow-lg focus:ring-2 focus:ring-[var(--electric-blue)]/50 focus:outline-none transition-all duration-300 transform hover:scale-105 focus:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Clear Search</span>
              </div>
            </Button>
          )}
        </div>

      </div>
    </Card>
  );
};

BearyNotFound.displayName = 'BearyNotFound';
