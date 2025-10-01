import React from "react";
import { GraphQLClient } from "graphql-request";
import {
  GET_USER_TRANSACTIONS,
  GET_ALL_TRANSACTIONS,
  GraphQLTransactionResponse,
} from "./queries";
import { Transaction } from "./types";

const API_URL = process.env.NEXT_PUBLIC_BASE_PONDER_URL || "";

// Create GraphQL client
const client = new GraphQLClient(API_URL);

// Debug logging
console.log("GraphQL API URL:", API_URL);

// Transform GraphQL response to our Transaction type
function transformGraphQLResponse(
  data: GraphQLTransactionResponse
): Transaction[] {
  console.log("Received GraphQL data:", data);
  const transactions: Transaction[] = [];

  // Transform SupplyLiquidity transactions
  data.supplyLiquidities.forEach((tx) => {
    transactions.push({
      id: tx.id,
      user: tx.user,
      pool: tx.pool,
      asset: tx.asset,
      amount: BigInt(tx.amount),
      shares: BigInt(tx.shares),
      onBehalfOf: tx.onBehalfOf,
      timestamp: BigInt(tx.timestamp),
      blockNumber: BigInt(tx.blockNumber),
      transactionHash: tx.transactionHash,
      type: "supply_liquidity",
    });
  });

  // Transform WithdrawLiquidity transactions
  data.withdrawLiquidities.forEach((tx) => {
    transactions.push({
      id: tx.id,
      user: tx.user,
      pool: tx.pool,
      asset: tx.asset,
      amount: BigInt(tx.amount),
      shares: BigInt(tx.shares),
      to: tx.to,
      timestamp: BigInt(tx.timestamp),
      blockNumber: BigInt(tx.blockNumber),
      transactionHash: tx.transactionHash,
      type: "withdraw_liquidity",
    });
  });

  // Transform SupplyCollateral transactions
  data.supplyCollaterals.forEach((tx) => {
    transactions.push({
      id: tx.id,
      user: tx.user,
      pool: tx.pool,
      asset: tx.asset,
      amount: BigInt(tx.amount),
      onBehalfOf: tx.onBehalfOf,
      timestamp: BigInt(tx.timestamp),
      blockNumber: BigInt(tx.blockNumber),
      transactionHash: tx.transactionHash,
      type: "supply_collateral",
    });
  });

  // Sort by timestamp descending (newest first)
  return transactions.sort((a, b) => {
    if (a.timestamp > b.timestamp) return -1;
    if (a.timestamp < b.timestamp) return 1;
    return 0;
  });
}

export async function fetchUserTransactions(
  userAddress: string,
  first: number = 50,
  skip: number = 0
): Promise<Transaction[]> {
  try {
    console.log("Fetching transactions for user:", userAddress);
    const data = await client.request<GraphQLTransactionResponse>(
      GET_USER_TRANSACTIONS,
      {
        user: userAddress.toLowerCase(),
      }
    );

    console.log("Raw GraphQL response:", data);
    return transformGraphQLResponse(data);
  } catch (error) {
    console.error("Failed to fetch transaction history:", error);
    throw new Error("Failed to fetch transaction history");
  }
}

export async function fetchAllTransactions(
  first: number = 50,
  skip: number = 0
): Promise<Transaction[]> {
  try {
    const data = await client.request<GraphQLTransactionResponse>(
      GET_ALL_TRANSACTIONS,
      {}
    );

    return transformGraphQLResponse(data);
  } catch (error) {
    console.error("Failed to fetch transaction history:", error);
    throw new Error("Failed to fetch transaction history");
  }
}

// Hook for easy data fetching with loading and error states
export function useTransactions(userAddress?: string) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        setError(null);

        // Only fetch transactions if userAddress is provided
        // This prevents showing all transactions when wallet is not connected
        if (userAddress) {
          console.log("Loading transactions for user:", userAddress);
          const data = await fetchUserTransactions(userAddress);
          console.log("Loaded transactions:", data);
          setTransactions(data);
        } else {
          // Clear transactions and stop loading when no user address
          console.log("No user address provided, clearing transactions");
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error loading transactions:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [userAddress]);

  const refetch = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch transactions if userAddress is provided
      if (userAddress) {
        const data = await fetchUserTransactions(userAddress);
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  return { transactions, loading, error, refetch };
}
