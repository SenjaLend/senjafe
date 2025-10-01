import { Chain } from "@/types";
import { chains } from "@/lib/addresses/chainAddress";

// Type declaration for localStorage
declare const localStorage: {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

/**
 * Get chain by ID
 */
export function getChainById(chainId: number): Chain | undefined {
  return chains.find(chain => chain.id === chainId);
}

/**
 * Get default chain (Base)
 */
export function getDefaultChain(): Chain {
  return chains[0]; // Base chain
}

/**
 * Get all available chains
 */
export function getAllChains(): Chain[] {
  return chains;
}

/**
 * Get chain ID from environment or default
 */
export function getCurrentChainId(): number {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // Try to get from localStorage first
    const storedChainId = localStorage.getItem('selectedChainId');
    if (storedChainId) {
      const chainId = parseInt(storedChainId, 10);
      if (chains.some(chain => chain.id === chainId)) {
        return chainId;
      }
    }
  }
  
  // Return default chain ID
  return getDefaultChain().id;
}

/**
 * Set current chain ID
 */
export function setCurrentChainId(chainId: number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedChainId', chainId.toString());
  }
}

/**
 * Get chain name by ID
 */
export function getChainName(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.name || 'Unknown';
}

/**
 * Get chain logo by ID
 */
export function getChainLogo(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.logo || '/chain/base.png';
}

/**
 * Get chain contracts by ID
 */
export function getChainContracts(chainId: number) {
  const chain = getChainById(chainId);
  return chain?.contracts || getDefaultChain().contracts;
}

/**
 * Check if chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return chains.some(chain => chain.id === chainId);
}

/**
 * Get next chain in the list
 */
export function getNextChain(currentChainId: number): Chain {
  const currentIndex = chains.findIndex(chain => chain.id === currentChainId);
  const nextIndex = (currentIndex + 1) % chains.length;
  return chains[nextIndex];
}

/**
 * Get previous chain in the list
 */
export function getPreviousChain(currentChainId: number): Chain {
  const currentIndex = chains.findIndex(chain => chain.id === currentChainId);
  const prevIndex = currentIndex === 0 ? chains.length - 1 : currentIndex - 1;
  return chains[prevIndex];
}
