"use client";

import React, { useState } from "react";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Network, Check } from "lucide-react";
import { chains, chainData } from "@/lib/config";
import Image from "next/image";

interface NetworkSwitchButtonProps {
  className?: string;
  theme?: "default" | "senja" | "blue";
}

export const NetworkSwitchButton: React.FC<NetworkSwitchButtonProps> = ({
  className = "",
  theme = "default"
}) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);

  const getThemeClasses = () => {
    switch (theme) {
      case "senja":
        return {
          button: "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white",
          dropdown: "bg-white border border-gray-200 shadow-lg"
        };
      case "blue":
        return {
          button: "bg-blue-600 hover:bg-blue-700 text-white",
          dropdown: "bg-white border border-gray-200 shadow-lg"
        };
      default:
        return {
          button: "bg-gray-900 hover:bg-gray-800 text-white",
          dropdown: "bg-white border border-gray-200 shadow-lg"
        };
    }
  };

  const themeClasses = getThemeClasses();
  const currentChain = chains.find(chain => chain.id === chainId);
  const currentChainData = chainData[chainId as keyof typeof chainData];

  const handleSwitchChain = async (chainId: number) => {
    try {
      await switchChain({ chainId });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          className={`${themeClasses.button} ${className}`}
          disabled={isPending}
        >
          <div className="flex items-center space-x-2">
            {currentChainData?.logo ? (
              <Image
                src={currentChainData.logo}
                alt={`${currentChainData.displayName} logo`}
                width={20}
                height={20}
                className="w-5 h-5 rounded-full"
              />
            ) : (
              <Network className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {currentChainData?.displayName || currentChain?.name || "Unknown Network"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className={`w-72 sm:w-56 ${themeClasses.dropdown}`} 
        align="end"
        side="bottom"
        alignOffset={0}
        sideOffset={4}
      >
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-900">Switch Network</div>
          <div className="text-xs text-gray-500">Choose your preferred network</div>
        </div>

        <div className="py-1 max-h-60 overflow-y-auto">
          {chains.map((chain) => {
            const chainInfo = chainData[chain.id];
            return (
              <DropdownMenuItem
                key={chain.id}
                onClick={() => handleSwitchChain(chain.id)}
                className="flex items-center justify-between cursor-pointer min-h-[48px] px-3 py-2 hover:bg-gray-50 transition-colors"
                disabled={isPending}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                    {chainInfo?.logo ? (
                      <Image
                        src={chainInfo.logo}
                        alt={chainInfo.displayName}
                        width={28}
                        height={28}
                        className="w-7 h-7 sm:w-6 sm:h-6 object-contain"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {chain.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{chainInfo?.displayName || chain.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      Chain ID: {chain.id}
                    </div>
                  </div>
                </div>
                {chain.id === chainId && (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />
        
        <div className="px-3 py-2">
          <div className="text-xs text-gray-500">
            Current: {currentChainData?.displayName || currentChain?.name || "Unknown"} • ID: {chainId}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NetworkSwitchButton;
