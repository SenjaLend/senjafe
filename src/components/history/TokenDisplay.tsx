import Image from "next/image";
import { getTokenByAddress } from "./utils";

interface TokenDisplayProps {
  address: string;
  chainId?: number;
  showAddress?: boolean;
}

export function TokenDisplay({ address, chainId = 1284, showAddress = false }: TokenDisplayProps) {
  const token = getTokenByAddress(address, chainId);

  if (!token) {
    // This should not happen since we filter out unknown tokens in TransactionTable
    // But provide a fallback just in case
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-500">?</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">Unknown Token</span>
          {showAddress && (
            <span className="text-xs text-gray-400">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 relative">
        <Image
          src={token.logo}
          alt={token.symbol}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{token.symbol}</span>
        {showAddress && (
          <span className="text-xs text-gray-400">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        )}
      </div>
    </div>
  );
}