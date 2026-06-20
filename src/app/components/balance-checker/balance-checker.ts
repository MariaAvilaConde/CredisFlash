import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ethers } from 'ethers';
import { Web3Service } from '../../services/web3.service';
import { ToastService } from '../../services/toast.service';
import { NetworkConfig } from '../../models/network.model';

export interface BalanceResult {
  chainId: string;
  network: string;
  symbol: string;
  icon: string;
  balance: string;
  balanceRaw: number;
  blockNumber: number;
  priceUsd: number | null;
  valueUsd: number | null;
  explorerUrl: string;
  status: 'success' | 'error' | 'loading';
  error?: string;
}

// CoinGecko IDs for mainnets with real USD value
const COINGECKO_IDS: Record<string, string> = {
  '0x1':    'ethereum',
  '0x89':   'matic-network',
  '0x38':   'binancecoin',
  '0xa4b1': 'ethereum',
  '0xa':    'ethereum',
};

const NETWORK_ICONS: Record<string, string> = {
  '0xaa36a7': '🔵', '0x88bb0': '🟣', '0x1389': '🟡',
  '0x13882':  '🟠', '0x61':    '🟤', '0xa869': '🔴',
  '0x66eee':  '🔷', '0xaa37dc':'🔴', '0x1':    '⬡',
  '0x89':     '🟣', '0x38':    '🟡', '0xa4b1': '🔷', '0xa': '🔴',
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
  readonly toast = inject(ToastService);

  // ── Mode ─────────────────────────────────────────────────────────────────
  mode = signal<'single' | 'multi'>('single');

  // ── Shared ───────────────────────────────────────────────────────────────
  address = signal('');

  // ── Single mode ──────────────────────────────────────────────────────────
  selectedChainId = signal('');
  singleResult = signal<BalanceResult | null>(null);
  singleLoading = signal(false);
  singleError = signal<string | null>(null);

  // ── Multi mode ───────────────────────────────────────────────────────────
  selectedChainIds = signal<Set<string>>(new Set());
  multiResults = signal<BalanceResult[]>([]);
  multiLoading = signal(false);

  readonly multiTotalUsd = computed(() =>
    this.multiResults()
      .filter(r => r.status === 'success' && r.valueUsd != null)
      .reduce((sum, r) => sum + (r.valueUsd ?? 0), 0)
  );

  readonly multiHasUsd = computed(() =>
    this.multiResults().some(r => r.valueUsd != null && r.valueUsd > 0)
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  get networks(): NetworkConfig[] {
    return this.web3.allNetworks();
  }

  get selectedNetwork(): NetworkConfig | undefined {
    return this.networks.find(n => n.chainId === this.selectedChainId());
  }

  isValidAddress(addr: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(addr);
  }

  setAddress(val: any): void {
    this.address.set(val != null ? String(val).trim() : '');
    this.singleResult.set(null);
    this.singleError.set(null);
    this.multiResults.set([]);
  }

  useMyAddress(): void {
    if (this.web3.account()) {
      this.address.set(this.web3.account()!);
      this.singleResult.set(null);
      this.singleError.set(null);
      this.multiResults.set([]);
    }
  }

  getIcon(chainId: string): string {
    return NETWORK_ICONS[chainId] ?? '🌐';
  }

  // ── Multi selection ───────────────────────────────────────────────────────
  isSelected(chainId: string): boolean {
    return this.selectedChainIds().has(chainId);
  }

  toggleNetwork(chainId: string): void {
    const s = new Set(this.selectedChainIds());
    s.has(chainId) ? s.delete(chainId) : s.add(chainId);
    this.selectedChainIds.set(s);
  }

  selectAll(): void {
    this.selectedChainIds.set(new Set(this.networks.map(n => n.chainId)));
  }

  selectNone(): void {
    this.selectedChainIds.set(new Set());
  }

  selectTestnets(): void {
    const testKeywords = ['test', 'sepolia', 'hoodi', 'fuji', 'amoy', 'mumbai'];
    const ids = this.networks
      .filter(n => testKeywords.some(k => n.chainName.toLowerCase().includes(k)))
      .map(n => n.chainId);
    this.selectedChainIds.set(new Set(ids));
  }

  selectMainnets(): void {
    const testKeywords = ['test', 'sepolia', 'hoodi', 'fuji', 'amoy', 'mumbai'];
    const ids = this.networks
      .filter(n => !testKeywords.some(k => n.chainName.toLowerCase().includes(k)) && !n.isCustom)
      .map(n => n.chainId);
    this.selectedChainIds.set(new Set(ids));
  }

  // ── Price fetcher ─────────────────────────────────────────────────────────
  private priceCache = new Map<string, { price: number; ts: number }>();

  private async fetchPrice(chainId: string): Promise<number | null> {
    const geckoId = COINGECKO_IDS[chainId];
    if (!geckoId) return null;

    // Cache 60s
    const cached = this.priceCache.get(geckoId);
    if (cached && Date.now() - cached.ts < 60_000) return cached.price;

    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const price = data[geckoId]?.usd ?? null;
      if (price) this.priceCache.set(geckoId, { price, ts: Date.now() });
      return price;
    } catch {
      return null;
    }
  }

  // ── RPC balance ───────────────────────────────────────────────────────────
  private async fetchBalanceForNetwork(
    addr: string,
    network: NetworkConfig
  ): Promise<{ balance: bigint; blockNumber: number }> {
    const results = await Promise.allSettled(
      network.rpcUrls.map(async (rpcUrl) => {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const [balance, blockNumber] = await Promise.race([
          Promise.all([provider.getBalance(addr), provider.getBlockNumber()]),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
        ]) as [bigint, number];
        return { balance, blockNumber };
      })
    );

    const best = results
      .filter((r): r is PromiseFulfilledResult<{ balance: bigint; blockNumber: number }> =>
        r.status === 'fulfilled'
      )
      .sort((a, b) => b.value.blockNumber - a.value.blockNumber)[0];

    if (!best) throw new Error('No RPC responded');
    return best.value;
  }

  // ── Single mode query ─────────────────────────────────────────────────────
  async checkBalance(): Promise<void> {
    const addr = this.address();
    const network = this.selectedNetwork;
    if (!addr || !network) return;

    this.singleLoading.set(true);
    this.singleError.set(null);
    this.singleResult.set(null);

    try {
      const [{ balance, blockNumber }, priceUsd] = await Promise.all([
        this.fetchBalanceForNetwork(addr, network),
        this.fetchPrice(network.chainId),
      ]);

      const balanceRaw = parseFloat(ethers.formatEther(balance));
      const valueUsd = priceUsd != null ? balanceRaw * priceUsd : null;

      this.singleResult.set({
        chainId: network.chainId,
        network: network.chainName,
        symbol: network.nativeCurrency.symbol,
        icon: this.getIcon(network.chainId),
        balance: balanceRaw.toFixed(6),
        balanceRaw,
        blockNumber,
        priceUsd,
        valueUsd,
        explorerUrl: network.blockExplorerUrls[0]
          ? `${network.blockExplorerUrls[0]}/address/${addr}` : '',
        status: 'success',
      });
    } catch {
      this.singleError.set(`No se pudo conectar a ningún nodo RPC de ${network.chainName}.`);
    } finally {
      this.singleLoading.set(false);
    }
  }

  // ── Multi mode query ──────────────────────────────────────────────────────
  async checkAllBalances(): Promise<void> {
    const addr = this.address();
    const chainIds = this.selectedChainIds();
    if (!addr || chainIds.size === 0) return;

    const networksToQuery = this.networks.filter(n => chainIds.has(n.chainId));

    // Init results as loading
    this.multiResults.set(networksToQuery.map(n => ({
      chainId: n.chainId,
      network: n.chainName,
      symbol: n.nativeCurrency.symbol,
      icon: this.getIcon(n.chainId),
      balance: '—',
      balanceRaw: 0,
      blockNumber: 0,
      priceUsd: null,
      valueUsd: null,
      explorerUrl: '',
      status: 'loading' as const,
    })));

    this.multiLoading.set(true);

    // Fetch all prices once (deduplicated by geckoId)
    const uniqueGeckoIds = [...new Set(networksToQuery.map(n => COINGECKO_IDS[n.chainId]).filter(Boolean))];
    const priceMap = new Map<string, number>();
    await Promise.allSettled(
      uniqueGeckoIds.map(async (geckoId) => {
        const p = await this.fetchPrice(
          Object.entries(COINGECKO_IDS).find(([, v]) => v === geckoId)?.[0] ?? ''
        );
        if (p) priceMap.set(geckoId, p);
      })
    );

    // Fetch balances in parallel, update results as each comes in
    await Promise.allSettled(
      networksToQuery.map(async (network) => {
        try {
          const { balance, blockNumber } = await this.fetchBalanceForNetwork(addr, network);
          const balanceRaw = parseFloat(ethers.formatEther(balance));
          const geckoId = COINGECKO_IDS[network.chainId];
          const priceUsd = geckoId ? (priceMap.get(geckoId) ?? null) : null;
          const valueUsd = priceUsd != null ? balanceRaw * priceUsd : null;

          this.multiResults.update(list =>
            list.map(r => r.chainId === network.chainId ? {
              ...r,
              balance: balanceRaw.toFixed(6),
              balanceRaw,
              blockNumber,
              priceUsd,
              valueUsd,
              explorerUrl: network.blockExplorerUrls[0]
                ? `${network.blockExplorerUrls[0]}/address/${addr}` : '',
              status: 'success' as const,
            } : r)
          );
        } catch {
          this.multiResults.update(list =>
            list.map(r => r.chainId === network.chainId ? {
              ...r, status: 'error' as const, error: 'RPC no disponible',
            } : r)
          );
        }
      })
    );

    this.multiLoading.set(false);
    const ok = this.multiResults().filter(r => r.status === 'success').length;
    this.toast.success(`Consulta completada: ${ok}/${networksToQuery.length} redes`);
  }

  formatUsd(value: number): string {
    return value.toLocaleString('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
  }

  copyAddress(): void {
    const addr = this.address();
    if (!addr) return;
    navigator.clipboard.writeText(addr).then(() => this.toast.success('Dirección copiada'));
  }
}
