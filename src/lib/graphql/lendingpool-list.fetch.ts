import { graphClient } from "./client";
import { queryLendingPool } from "./lendingpool-data.query";
import { tokens } from "../addresses/tokenAddress";
import { Token } from "@/types";
import { normalizeAddress } from "@/utils/address";

export type LendingPoolCreated = {
  id: string;
  lendingPool: `0x${string}`;
  borrowToken: `0x${string}`;
  collateralToken: `0x${string}`;
  ltv: string;
};

export type LendingPoolWithTokens = LendingPoolCreated & {
  borrowTokenInfo: Token | null;
  collateralTokenInfo: Token | null;
};

// Helper function to find token by address
function findTokenByAddress(address: string, chainId?: number): Token | null {
  const normalizedAddress = normalizeAddress(address);
  
  if (!normalizedAddress) {
    return null;
  }
  
  // If chainId is provided, search only in that chain
  if (chainId) {
    return tokens.find(token => {
      const tokenAddress = normalizeAddress(token.addresses[chainId]);
      return tokenAddress === normalizedAddress;
    }) || null;
  }
  
  // If no chainId provided, search across all chains
  return tokens.find(token => {
    return Object.values(token.addresses).some(addr => 
      normalizeAddress(addr) === normalizedAddress
    );
  }) || null;
}

// Function to pair lending pools with token metadata
export function pairLendingPoolsWithTokens(pools: LendingPoolCreated[], chainId?: number): LendingPoolWithTokens[] {
  return pools.map(pool => ({
    ...pool,
    borrowTokenInfo: findTokenByAddress(pool.borrowToken, chainId),
    collateralTokenInfo: findTokenByAddress(pool.collateralToken, chainId),
  }));
}

export async function fetchLendingPools(): Promise<LendingPoolCreated[]> {
  // Mock data untuk mengatasi masalah backend sementara - Moonbeam chain
  const MOCK_LENDING_POOLS: LendingPoolCreated[] = [
    {
      id: "mock-pool-moonbeam-1",
      lendingPool: "0x8db5846dd3c3ec592d5f4421a96d6fba118a0629",
      borrowToken: "0x32822138bc93390f236B4a629EA793dE12b92d19",
      collateralToken: "0xe19784dd55E2D7B610b53B5379EFf878c75A7cd4",
      ltv: "89"
    }
  ];

  try {
    const query = queryLendingPool();
    const data = await graphClient.request<{ lendingPoolCreateds: LendingPoolCreated[] }>(query);
    
    if (!data?.lendingPoolCreateds) {
      // Return mock data if GraphQL fails
      console.warn('GraphQL failed, using mock lending pool data');
      return MOCK_LENDING_POOLS;
    }
    
    const pools = data.lendingPoolCreateds;

    if (!Array.isArray(pools)) {
      // Return mock data if response is invalid
      console.warn('Invalid GraphQL response, using mock lending pool data');
      return MOCK_LENDING_POOLS;
    }

    // Filter out invalid pools
    const validPools = pools.filter(pool => 
      pool.lendingPool && 
      pool.borrowToken && 
      pool.collateralToken
    );
    
    // If no valid pools found, return mock data
    if (validPools.length === 0) {
      console.warn('No valid pools found, using mock lending pool data');
      return MOCK_LENDING_POOLS;
    }
    
    return validPools;
  } catch (error) {
    console.error('Error fetching lending pools:', error);
    // Return mock data if there's an error
    console.warn('Using mock lending pool data due to backend error');
    return MOCK_LENDING_POOLS;
  }
}              