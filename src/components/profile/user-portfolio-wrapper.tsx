"use client";

import { memo } from "react";
import { useAccount } from "wagmi";
import { UserPortfolio } from "./user-portfolio";

export const UserPortfolioWrapper = memo(function UserPortfolioWrapper() {
  const { isConnected } = useAccount();

  // Only render UserPortfolio if wallet is connected
  if (!isConnected) {
    return null;
  }

  return <UserPortfolio className="mb-4 sm:mb-6" />;
});
