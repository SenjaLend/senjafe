import { createConfig, http } from "wagmi";
import { celo, moonbeam } from "wagmi/chains";

export const chains = [celo, moonbeam] as const;
export const config = createConfig({
  chains,
  transports: {
    [celo.id]: http(
      "https://celo-mainnet.g.alchemy.com/v2/_wCzLF-DIaJBtb1jRS1FD6U0cE7OA5XP",
      {
        batch: true,
        fetchOptions: {
          keepalive: true,
        },
      }
    ),
    [moonbeam.id]: http("", {
      batch: true,
      fetchOptions: {
        keepalive: true,
      },
    }),
  },
  ssr: true,
  batch: {
    multicall: true,
  },
});
