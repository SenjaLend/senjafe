/**
 * Placeholder text constants
 */
export const PLACEHOLDERS = {
  AMOUNT_INPUT: "Enter amount",
  SHARES_INPUT: "Enter shares amount",
  SEARCH_POOL: "Search pools...",
  SEARCH_TOKEN: "Search tokens...",
  LTV_INPUT: "Enter LTV percentage",
} as const;

/**
 * Button text constants
 */
export const BUTTON_TEXTS = {
  SUPPLY_COLLATERAL: "Supply Collateral",
  SUPPLY_LIQUIDITY: "Supply Liquidity",
  BORROW: "Borrow",
  REPAY: "Repay",
  REPAY_BY_COLLATERAL: "Repay by Collateral",
  WITHDRAW_COLLATERAL: "Withdraw Collateral",
  WITHDRAW_LIQUIDITY: "Withdraw Liquidity",
  CONNECT_WALLET: "Connect Wallet",
  DISCONNECT: "Disconnect",
  APPROVE: "Approve",
  EXECUTE: "Execute",
  CREATE_POOL: "Create Pool",
} as const;

/**
 * Loading messages
 */
export const LOADING_MESSAGES = {
  SUPPLYING: "Supplying...",
  BORROWING: "Borrowing...",
  REPAYING: "Repaying...",
  WITHDRAWING: "Withdrawing...",
  CONFIRMING_TRANSACTION: "Confirming transaction...",
  LOADING_POOLS: "Loading pools...",
  LOADING_TOKENS: "Loading tokens...",
  CONNECTING_WALLET: "Connecting wallet...",
  APPROVING: "Approving...",
  CREATING_POOL: "Creating pool...",
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  COLLATERAL_SUPPLIED: "Collateral supplied successfully!",
  LIQUIDITY_SUPPLIED: "Liquidity supplied successfully!",
  BORROW_SUCCESSFUL: "Borrow successful!",
  REPAY_SUCCESSFUL: "Repay successful!",
  REPAY_BY_COLLATERAL_SUCCESSFUL: "Repay by collateral successful!",
  COLLATERAL_WITHDRAWN: "Collateral withdrawn successfully!",
  LIQUIDITY_WITHDRAWN: "Liquidity withdrawn successfully!",
  WALLET_CONNECTED: "Wallet connected successfully!",
  TRANSACTION_CONFIRMED: "Transaction confirmed!",
  POOL_CREATED: "Pool created successfully!",
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  TRANSACTION_FAILED: "Transaction failed",
  WALLET_NOT_CONNECTED: "Please connect your wallet",
  INVALID_AMOUNT: "Please enter a valid amount",
  INSUFFICIENT_BALANCE: "Insufficient balance",
  NETWORK_ERROR: "Network error occurred",
  USER_REJECTED: "Transaction rejected by user",
  UNSUPPORTED_CHAIN: "Unsupported chain",
} as const;

/**
 * Pool action types
 */
export const POOL_ACTIONS = {
  SUPPLY_COLLATERAL: "supply-collateral",
  SUPPLY_LIQUIDITY: "supply-liquidity",
  BORROW: "borrow",
  REPAY: "repay",
  REPAY_BY_COLLATERAL: "repay-by-collateral",
  WITHDRAW_COLLATERAL: "withdraw-collateral",
  WITHDRAW_LIQUIDITY: "withdraw-liquidity",
} as const;

/**
 * Chain configurations
 */
export const CHAIN_CONFIG = {
  SUPPORTED_CHAINS: [1, 137, 84532, 42161, 10], // Ethereum, Polygon, Base, Arbitrum, Optimism
  DEFAULT_CHAIN: 84532, // Base
} as const;

/**
 * Default chain ID constant
 */
export const DEFAULT_CHAIN_ID = 84532; // Base

/**
 * Validation constants
 */
export const VALIDATION = {
  LTV_MIN: 0,
  LTV_MAX: 100,
  AMOUNT_MIN: 0.000001,
  AMOUNT_MAX: 1000000,
  DECIMALS_MAX: 18,
} as const;

/**
 * UI constants
 */
export const UI_CONSTANTS = {
  MAX_DECIMALS: 18,
  MIN_AMOUNT: 0.000001,
  MAX_AMOUNT: 1000000,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
} as const;