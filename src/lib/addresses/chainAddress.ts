import { Chain } from "@/types";

export const chains: Chain[] = [
  {
    id: 1284,
    destinationEndpoint: 30126, // fill when cross-chain messaging is set up
    name: "Moonbeam",
    logo: "/chain/moonbeam-logo.svg",
    contracts: {
      lendingPool: "",
      factory: "0x46638aD472507482B7D5ba45124E93D16bc97eCE",
      position: "",
      blockExplorer: "https://moonbeam.moonscan.io",
    },
  },
  {
    id: 8453,
    destinationEndpoint: 30184,
    name: "Base",
    logo: "/chain/base-logo.png",
    contracts: {
      lendingPool: "",
      factory: "0x5a28316959551dA618F84070FfF70B390270185C",
      position: "",
      blockExplorer: "https://moonbeam.moonscan.io",
    },
  },
];
