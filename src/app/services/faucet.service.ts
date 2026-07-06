import { Injectable, signal } from '@angular/core';
import { ethers } from 'ethers';
import { NetworkConfig } from '../models/network.model';

export interface FaucetNetwork {
  chainId: string;
  chainName: string;
  symbol: string;
  icon: string;
  amountEth: string;   // amount as string ETH (e.g. "0.01")
  label: string;       // display label e.g. "0.01 ETH"
  cooldownMs: number;  // cooldown between requests per address
  rpcUrls: string[];
  explorerBase: string;
}

export interface FaucetResult {
  txHash: string;
  explorerUrl: string;
  amount: string;
  symbol: string;
  network: string;
}

// Supported testnet faucet networks — amounts are tiny so the funder lasts longer
export const FAUCET_NETWORKS: FaucetNetwork[] = [
  {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    symbol: 'ETH',
    icon: '🔵',
    amountEth: '0.005',
    label: '0.005 ETH',
    cooldownMs: 24 * 60 * 60 * 1000,
    rpcUrls: [
      'https://ethereum-sepolia-rpc.publicnode.com',
      'https://sepolia.drpc.org',
      'https://rpc.sepolia.org',
    ],
    explorerBase: 'https://sepolia.etherscan.io',
  },
  {
    chainId: '0x88bb0',
    chainName: 'Hoodi Testnet',
    symbol: 'ETH',
    icon: '🟣',
    amountEth: '0.005',
    label: '0.005 ETH',
    cooldownMs: 24 * 60 * 60 * 1000,
    rpcUrls: [
      'https://rpc.hoodi.ethpandaops.io',
      'https://ethereum-hoodi-rpc.publicnode.com',
    ],
    explorerBase: 'https://hoodi.etherscan.io',
  },
  {
    chainId: '0x13882',
    chainName: 'Polygon Amoy',
    symbol: 'MATIC',
    icon: '🟠',
    amountEth: '0.01',
    label: '0.01 MATIC',
    cooldownMs: 24 * 60 * 60 * 1000,
    rpcUrls: [
      'https://rpc-amoy.polygon.technology',
      'https://polygon-amoy-bor-rpc.publicnode.com',
    ],
    explorerBase: 'https://amoy.polygonscan.com',
  },
  {
    chainId: '0x61',
    chainName: 'BNB Smart Chain Testnet',
    symbol: 'tBNB',
    icon: '🟤',
    amountEth: '0.005',
    label: '0.005 tBNB',
    cooldownMs: 24 * 60 * 60 * 1000,
    rpcUrls: [
      'https://bsc-testnet-rpc.publicnode.com',
      'https://data-seed-prebsc-1-s1.binance.org:8545',
    ],
    explorerBase: 'https://testnet.bscscan.com',
  },
  {
    chainId: '0xa869',
    chainName: 'Avalanche Fuji',
    symbol: 'AVAX',
    icon: '🔴',
    amountEth: '0.01',
    label: '0.01 AVAX',
    cooldownMs: 24 * 60 * 60 * 1000,
    rpcUrls: [
      'https://avalanche-fuji-c-chain-rpc.publicnode.com',
      'https://api.avax-test.network/ext/bc/C/rpc',
    ],
    explorerBase: 'https://testnet.snowtrace.io',
  },
  {
    chainId: '0x66eee',
    chainName: 'Arbitrum Sepolia',
    symbol: 'ETH',
    icon: '🔷',
    amountEth: '0.005',
    label: '0.005 ETH',
    cooldownMs: 24 * 60 * 60 * 1000,
    rpcUrls: [
      'https://sepolia-rollup.arbitrum.io/rpc',
      'https://arbitrum-sepolia-rpc.publicnode.com',
    ],
    explorerBase: 'https://sepolia.arbiscan.io',
  },
  {
    chainId: '0xaa37dc',
    chainName: 'Optimism Sepolia',
    symbol: 'ETH',
    icon: '🔴',
    amountEth: '0.005',
    label: '0.005 ETH',
    cooldownMs: 24 * 60 * 60 * 1000,
    rpcUrls: [
      'https://sepolia.optimism.io',
      'https://optimism-sepolia-rpc.publicnode.com',
    ],
    explorerBase: 'https://sepolia-optimism.etherscan.io',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: In a real production faucet the private key would live in a backend
// service, never in frontend code. For this demo/testnet-only dApp the key
// is stored in a constant. Replace the value with a funded testnet wallet.
// ─────────────────────────────────────────────────────────────────────────────
const FAUCET_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Demo Hardhat account #0 — replace with real funded testnet key

@Injectable({ providedIn: 'root' })
export class FaucetService {
  readonly isSending = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // ── Cooldown tracking (in-memory per session) ─────────────────────────────
  // Key: `${chainId}:${addressLower}`, value: last claim timestamp
  private claimTimestamps = new Map<string, number>();

  // ── Cooldown helpers ──────────────────────────────────────────────────────
  private claimKey(chainId: string, address: string): string {
    return `${chainId}:${address.toLowerCase()}`;
  }

  cooldownRemaining(network: FaucetNetwork, address: string): number {
    const key = this.claimKey(network.chainId, address);
    const last = this.claimTimestamps.get(key) ?? 0;
    const remaining = last + network.cooldownMs - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  canClaim(network: FaucetNetwork, address: string): boolean {
    return this.cooldownRemaining(network, address) === 0;
  }

  formatCooldown(ms: number): string {
    if (ms <= 0) return '';
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  // ── Connect to fastest available RPC ─────────────────────────────────────
  private async connectProvider(rpcUrls: string[]): Promise<ethers.JsonRpcProvider> {
    for (const url of rpcUrls) {
      try {
        const provider = new ethers.JsonRpcProvider(url);
        await Promise.race([
          provider.getBlockNumber(),
          new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 5000)),
        ]);
        return provider;
      } catch { /* try next */ }
    }
    throw new Error('No se pudo conectar a ningún nodo RPC de esta red.');
  }

  // ── Main send ─────────────────────────────────────────────────────────────
  async sendTokens(network: FaucetNetwork, toAddress: string): Promise<FaucetResult | null> {
    this.isSending.set(true);
    this.errorMessage.set(null);

    try {
      // Cooldown guard
      if (!this.canClaim(network, toAddress)) {
        const remaining = this.cooldownRemaining(network, toAddress);
        throw new Error(
          `Debes esperar ${this.formatCooldown(remaining)} antes de solicitar de nuevo.`
        );
      }

      const provider = await this.connectProvider(network.rpcUrls);
      const wallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);

      // Check faucet wallet balance
      const faucetBalance = await provider.getBalance(wallet.address);
      const amountWei = ethers.parseEther(network.amountEth);

      if (faucetBalance < amountWei) {
        throw new Error(
          `El faucet de ${network.chainName} no tiene saldo suficiente en este momento.`
        );
      }

      // Estimate gas to set a correct gasLimit
      const gasPrice = (await provider.getFeeData()).gasPrice ?? ethers.parseUnits('20', 'gwei');

      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: amountWei,
        gasLimit: 21_000n,
        gasPrice,
      });

      // Record cooldown before awaiting confirmation so UI updates quickly
      this.claimTimestamps.set(this.claimKey(network.chainId, toAddress), Date.now());

      // Wait for 1 confirmation
      await tx.wait(1);

      return {
        txHash: tx.hash,
        explorerUrl: `${network.explorerBase}/tx/${tx.hash}`,
        amount: network.label,
        symbol: network.symbol,
        network: network.chainName,
      };
    } catch (err: any) {
      const raw: string = err?.message ?? 'Error desconocido';
      // Keep user-friendly messages; strip internal ethers noise
      const clean = raw.replace(/\(action=.*/, '').replace(/\[.*?\]/g, '').trim();
      this.errorMessage.set(clean);
      return null;
    } finally {
      this.isSending.set(false);
    }
  }
}
