export interface BaseTransaction {
  id: string;
  user: string;
  pool: string;
  asset: string;
  amount: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

export interface SupplyLiquidityTransaction extends BaseTransaction {
  shares: bigint;
  onBehalfOf: string;
  type: 'supply_liquidity';
}

export interface WithdrawLiquidityTransaction extends BaseTransaction {
  shares: bigint;
  to: string;
  type: 'withdraw_liquidity';
}

export interface BorrowDebtCrosschainTransaction extends BaseTransaction {
  shares: bigint;
  chainId: bigint;
  addExecutorLzReceiveOption: bigint;
  onBehalfOf: string;
  type: 'borrow_debt_crosschain';
}

export interface SupplyCollateralTransaction extends BaseTransaction {
  onBehalfOf: string;
  type: 'supply_collateral';
}

export type Transaction = 
  | SupplyLiquidityTransaction 
  | WithdrawLiquidityTransaction 
  | BorrowDebtCrosschainTransaction 
  | SupplyCollateralTransaction;

export interface TokenInfo {
  name: string;
  symbol: string;
  logo: string;
  decimals: number;
}