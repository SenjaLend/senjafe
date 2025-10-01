import { gql } from "graphql-request";

export const queryLendingPool = () => {
  return gql`
    query MyQuery {
      lendingPoolCreateds {
        items {
          id
          lendingPool
          collateralToken
          borrowToken
          ltv
        }
      }
    }
  `;
};

export const queryLendingPoolApy = () => {
  return gql`
    query MyQuery {
      lendingPools {
        items {
          borrowAPY
          supplyAPY
          address
        }
      }
    }
  `;
};
