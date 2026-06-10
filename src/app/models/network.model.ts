export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  // Optional: REST API base for fetching tx history (Etherscan-compatible)
  explorerApiUrl?: string;
  // Optional: API key env placeholder (user fills in)
  explorerApiKey?: string;
  isCustom?: boolean;
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  // ── Testnets ──────────────────────────────────────────────────────────────
  {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://ethereum-sepolia-rpc.publicnode.com',
      'https://sepolia.drpc.org',
      'https://rpc.sepolia.org',
    ],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  {
    chainId: '0x88bb0',
    chainName: 'Hoodi Testnet',
    nativeCurrency: { name: 'Hoodi ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://rpc.hoodi.ethpandaops.io',
      'https://ethereum-hoodi-rpc.publicnode.com',
    ],
    blockExplorerUrls: ['https://hoodi.etherscan.io'],
  },
  {
    chainId: '0x1389',
    chainName: 'zkSYS Testnet',
    nativeCurrency: { name: 'SYS', symbol: 'SYS', decimals: 18 },
    rpcUrls: ['https://rpc.zkSYS.syscoin.org'],
    blockExplorerUrls: ['https://explorer.zkSYS.syscoin.org'],
  },
  {
    chainId: '0x13882',
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: [
      'https://rpc-amoy.polygon.technology',
      'https://polygon-amoy-bor-rpc.publicnode.com',
    ],
    blockExplorerUrls: ['https://amoy.polygonscan.com'],
    explorerApiUrl: 'https://api-amoy.polygonscan.com/api',
  },
  {
    chainId: '0x61',
    chainName: 'BNB Smart Chain Testnet',
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    rpcUrls: [
      'https://bsc-testnet-rpc.publicnode.com',
      'https://data-seed-prebsc-1-s1.binance.org:8545',
    ],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
    explorerApiUrl: 'https://api-testnet.bscscan.com/api',
  },
  {
    chainId: '0xa869',
    chainName: 'Avalanche Fuji Testnet',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    rpcUrls: [
      'https://avalanche-fuji-c-chain-rpc.publicnode.com',
      'https://api.avax-test.network/ext/bc/C/rpc',
    ],
    blockExplorerUrls: ['https://testnet.snowtrace.io'],
    explorerApiUrl: 'https://api-testnet.snowtrace.io/api',
  },
  {
    chainId: '0x66eee',
    chainName: 'Arbitrum Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://sepolia-rollup.arbitrum.io/rpc',
      'https://arbitrum-sepolia-rpc.publicnode.com',
    ],
    blockExplorerUrls: ['https://sepolia.arbiscan.io'],
    explorerApiUrl: 'https://api-sepolia.arbiscan.io/api',
  },
  {
    chainId: '0xaa37dc',
    chainName: 'Optimism Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://sepolia.optimism.io',
      'https://optimism-sepolia-rpc.publicnode.com',
    ],
    blockExplorerUrls: ['https://sepolia-optimism.etherscan.io'],
  },
  // ── Mainnets ──────────────────────────────────────────────────────────────
  {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://ethereum-rpc.publicnode.com',
      'https://cloudflare-eth.com',
      'https://eth.drpc.org',
    ],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: [
      'https://polygon-bor-rpc.publicnode.com',
      'https://polygon-rpc.com',
    ],
    blockExplorerUrls: ['https://polygonscan.com'],
    explorerApiUrl: 'https://api.polygonscan.com/api',
  },
  {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: [
      'https://bsc-rpc.publicnode.com',
      'https://bsc-dataseed.binance.org',
    ],
    blockExplorerUrls: ['https://bscscan.com'],
    explorerApiUrl: 'https://api.bscscan.com/api',
  },
  {
    chainId: '0xa4b1',
    chainName: 'Arbitrum One',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://arbitrum-one-rpc.publicnode.com',
      'https://arb1.arbitrum.io/rpc',
    ],
    blockExplorerUrls: ['https://arbiscan.io'],
    explorerApiUrl: 'https://api.arbiscan.io/api',
  },
  {
    chainId: '0xa',
    chainName: 'Optimism',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://optimism-rpc.publicnode.com',
      'https://mainnet.optimism.io',
    ],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
];

// ── Custom networks stored in memory (not localStorage) ───────────────────
let customNetworks: NetworkConfig[] = [];

export function getCustomNetworks(): NetworkConfig[] {
  return customNetworks;
}

export function addCustomNetwork(network: NetworkConfig): void {
  customNetworks = [{ ...network, isCustom: true }, ...customNetworks];
}

export function removeCustomNetwork(chainId: string): void {
  customNetworks = customNetworks.filter((n) => n.chainId !== chainId);
}

export function getAllNetworks(): NetworkConfig[] {
  return [...SUPPORTED_NETWORKS, ...customNetworks];
}
