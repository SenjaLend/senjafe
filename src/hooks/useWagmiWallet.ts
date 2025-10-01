'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from 'wagmi';
import { base, moonbeam } from '@/lib/chains';

export const useWagmiWallet = () => {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address: address,
  });

  const connectWallet = async () => {
    await connect({ connector: connectors[0] });
  };

  const disconnectWallet = async () => {
    await disconnect();
  };

  const switchNetwork = async (targetChainId: number) => {
    // Check if the chain is supported
    const supportedChains = [base, moonbeam];
    const targetChain = supportedChains.find(chain => chain.id === targetChainId);
    if (!targetChain) {
      throw new Error(`Chain with ID ${targetChainId} is not supported`);
    }

    await switchChain({ chainId: targetChainId });
  };

  const getCurrentChain = () => {
    if (!chainId) {
      return null;
    }

    const supportedChains = [base, moonbeam];
    const currentChain = supportedChains.find(chain => chain.id === chainId);
    return currentChain ? {
      id: currentChain.id,
      name: currentChain.name,
      logo: `/chain/${currentChain.name.toLowerCase()}-logo.svg` // Default logo path
    } : null;
  };

  const getBalance = async (): Promise<string> => {
    if (!balance) {
      return '0';
    }
    return balance.formatted;
  };

  return {
    // State
    isConnected,
    account: address,
    currentChainId: chainId,
    isLoading: isSwitching,
    error: null, // wagmi handles errors internally
    
    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchNetwork,
    getCurrentChain,
    getBalance,
    
    // Additional wagmi data
    balance,
    isLoadingBalance,
    connectors,
  };
};
