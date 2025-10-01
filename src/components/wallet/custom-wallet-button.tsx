"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Copy, Wallet as WalletIcon, LogOut, ExternalLink } from "lucide-react";
import { formatEther } from "viem";
import { WalletConnectDialog } from "./wallet-connect-dialog";

interface CustomWalletButtonProps {
  className?: string;
  connectButtonText?: string;
  showBalance?: boolean;
  showAddress?: boolean;
  theme?: "default" | "senja" | "blue";
}

export const CustomWalletButton: React.FC<CustomWalletButtonProps> = ({
  className = "",
  connectButtonText = "Connect Wallet",
  showBalance = true,
  showAddress = true,
  theme = "default"
}) => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case "senja":
        return {
          connect: "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white",
          connected: "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white",
          dropdown: "bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)]/20 shadow-2xl"
        };
      case "blue":
        return {
          connect: "bg-blue-600 hover:bg-blue-700 text-white",
          connected: "bg-blue-600 hover:bg-blue-700 text-white",
          dropdown: "bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)]/20 shadow-2xl"
        };
      default:
        return {
          connect: "bg-gray-900 hover:bg-gray-800 text-white",
          connected: "bg-gray-900 hover:bg-gray-800 text-white",
          dropdown: "bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)]/20 shadow-2xl"
        };
    }
  };

  const themeClasses = getThemeClasses();

  if (!isConnected) {
    return (
      <WalletConnectDialog
        className={className}
        connectButtonText={connectButtonText}
        theme={theme}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={`${themeClasses.connected} ${className}`}>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <Image
                src="/beary/user-profil.png"
                alt="User Profile"
                width={24}
                height={24}
                className="w-full h-full object-cover"
                style={{
                  filter: 'drop-shadow(0 0 0 2px rgba(255,255,255,0.8)) drop-shadow(0 0 0 3px rgba(255,255,255,0.4))'
                }}
              />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">
                {showAddress && address ? formatAddress(address) : "Connected"}
              </div>
              {showBalance && balance && (
                <div className="text-xs opacity-90">
                  {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
                </div>
              )}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className={`w-64 ${themeClasses.dropdown}`} align="end">
        {/* Wallet Info */}
        <div className="px-3 py-2 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/beary/user-profil.png"
                alt="User Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover drop-shadow-[0_0_0_2px_rgba(251,146,60,0.4)]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {showAddress && address ? formatAddress(address) : "Connected"}
              </div>
              <div className="text-xs text-white/70">
                {chain?.name || "Unknown Network"}
              </div>
            </div>
          </div>
        </div>

        {/* Balance */}
        {showBalance && balance && (
          <div className="px-3 py-2 border-b border-white/20">
            <div className="text-sm text-white/70">Balance</div>
            <div className="text-lg font-semibold text-white">
              {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="py-1">
          {showAddress && address && (
            <DropdownMenuItem
              onClick={() => copyToClipboard(address)}
              className="flex items-center space-x-2 cursor-pointer !text-white hover:!text-white hover:!bg-[var(--electric-blue)]/30 focus:!text-white focus:!bg-[var(--electric-blue)]/30"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? "Copied!" : "Copy Address"}</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem
            onClick={() => window.open("https://moonbeam.moonscan.io/address/" + address, "_blank")}
            className="flex items-center space-x-2 cursor-pointer !text-white hover:!text-white hover:!bg-[var(--electric-blue)]/30 focus:!text-white focus:!bg-[var(--electric-blue)]/30"
          >
            <ExternalLink className="w-4 h-4 text-white" />
            <span>View on Explorer</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-white/20" />
          
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="flex items-center space-x-2 cursor-pointer !text-red-400 hover:!text-red-400 hover:!bg-red-400/20 focus:!text-red-400 focus:!bg-red-400/20"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomWalletButton;
