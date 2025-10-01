"use client";

import { memo, useMemo, useState, useEffect } from "react";
import { TransactionTable } from "./TransactionTable";
import { TransactionFilter } from "./TransactionFilter";
import { useTransactions } from "./api";
import { useWagmiWallet } from "@/hooks/useWagmiWallet";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTokenByAddress } from "./utils";
import Image from "next/image";
import Link from "next/link";

const PAGE_SIZE = 8;

const HistoryClient = memo(function HistoryClient() {
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(0);

  const { isConnected, account } = useWagmiWallet();
  const { transactions, loading, error } = useTransactions(
    isConnected && account ? account : undefined
  );

  const filteredTransactions = useMemo(() => {
    // First filter by transaction type
    let filtered =
      selectedType === "all"
        ? transactions
        : transactions.filter((tx) => tx.type === selectedType);

    // Then filter out transactions with unknown token addresses
    filtered = filtered.filter((tx) => {
      const token = getTokenByAddress(tx.asset, 1284); // Use Moonbeam chain ID
      return token !== null;
    });

    return filtered;
  }, [transactions, selectedType]);

  // Reset page to 0 if filter changes or data changes
  // (to prevent being stuck on page > 0 when filter changes)
  useEffect(() => {
    setPage(0);
  }, [selectedType]);

  const pagedTransactions = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, page]);

  const hasNext = (page + 1) * PAGE_SIZE < filteredTransactions.length;
  const hasPrev = page > 0;

  return (
    <div className="min-h-screen w-full pb-20 pt-4 relative overflow-hidden bg-gradient-to-br from-senja-background via-senja-cream/30 to-senja-cream-light/40 flex justify-center">
      {/* Mobile-optimized container - same width as navbar */}
      <div className="w-full max-w-xl mx-auto px-3 sm:px-0">
        <div className="relative">
          <TransactionFilter
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />

          {!isConnected ? (
            <div className="w-full mx-auto">
              <div className="overflow-hidden border-0 bg-gradient-to-br from-orange-50/80 via-orange-100/60 to-pink-50/70 backdrop-blur-sm ring-1 ring-white/30 hover:shadow-2xl hover:ring-orange-200/50 transition-all duration-500 rounded-xl">
                <div className="p-8 md:p-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-6">
                      <Image
                        src="/beary/beary-wallet.png"
                        alt="Wallet Not Connected"
                        width={100}
                        height={100}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Wallet Not Connected
                    </h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      Please connect your wallet to view your transaction
                      history.
                    </p>
                    <Link
                      href="/profile"
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Connect Wallet
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <TransactionTable
                transactions={pagedTransactions}
                loading={loading}
              />
              <div className="flex justify-center gap-2 mt-6">
                <button
                  className="px-6 py-2 rounded-lg bg-[var(--electric-blue)]/20 backdrop-blur-sm border border-[var(--electric-blue)]/30 text-white hover:bg-[var(--electric-blue)]/30 hover:border-[var(--electric-blue)]/50 disabled:opacity-50 transition-all duration-300 font-semibold"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={loading || !hasPrev}
                >
                  <ChevronLeft />
                </button>
                <button
                  className="px-6 py-2 rounded-lg bg-[var(--electric-blue)]/20 backdrop-blur-sm border border-[var(--electric-blue)]/30 text-white hover:bg-[var(--electric-blue)]/30 hover:border-[var(--electric-blue)]/50 disabled:opacity-50 transition-all duration-300 font-semibold"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading || !hasNext}
                >
                  <ChevronRight />
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="w-full mx-auto mt-6">
              <div className="overflow-hidden border-0 bg-gradient-to-br from-red-50/80 via-red-100/60 to-pink-50/70 backdrop-blur-sm ring-1 ring-red-200/30 rounded-xl">
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-red-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export { HistoryClient };
