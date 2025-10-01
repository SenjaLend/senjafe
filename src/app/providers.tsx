"use client";
import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getConfig } from "@/lib/config";
import FarcasterProvider from "./farcaster-provider";
import { ChainProvider } from "@/lib/chain/chain-context";

const queryClient = new QueryClient();

export function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: unknown;
}) {
  return (
    <FarcasterProvider>
      <WagmiProvider config={getConfig()}>
        <QueryClientProvider client={queryClient}>
          <ChainProvider>
            {children}
          </ChainProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </FarcasterProvider>
  );
}
