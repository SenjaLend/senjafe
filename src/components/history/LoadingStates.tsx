import { RefreshCwIcon, AlertCircleIcon } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="card-dark-mid-blue relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[var(--electric-blue)]/20 to-[var(--soft-teal)]/20 rounded-full -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[var(--soft-teal)]/20 to-[var(--deep-mid-blue)]/20 rounded-full translate-y-8 -translate-x-8"></div>
      
      <div className="p-8 text-center relative z-10">
        <div className="flex items-center justify-center mb-4">
          <RefreshCwIcon className="w-8 h-8 text-[var(--electric-blue)] animate-spin" />
        </div>
        <div className="text-white text-lg mb-2">{message}</div>
        <div className="text-gray-300 text-sm">Please wait while we fetch your data</div>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="card-dark-mid-blue relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-800/20 to-blue-600/20 rounded-full -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-600/20 to-blue-800/20 rounded-full translate-y-8 -translate-x-8"></div>
      
      <div className="p-8 text-center relative z-10">
        <div className="flex items-center justify-center mb-4">
          <AlertCircleIcon className="w-8 h-8 text-blue-400" />
        </div>
        <div className="text-blue-300 text-lg mb-2">Error Loading Transactions</div>
        <div className="text-gray-300 text-sm mb-4">{error}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--soft-teal)] hover:from-[var(--electric-blue)]/90 hover:to-[var(--soft-teal)]/90 text-white rounded-lg transition-all duration-300 font-semibold"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  userConnected?: boolean;
}

export function EmptyState({ userConnected = false }: EmptyStateProps) {
  return (
    <div className="card-dark-mid-blue relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[var(--electric-blue)]/20 to-[var(--soft-teal)]/20 rounded-full -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[var(--soft-teal)]/20 to-[var(--deep-mid-blue)]/20 rounded-full translate-y-8 -translate-x-8"></div>
      
      <div className="p-8 text-center relative z-10">
        <div className="text-gray-300 text-lg mb-2">
          {userConnected ? "No transactions found" : "Connect wallet to view transactions"}
        </div>
        <div className="text-gray-400 text-sm">
          {userConnected 
            ? "Your transaction history will appear here once you start using the protocol"
            : "Connect your wallet to view your transaction history"
          }
        </div>
      </div>
    </div>
  );
}