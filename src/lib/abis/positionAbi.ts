export const positionAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_lpAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "fallback",
    stateMutability: "payable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "DRAGON_SWAP_ROUTER",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "VERSION",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_calculateExpectedAmountWithPriceFeeds",
    inputs: [
      {
        name: "_tokenIn",
        type: "address",
        internalType: "address",
      },
      {
        name: "_tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "expectedAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "counter",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "lpAddress",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "repayWithSelectedToken",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_token",
        type: "address",
        internalType: "address",
      },
      {
        name: "slippageTolerance",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "swapTokenByPosition",
    inputs: [
      {
        name: "_tokenIn",
        type: "address",
        internalType: "address",
      },
      {
        name: "_tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "slippageTolerance",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "amountOut",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "tokenCalculator",
    inputs: [
      {
        name: "_tokenIn",
        type: "address",
        internalType: "address",
      },
      {
        name: "_tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "_amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_tokenInPrice",
        type: "address",
        internalType: "address",
      },
      {
        name: "_tokenOutPrice",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenLists",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenListsId",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenValue",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawCollateral",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
      {
        name: "unwrapToNative",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "Liquidate",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SwapToken",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SwapTokenByPosition",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenIn",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenOut",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountOut",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WithdrawCollateral",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "InsufficientBalance",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidParameter",
    inputs: [],
  },
  {
    type: "error",
    name: "NotForSwap",
    inputs: [],
  },
  {
    type: "error",
    name: "NotForWithdraw",
    inputs: [],
  },
  {
    type: "error",
    name: "OracleOnTokenNotSet",
    inputs: [],
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: [],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "TransferFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroAmount",
    inputs: [],
  },
] as const;
