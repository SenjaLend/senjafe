import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base, moonbeam } from "./chains";

export const chains = [moonbeam, base];

export const chainData = {
  [moonbeam.id]: {
    ...moonbeam,
    logo: moonbeam.iconUrl,
    displayName: moonbeam.name,
    symbol: moonbeam.nativeCurrency.symbol,
  },
  [base.id]: {
    ...base,
    logo: base.iconUrl,
    displayName: base.name,
    symbol: base.nativeCurrency.symbol,
  },
};

export function getConfig() {
  return createConfig({
    chains: [moonbeam, base],
    ssr: true,
    batch: {
      multicall: true,
    },
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [moonbeam.id]: http(moonbeam.rpcUrls.default.http[0], {
        batch: true,
        fetchOptions: {
          keepalive: true,
        },
      }),
      [base.id]: http(base.rpcUrls.default.http[0], {
        batch: true,
        fetchOptions: {
          keepalive: true,
        },
      }),
    },
  });
}
