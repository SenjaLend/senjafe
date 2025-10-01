"use client";

import React, { useState } from "react";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Network, Check, Loader2 } from "lucide-react";
import { chains, chainData } from "@/lib/config";
import Image from "next/image";

interface NetworkSwitchDialogProps {
  className?: string;
  theme?: "default" | "senja" | "blue";
  showChainName?: boolean; // Untuk kontrol apakah menampilkan nama chain di button
}

export const NetworkSwitchDialog: React.FC<NetworkSwitchDialogProps> = ({
  className = "",
  theme = "default",
  showChainName = false,
}) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const getThemeClasses = () => {
    // Force Electric Blue theme for this dialog per design request
    return {
      button: "bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 hover:shadow-lg hover:scale-105 text-[var(--pure-white)] transition-all duration-200",
      dialog: "bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)]",
      title: "text-white",
      description: "text-white/90",
      spinner: "text-[var(--electric-blue)]",
      current: "border-[var(--neon-green)] bg-[var(--neon-green)]/20 ring-2 ring-[var(--neon-green)]/50",
      listBase: "bg-[#004488] text-white w-full border border-transparent",
      hover: "hover:bg-[var(--electric-blue)]/80 hover:shadow-xl hover:scale-[1.02] hover:border-[var(--electric-blue)]/50 hover:ring-2 hover:ring-[var(--electric-blue)]/30",
      itemText: "text-white",
      itemHoverText: "hover:text-[var(--neon-green)] transition-colors duration-200",
    } as const;
  };

  const themeClasses = getThemeClasses();
  const currentChain = chains.find((chain) => chain.id === chainId);
  const currentChainData = chainData[chainId as keyof typeof chainData];

  const handleSwitchChain = async (targetChainId: number) => {
    try {
      setSelectedChain(targetChainId);
      setIsSwitching(true);
      
      await switchChain({ chainId: targetChainId });
      
      // Close dialog after successful switch
      setTimeout(() => {
        setIsOpen(false);
        setSelectedChain(null);
        setIsSwitching(false);
      }, 500);
    } catch (error) {
      console.error("Failed to switch chain:", error);
      // Reset state on error
      setSelectedChain(null);
      setIsSwitching(false);
    }
  };

  // Reset loading state when dialog closes
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedChain(null);
      setIsSwitching(false);
    }
    setIsOpen(open);
  };

  if (!isConnected) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className={`${themeClasses.button} ${className}`}>
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
            {/* Show chain name on mobile or when showChainName is true */}
            <span className={`${showChainName ? 'inline' : 'hidden sm:inline'}`}>
              {currentChainData?.displayName || currentChain?.name || "Unknown Network"}
            </span>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`w-[90vw] max-w-[400px] mx-auto ${themeClasses.dialog} fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto p-4 border`}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center items-center mb-2">
            <Image
              src="/senja-logo.png"
              alt="Senja Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain mx-auto"
            />
          </div>
          <DialogTitle className={`text-lg font-bold text-center ${themeClasses.title}`}>
            {isSwitching ? "Switching Network..." : "Switch Network"}
          </DialogTitle>
          <DialogDescription className={`mt-1 text-center text-sm ${themeClasses.description}`}>
            {isSwitching
              ? `Switching to ${chains.find(c => c.id === selectedChain)?.name || 'selected network'}...`
              : "Choose your preferred network to switch to."}
          </DialogDescription>
          {isSwitching && (
            <div className="flex justify-center mt-4">
              <Loader2 className={`w-6 h-6 ${themeClasses.spinner} animate-spin`} />
            </div>
          )}
        </DialogHeader>

        <div className="grid gap-2 py-2 w-full">
          {chains.map((chain) => {
            const chainInfo = chainData[chain.id];
            const isSelected = selectedChain === chain.id;
            const isSwitchingThis = isSwitching && isSelected;
            const isCurrentChain = chain.id === chainId;

            return (
              <Button
                key={chain.id}
                variant="outline"
                onClick={() => handleSwitchChain(chain.id)}
                disabled={isSwitching || isCurrentChain}
                className={`group flex items-center justify-between h-12 px-3 ${themeClasses.listBase} ${themeClasses.hover} ${themeClasses.itemHoverText} transition-all duration-300 ease-out w-full ${
                  isCurrentChain ? themeClasses.current : ""
                } ${isSwitchingThis ? "opacity-75" : ""} ${!isCurrentChain && !isSwitching ? "hover:transform hover:translate-x-1" : ""}`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {isSwitchingThis ? (
                      <Loader2 className="w-4 h-4 text-[var(--electric-blue)] animate-spin" />
                    ) : chainInfo?.logo ? (
                      <Image
                        src={chainInfo.logo}
                        alt={chainInfo.displayName}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] flex items-center justify-center shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:scale-110">
                        <span className="text-sm font-bold text-white">
                          {chain.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate text-sm">
                      {isSwitchingThis ? "Switching..." : chainInfo?.displayName || chain.name}
                    </div>
                    <div className="text-xs text-white/70 truncate">
                      Chain ID: {chain.id}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {isCurrentChain && (
                    <Check className="w-4 h-4 text-[var(--neon-green)] transition-all duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_4px_var(--neon-green)]" />
                  )}
                  {isCurrentChain && (
                    <span className="text-xs text-[var(--neon-green)] font-bold transition-all duration-200 group-hover:drop-shadow-[0_0_4px_var(--neon-green)]">
                      Current
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {isSwitching && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedChain(null);
                setIsSwitching(false);
              }}
              className="text-white/80 hover:text-white hover:scale-105 border-white/30 hover:border-white/70 hover:shadow-lg transition-all duration-200"
            >
              Cancel Switch
            </Button>
          </div>
        )}

        <div className="text-xs text-white/60 text-center pt-4 border-t border-white/20">
          Current: {currentChainData?.displayName || currentChain?.name || "Unknown"} • ID: {chainId}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkSwitchDialog;
