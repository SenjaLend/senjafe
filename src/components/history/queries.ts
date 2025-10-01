import { gql } from 'graphql-request';

export const GET_USER_TRANSACTIONS = gql`
  query GetUserTransactions($user: String!) {
    supplyLiquidities(
      where: { user: $user }
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      user
      pool
      asset
      amount
      shares
      onBehalfOf
      timestamp
      blockNumber
      transactionHash
    }

    withdrawLiquidities(
      where: { user: $user }
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      user
      pool
      asset
      amount
      shares
      to
      timestamp
      blockNumber
      transactionHash
    }

    supplyCollaterals(
      where: { user: $user }
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      user
      pool
      asset
      amount
      onBehalfOf
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

export const GET_ALL_TRANSACTIONS = gql`
  query GetAllTransactions {
    supplyLiquidities(
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      user
      pool
      asset
      amount
      shares
      onBehalfOf
      timestamp
      blockNumber
      transactionHash
    }

    withdrawLiquidities(
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      user
      pool
      asset
      amount
      shares
      to
      timestamp
      blockNumber
      transactionHash
    }

    supplyCollaterals(
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      user
      pool
      asset
      amount
      onBehalfOf
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

export interface GraphQLTransactionResponse {
  supplyLiquidities: Array<{
    id: string;
    user: string;
    pool: string;
    asset: string;
    amount: string;
    shares: string;
    onBehalfOf: string;
    timestamp: string;
    blockNumber: string;
    transactionHash: string;
  }>;
  withdrawLiquidities: Array<{
    id: string;
    user: string; 
    pool: string;
    asset: string;
    amount: string;
    shares: string;
    to: string;
    timestamp: string;
    blockNumber: string;
    transactionHash: string;
  }>;
  supplyCollaterals: Array<{
    id: string;
    user: string;
    pool: string;
    asset: string;
    amount: string;
    onBehalfOf: string;
    timestamp: string;
    blockNumber: string;
    transactionHash: string;
  }>;
}