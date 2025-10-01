"use client";

import React, { useState, memo } from 'react';
import { Plus } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { CreatePoolDialog } from './create-pool-dialog';
import { WalletConnectDialog } from '@/components/wallet/wallet-connect-dialog';

interface CreatePoolButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export const CreatePoolButton = memo(function CreatePoolButton({
  onSuccess,
  className = "",
}: CreatePoolButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isConnected, chainId } = useAccount();

  // Check if wallet is connected and on correct chain
  const isOnTargetChain = chainId === 1284; // Moonbeam chain ID
  const isWalletReady = isConnected && isOnTargetChain;

  const handleSuccess = () => {
    onSuccess?.();
    setIsDialogOpen(false);
  };

  return (
    <>
      {isWalletReady ? (
        <>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className={`flex items-center gap-2 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] hover:from-[var(--electric-blue)]/90 hover:to-[var(--neon-green)]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
          >
            <Plus className="h-4 w-4" />
            Create Pool
          </Button>

          <CreatePoolDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSuccess={handleSuccess}
          />
        </>
      ) : (
        <WalletConnectDialog
          className={`flex items-center gap-2 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] hover:from-[var(--electric-blue)]/90 hover:to-[var(--neon-green)]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
          connectButtonText="Connect Wallet"
          theme="blue"
        />
      )}
    </>
  );
});
