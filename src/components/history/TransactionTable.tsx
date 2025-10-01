import { Transaction } from "./types";
import { TokenDisplay } from "./TokenDisplay";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import {
  formatTokenAmount,
  formatTimestamp,
  shortenAddress,
  getTokenByAddress,
} from "./utils";
import { ExternalLinkIcon } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  chainId?: number;
}

export function TransactionTable({
  transactions,
  loading = false,
  chainId = 1284,
}: TransactionTableProps) {
  
  // Function to get block explorer URL based on chain ID - all using Moonbeam explorer
  const getBlockExplorerUrl = (hash: string, chainId: number) => {
    // Always use Moonbeam explorer regardless of chain
    return `https://moonbeam.moonscan.io/tx/${hash}`;
  };

  return (
    <div className="w-full bg-[var(--electric-blue)]/10 backdrop-blur-sm rounded-2xl border border-[var(--electric-blue)]/20 overflow-hidden">
      {/* Mobile Cards - Always visible */}
      <div>
        {loading ? (
          // Mobile loading skeleton
          [...Array(3)].map((_, index) => (
            <div
              key={`mobile-loading-${index}`}
              className="p-3 sm:p-4 border-b border-gray-200/50 animate-pulse"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-4"></div>
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : transactions.length === 0 ? (
          // Mobile empty state
          <div className="p-6 sm:p-8 text-center">
            <div className="text-gray-300 text-lg mb-2">
              No transactions found
            </div>
            <div className="text-gray-400 text-sm">
              Your transaction history will appear here
            </div>
          </div>
        ) : (
          // Mobile data cards - filter out transactions with unknown tokens
          transactions
            .filter((transaction) => {
              const token = getTokenByAddress(transaction.asset, chainId);
              return token !== null; // Only show transactions with known tokens
            })
            .map((transaction) => {
              const token = getTokenByAddress(transaction.asset, chainId);
              // At this point, token is guaranteed to not be null due to filter above
              const formattedAmount = formatTokenAmount(
                transaction.amount,
                token!.decimals
              );

              return (
                <div
                  key={transaction.id}
                  className="p-3 sm:p-4 border-b border-[var(--electric-blue)]/20 last:border-b-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <TransactionTypeBadge type={transaction.type} />
                    <a
                      href={getBlockExplorerUrl(transaction.transactionHash, chainId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-white hover:underline"
                    >
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Asset:</span>
                      <div className="text-white">
                        <TokenDisplay
                          address={transaction.asset}
                          chainId={chainId}
                        />
                      </div>
                    </div>

                                        <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Amount:</span>
                      <div className="text-sm font-medium text-white">
                        {formattedAmount} {token!.symbol}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Pool:</span>
                      <div className="text-sm text-white">
                        Pool #{transaction.pool}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Time:</span>
                      <div className="text-sm text-white">
                        {formatTimestamp(transaction.timestamp)}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Block:</span>
                      <div className="text-xs text-gray-400">
                        {shortenAddress(String(transaction.blockNumber))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
