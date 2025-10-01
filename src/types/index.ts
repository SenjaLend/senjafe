import { Address } from "viem";
import React from "react";
/**
 * Token interface representing a cryptocurrency token
 */
export interface Token {
  /** Full name of the token (e.g., "Wrapped Ether") */
  name: string;
  /** Symbol of the token (e.g., "WETH") */
  symbol: string;
  /** URL or path to the token logo image */
  logo: string;
  /** Number of decimal places for the token */
  decimals: number;
  /** Optional OFT (Omnichain Fungible Token) address */
  oftAddress?: string;
  /** Contract addresses for different chains */
  addresses: {
    [chainId: number]: Address;
  };
}

/**
 * Chain interface representing a blockchain network
 */
export interface Chain {
  /** Unique chain identifier */
  id: number;
  /** Unique chain identifier */
  destinationEndpoint: number;
  /** Human-readable chain name */
  name: string;
  /** URL or path to the chain logo image */
  logo: string;
  /** Whether this chain is disabled for selection */
  disabled?: boolean;
  /** Whether to show "Coming Soon" label */
  comingSoon?: boolean;
  /** Smart contract addresses for this chain */
  contracts: {
    lendingPool: string;
    factory: string;
    position: string;
    blockExplorer: string;
  };
}

/**
 * Pool token interface for lending pools
 */
export interface PoolToken {
  /** Token symbol */
  symbol: string;
  /** Token name */
  name: string;
  /** Token logo URL */
  logo: string;
  /** Optional contract address */
  address?: string;
}

/**
 * Lending pool interface
 */
export interface LendingPool {
  /** Unique pool identifier */
  id: string;
  /** Token that can be borrowed */
  loanToken: PoolToken;
  /** Token used as collateral */
  collateralToken: PoolToken;
  /** Loan-to-Value ratio as percentage string */
  ltv: string;
  /** Available liquidity as formatted string */
  liquidity: string;
  /** Annual Percentage Yield as percentage string */
  apy: string;
}

/**
 * Lending pool with token information from API
 */
export interface LendingPoolWithTokens {
  /** Pool contract address */
  lendingPool: string;
  /** Collateral token address */
  collateralToken: string;
  /** Borrow token address */
  borrowToken: string;
  /** Loan-to-Value ratio in wei */
  ltv: string;
  /** Pool ID */
  id: string;
  /** Collateral token information */
  collateralTokenInfo?: Token;
  /** Borrow token information */
  borrowTokenInfo?: Token;
}

/**
 * Transaction status types
 */
export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

/**
 * Common component props for reusable components
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Children elements */
  children?: React.ReactNode;
}

/**
 * Props for components that handle token selection
 */
export interface TokenSelectionProps {
  /** Currently selected token */
  selectedToken?: Token;
  /** Callback when token is selected */
  onTokenSelect: (token: Token) => void;
  /** Other token to exclude from selection */
  otherToken?: Token;
  /** Placeholder text for the selector */
  label?: string;
}

/**
 * Props for components that handle pool selection
 */
export interface PoolSelectionProps {
  /** Available pools to select from */
  pools: LendingPool[];
  /** Callback when pool is selected */
  onPoolSelect?: (pool: LendingPool) => void;
  /** Currently selected pool */
  selectedPool?: LendingPool;
}
