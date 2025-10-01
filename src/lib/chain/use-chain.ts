import { useChain, useCurrentChain, useCurrentChainId } from './chain-context';

// Re-export all chain hooks for convenience
export { useChain, useCurrentChain, useCurrentChainId };

// Additional convenience hooks
export function useChainContracts() {
  const { currentChain } = useChain();
  return currentChain.contracts;
}

export function useChainName() {
  const { currentChain } = useChain();
  return currentChain.name;
}

export function useChainLogo() {
  const { currentChain } = useChain();
  return currentChain.logo;
}

export function useAllChains() {
  const { allChains } = useChain();
  return allChains;
}

export function useChainActions() {
  const { setChain, switchToNextChain, switchToPreviousChain, isChainSupported } = useChain();
  return {
    setChain,
    switchToNextChain,
    switchToPreviousChain,
    isChainSupported,
  };
}
