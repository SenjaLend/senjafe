import { RefreshCwIcon, AlertCircleIcon } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
      <div className="flex items-center justify-center mb-4">
        <RefreshCwIcon className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <div className="text-gray-600 text-lg mb-2">{message}</div>
      <div className="text-gray-400 text-sm">Please wait while we fetch your data</div>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
      <div className="flex items-center justify-center mb-4">
        <AlertCircleIcon className="w-8 h-8 text-red-600" />
      </div>
      <div className="text-red-600 text-lg mb-2">Error Loading Transactions</div>
      <div className="text-gray-600 text-sm mb-4">{error}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  userConnected?: boolean;
}

export function EmptyState({ userConnected = false }: EmptyStateProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
      <div className="text-gray-500 text-lg mb-2">
        {userConnected ? "No transactions found" : "Connect wallet to view transactions"}
      </div>
      <div className="text-gray-400 text-sm">
        {userConnected 
          ? "Your transaction history will appear here once you start using the protocol"
          : "Connect your wallet to view your transaction history"
        }
      </div>
    </div>
  );
}