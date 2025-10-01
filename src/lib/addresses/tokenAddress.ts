import { Token } from "@/types";

export const tokens: Token[] = [
  {
    name: "WGLMR",
    symbol: "WGLMR",
    logo: "/token/wglmr-logo.png",
    decimals: 18,
    oftAddress: "0x15858A57854BBf0DF60A737811d50e1Ee785f9bc",
    addresses: {
      1284: "0xe19784dd55E2D7B610b53B5379EFf878c75A7cd4",
    },
  },
  {
    name: "WETH.e",
    symbol: "WETH",
    logo: "/token/weth.png",
    decimals: 18,
    oftAddress: "0x007F735Fd070DeD4B0B58D430c392Ff0190eC20F", 
    addresses: {
      1284: "0xFFffFFfF86829AFE1521ad2296719Df3acE8DEd7",  //weth
    },
  },
  {
    name: "WBTC",
    symbol: "WBTC",
    logo: "/token/wbtc.png",
    decimals: 8,
    oftAddress: "0x4Ba8D8083e7F3652CCB084C32652e68566E9Ef23",
    addresses: {
      1284: "0xfFffFFFf1B4Bb1ac5749F73D866FfC91a3432c47", //wbtc
      8453: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c", //wbtc
    },
  },
  {
    name: "USDT",
    symbol: "USDT",
    logo: "/token/usdt.png",
    decimals: 6,
    oftAddress: "0xdF05e9AbF64dA281B3cBd8aC3581022eC4841FB2",
    addresses: {
      8453: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", //usdt
      1284: "0x32822138bc93390f236B4a629EA793dE12b92d19", // usdt
    },
  },
  {
    name: "USDC",
    symbol: "USDC",
    logo: "/token/usdc.png",
    decimals: 6,
    oftAddress: "0xdF05e9AbF64dA281B3cBd8aC3581022eC4841FB2",
    addresses: {
      8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",//usdc
      1284: "0xFFfffffF7D2B0B761Af01Ca8e25242976ac0aD7D",
    },
  },
];

export const helperAddress = "0x3870bFD5820994a560E3F1D9c98c7740D9E007B8";
