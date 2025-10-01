import { defineChain } from "viem";

export const base = defineChain({
  id: 8453,
  name: "Base",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://mainnet.base.org/",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Base Scan",
      url: "https://basescan.org",
    },
  },
  testnet: false,
  iconBackground: "#ffff",
  iconUrl: "/chain/base-logo.png",
});

export const moonbeam = defineChain({
  id: 1284,
  name: "Moonbeam",
  nativeCurrency: { name: "GLMR", symbol: "GLMR", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.api.moonbeam.network"] },
  },
  blockExplorers: {
    default: {
      name: "Moonbeam Scan",
      url: "https://moonbeam.moonscan.io",
    },
  },
  testnet: false,
  iconBackground: "#ffff",
  iconUrl: "/chain/moonbeam-logo.svg",
});
