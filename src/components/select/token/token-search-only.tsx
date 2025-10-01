"use client";

import React, { memo } from "react";
import { TokenSearch } from "./token-search";
import { Token } from "@/types";

interface TokenSearchOnlyProps {
  onTokenSelect: (token: Token) => void;
  otherToken?: Token;
  showPopularTokens?: boolean;
  className?: string;
}

export const TokenSearchOnly = memo(function TokenSearchOnly({
  onTokenSelect,
  otherToken,
  showPopularTokens = true,
  className = "",
}: TokenSearchOnlyProps) {
  return (
    <div className={className}>
      <TokenSearch
        onTokenSelect={onTokenSelect}
        otherToken={otherToken}
        showPopularTokens={showPopularTokens}
      />
    </div>
  );
});
