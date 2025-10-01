"use client";

import React, { useState, useCallback, memo } from "react";
import { Search, X } from "lucide-react";
import { tokens } from "@/lib/addresses/tokenAddress";
import { Token } from "@/types";
import Image from "next/image";
import { useReadUserCollateralBalance } from "@/hooks/read/useReadUserCollateralBalance";
import { useCurrentChainId } from "@/lib/chain";
import { BearyNotFound } from "@/components/search/beary-not-found";

// Component to display token balance
const TokenBalance = memo(function TokenBalance({ 
  token, 
  poolAddress,
}: { 
  token: Token; 
  poolAddress?: string;
  isCollateralBalance?: boolean;
}) {
  const currentChainId = useCurrentChainId();
  const [showLoading, setShowLoading] = React.useState(false);
  
  // Always use collateral balance from position for both "from" and "to" tokens
  const { parsedUserCollateralBalance, userCollateralBalanceLoading } = useReadUserCollateralBalance(
    poolAddress as `0x${string}` || "0x0000000000000000000000000000000000000000",
    token.addresses[currentChainId] as `0x${string}` || "0x0000000000000000000000000000000000000000",
    token.decimals
  );

  const balance = parsedUserCollateralBalance;
  const isLoading = userCollateralBalanceLoading;

  // Add delay before showing loading state
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 2000); // Show loading after 2 seconds

      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading]);

  if (isLoading && showLoading) {
    return (
      <div className="text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="w-4 h-4 border-2 border-[var(--electric-blue)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-white">Loading...</span>
        </div>
        <div className="text-xs text-gray-200">{token.symbol}</div>
      </div>
    );
  }

  return (
    <div className="text-right">
      <div className="text-sm text-white">
        {balance?.toFixed(5) || "0.00000"}
      </div>
      <div className="text-xs text-gray-200">{token.symbol}</div>
    </div>
  );
});

interface TokenSearchProps {
  onTokenSelect: (token: Token) => void;
  otherToken?: Token;
  showPopularTokens?: boolean;
  className?: string;
  selectedPoolAddress?: string;
  showBalance?: boolean;
  isCollateralBalance?: boolean;
}

export const TokenSearch = memo(function TokenSearch({
  onTokenSelect,
  otherToken,
  showPopularTokens = true,
  className = "",
  selectedPoolAddress,
  showBalance = false,
  isCollateralBalance = false,
}: TokenSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const availableTokens = tokens.filter(
    (token) => {
      // Filter out native tokens for cross-chain
      if (token.symbol === "GLMR" || token.symbol === "WGLMR") {
        return false;
      }
      
      // Filter out the other token if it exists
      if (otherToken && token.symbol === otherToken.symbol) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return token.symbol.toLowerCase().includes(query) ||
               token.name.toLowerCase().includes(query);
      }
      
      return true;
    }
  );

  const handleTokenSelect = useCallback((token: Token) => {
    onTokenSelect(token);
    setSearchQuery("");
  }, [onTokenSelect]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const popularTokens = ["WETH", "USDC", "USDT", "WBTC"];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-all duration-200 z-10 ${
            searchQuery ? "text-[var(--neon-green)] scale-110" : "text-white/60"
          }`}
        />
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-10 pr-10 border-2 border-[var(--electric-blue)]/30 rounded-xl focus:border-[var(--electric-blue)] focus:ring-2 focus:ring-[var(--electric-blue)]/30 focus:outline-none bg-[#2563eb]/20 backdrop-blur-sm text-white placeholder-white/50 transition-all duration-200"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 hover:text-[var(--neon-green)] transition-colors duration-200 z-20"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Popular Tokens */}
      {showPopularTokens && searchQuery === "" && (
        <div>
          <h3 className="text-sm font-medium text-white/90 mb-3">
            Popular tokens
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularTokens.map((symbol) => {
              const token = tokens.find((t) => t.symbol === symbol);
              // Filter out the other token if it exists
              if (!token || (otherToken && token.symbol === otherToken.symbol)) {
                return null;
              }

              return (
              <button
                type="button"
                key={symbol}
                onClick={() => handleTokenSelect(token)}
                className="h-8 px-3 bg-[#004488]/60 hover:bg-[var(--electric-blue)]/40 border border-[var(--electric-blue)]/20 hover:border-[var(--electric-blue)] hover:shadow-md hover:shadow-[var(--electric-blue)]/20 hover:scale-105 transition-all duration-300 group rounded-lg backdrop-blur-sm"
              >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full overflow-hidden">
                      <Image
                        src={token.logo}
                        alt={token.name}
                        width={16}
                        height={16}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget
                             
                            .nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.classList.remove("hidden");
                            fallback.classList.add("flex");
                          }
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] items-center justify-center text-white text-xs font-semibold hidden">
                        {token.symbol.charAt(0)}
                      </div>
                    </div>
                    <span className="text-xs text-white group-hover:text-[var(--neon-green)] transition-colors duration-300">
                      {symbol}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Token List */}
      <div className="flex-1 overflow-y-auto max-h-96">
        <div className="space-y-1">
          {availableTokens.length === 0 ? (
            <BearyNotFound
              searchQuery={searchQuery}
              title="No Tokens Found"
              description={searchQuery 
                ? `No tokens found matching "${searchQuery}". Try searching with different keywords.`
                : "No tokens are available. Try refreshing or switching networks."
              }
              onRetry={() => setSearchQuery("")}
              onClearSearch={handleClearSearch}
              showRetry={!searchQuery}
              showClearSearch={!!searchQuery}
            />
          ) : (
            availableTokens.map((token) => (
              <button
                type="button"
                key={token.symbol}
                onClick={() => handleTokenSelect(token)}
                className="w-full max-w-xl mx-auto flex items-center justify-between px-4 py-4 bg-[#004488]/40 hover:bg-[var(--electric-blue)]/20 hover:shadow-md hover:shadow-[var(--electric-blue)]/20 hover:scale-[1.02] rounded-lg transition-all duration-300 group border border-[var(--electric-blue)]/20 hover:border-[var(--electric-blue)]/50 backdrop-blur-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={token.logo}
                      alt={token.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget
                           
                          .nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.classList.remove("hidden");
                          fallback.classList.add("flex");
                        }
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] items-center justify-center text-white font-semibold hidden transition-all duration-300">
                      {token.symbol.charAt(0)}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white group-hover:text-[var(--neon-green)] transition-colors duration-300">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">
                      {token.name}
                    </div>
                  </div>
                </div>
                {showBalance && (
                  <TokenBalance 
                    token={token} 
                    poolAddress={isCollateralBalance ? selectedPoolAddress : undefined}
                    isCollateralBalance={isCollateralBalance}
                  />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
});
