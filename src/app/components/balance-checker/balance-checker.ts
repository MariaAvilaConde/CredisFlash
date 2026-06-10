import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ethers } from 'ethers';
import { Web3Service } from '../../services/web3.service';
import { NetworkConfig } from '../../models/network.model';

interface BalanceResult {
  address: string;
  balance: string;
  balanceRaw: number;
  network: string;
  symbol: string;
  explorerUrl: string;
  blockNumber: number;
  priceUsd: number | null;   // null = testnet or price unavailable
  valueUsd: number | null;
}

// CoinGecko IDs for mainnet tokens that have real USD value
const COINGECKO_IDS: Record<string, string> = {
  '0x1':    'ethereum',   // Ethereum Mainnet
  '0x89':   'matic-network', // Polygon
  '0x38':   'binancecoin',   // BNB
  '0xa4b1': 'ethereum',      // Arbitrum One (ETH)
  '0xa':    'ethereum',      // Optimism (ETH)
};

@Component({
  selector: 'app-balance-checker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './balance-checker.html',
  styleUrl: './balance-checker.scss',
})
export class BalanceCheckerComponent {
  readonly web3 = inject(Web3Service);

  address = signal('');
  selectedChainId = signal('');
  isLoading = signal(false);
  result = signal<BalanceResult | null>(null);
  error = signal<string | null>(null);

  get networks(): NetworkConfig[] {
    return this.web3.allNetworks();
  }

  get selectedNetwork(): NetworkConfig | undefined {
    return this.networks.find(n => n.chainId === this.selectedChainId());
  }

  isValidAddress(addr: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(addr);
  }

  get canCheck(): boolean {
    return this.isValidAddress(this.address()) && !!this.selectedChainId() && !this.isLoading();
  }

  setAddress(val: any): void {
    this.address.set(val != null ? String(val).trim() : '');
    this.result.set(null);
    this.error.set(null);
  }

  private async fetchPrice(chainId: string): Promise<number | null> {
    const geckoId = COINGECKO_IDS[chainId];
    if (!geckoId) return null; // testnets have no real price
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data[geckoId]?.usd ?? null;
    } catch {
      return null;
    }
  }

  async checkBalance(): Promise<void> {
    const addr = this.address();
    const network = this.selectedNetwork;
    if (!addr || !network) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.result.set(null);

    try {
      // Query all RPCs + price in parallel
      const [rpcResults, priceUsd] = await Promise.all([
        Promise.allSettled(
          network.rpcUrls.map(async (rpcUrl) => {
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const [raw, blockNumber] = await Promise.race([
              Promise.all([provider.getBalance(addr), provider.getBlockNumber()]),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
            ]) as [bigint, number];
            return { balance: raw, blockNumber, rpcUrl };
          })
        ),
        this.fetchPrice(network.chainId),
      ]);

      // Pick RPC result with highest block number
      const successful = rpcResults
        .filter((r): r is PromiseFulfilledResult<{ balance: bigint; blockNumber: number; rpcUrl: string }> =>
          r.status === 'fulfilled'
        )
        .map((r) => r.value)
        .sort((a, b) => b.blockNumber - a.blockNumber);

      if (successful.length === 0) {
        this.error.set(`No se pudo conectar a ningún nodo RPC de ${network.chainName}. Inténtalo de nuevo.`);
        return;
      }

      const best = successful[0];
      const balanceRaw = parseFloat(ethers.formatEther(best.balance));
      const balance = balanceRaw.toFixed(6);
      const valueUsd = priceUsd != null ? balanceRaw * priceUsd : null;

      this.result.set({
        address: addr,
        balance,
        balanceRaw,
        network: network.chainName,
        symbol: network.nativeCurrency.symbol,
        explorerUrl: network.blockExplorerUrls[0]
          ? `${network.blockExplorerUrls[0]}/address/${addr}`
          : '',
        blockNumber: best.blockNumber,
        priceUsd,
        valueUsd,
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  useMyAddress(): void {
    if (this.web3.account()) {
      this.address.set(this.web3.account()!);
      this.result.set(null);
      this.error.set(null);
    }
  }

  formatUsd(value: number): string {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
