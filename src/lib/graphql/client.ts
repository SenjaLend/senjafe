import { GraphQLClient } from "graphql-request";

// Goldsky API endpoint for lending pool data
const PONDER_API_ENDPOINT = process.env.NEXT_PUBLIC_BASE_PONDER_URL || "";

export const graphClient = new GraphQLClient(PONDER_API_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
});