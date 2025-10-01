"use client";

import { useState, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard, Copy, LogOut } from "lucide-react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import CustomWalletButton from "@/components/wallet/custom-wallet-button";
import NetworkSwitchDialog from "@/components/wallet/network-switch-dialog";

export const WalletConnectionCard = memo(function WalletConnectionCard() {
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  const [copied, setCopied] = useState(false);

  const formatAddress = useCallback(
    (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`,
    []
  );

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  }, []);

  return (
    <div className="mb-4 sm:mb-6 card-dark-mid-blue mx-auto max-w-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[var(--electric-blue)]/20 to-[var(--soft-teal)]/20 rounded-full -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[var(--soft-teal)]/20 to-[var(--deep-mid-blue)]/20 rounded-full translate-y-8 -translate-x-8"></div>

      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="px-3 sm:px-6">
        <div className="flex gap-3 justify-between">
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-white">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--soft-teal)] rounded-full flex items-center justify-center">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            Wallet Connection
          </CardTitle>
          {isConnected && (
            <div className="self-start sm:self-auto">
              <CustomWalletButton 
                theme="default"
                showBalance={false}
                showAddress={false}
                className="text-sm px-3 py-1 h-auto bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/90 text-[var(--pure-white)]"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-3 sm:px-6 relative z-10">
        {isConnected ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm sm:text-base">
              Connected Wallet
            </h3>

            {/* Wallet Info Display */}
            <div className="bg-[var(--electric-blue)]/10 rounded-lg p-3 sm:p-4 border border-[var(--electric-blue)]/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--soft-teal)] rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs sm:text-sm text-gray-300">
                    Address
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs sm:text-sm font-medium truncate text-white">
                      {formatAddress(address || "")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => copyToClipboard(address || "")}
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-[var(--electric-blue)]/20 flex-shrink-0"
                      >
                        <Copy className="w-3 h-3 text-[var(--electric-blue)]" />
                      </Button>
                      {copied && (
                        <div className="bg-[var(--electric-blue)] text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap animate-in fade-in duration-200">
                          Copied!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Switch Section */}
              <div className="border-t border-[var(--electric-blue)]/30 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-300 font-mono mb-2">
                      Network
                    </p>
                    <NetworkSwitchDialog theme="senja" className="text-sm" showChainName={true} />
                  </div>
                </div>
              </div>

              {/* Balance Section */}
              <div className="border-t border-[var(--electric-blue)]/30 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-300 font-mono">
                      Balance
                    </p>
                    {balance ? (
                      <p className="text-base sm:text-md font-mono text-white">
                        {parseFloat(balance.formatted).toFixed(4)}{" "}
                        {balance.symbol}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-400">
                        Loading balance...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Disconnect Button */}
              <div className="mt-4 pt-3 border-t border-[var(--electric-blue)]/30">
                <Button
                  onClick={() => disconnect()}
                  className="btn-dark-mid-blue rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 px-4">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
              Connect Your Wallet
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              Connect your wallet to view your profile and portfolio
            </p>

            {/* Custom Senja Wallet Button */}
            <div className="flex justify-center">
              <CustomWalletButton 
                theme="senja" 
                connectButtonText="Connect to Senja"
                className="text-base px-6 py-3"
              />
            </div>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
});
