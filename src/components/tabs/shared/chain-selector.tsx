"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chains } from "@/lib/addresses/chainAddress";
import Image from "next/image";

interface ChainSelectorProps {
  chainFrom: string;
  chainTo: string;
  onChainToChange: (value: string) => void;
  disabled?: boolean;
}

export const ChainSelector = ({
  chainFrom,
  chainTo,
  onChainToChange,
  disabled = false,
}: ChainSelectorProps) => {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col w-1/2">
        <label className="text-sm font-medium text-white mb-2">From</label>
        <Select value={chainFrom} onValueChange={() => {}} disabled>
          <SelectTrigger className="bg-black/30 backdrop-blur-sm border-2 border-[var(--electric-blue)]/30 cursor-not-allowed rounded-lg shadow-md h-12 w-full text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {chains.map((chain) => (
              <SelectItem key={chain.id} value={chain.id.toString()}>
                <div className="flex items-center space-x-2">
                  <Image
                    src={chain.logo}
                    alt={chain.name}
                    className="rounded-full"
                    width={20}
                    height={20}
                  />
                  <span>{chain.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col w-1/2">
        <label className="block text-sm font-medium text-white mb-2">
          To
        </label>
        <Select
          value={chainTo}
          onValueChange={onChainToChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-black/30 backdrop-blur-sm border-2 border-[var(--electric-blue)]/30 focus:border-[var(--electric-blue)] focus:ring-4 focus:ring-[var(--electric-blue)]/20 transition-all duration-300 rounded-lg shadow-md h-12 w-full text-white">
            <SelectValue placeholder="Choose destination chain" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 backdrop-blur-sm border border-[var(--electric-blue)]/30">
            {chains.map((chain) => (
              <SelectItem
                key={chain.id}
                value={chain.id.toString()}
                className={`hover:bg-[var(--electric-blue)]/20 text-white ${
                  chain.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={chain.disabled}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={chain.logo}
                      alt={chain.name}
                      className="rounded-full"
                      width={20}
                      height={20}
                    />
                    <span className={chain.disabled ? 'text-gray-400' : ''}>{chain.name}</span>
                  </div>
                  {chain.comingSoon && (
                    <span className="text-xs bg-[var(--electric-blue)]/20 text-[var(--neon-green)] px-2 py-1 rounded-full font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
