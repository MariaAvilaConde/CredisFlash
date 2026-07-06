import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ethers } from 'ethers';
import { SUPPORTED_NETWORKS } from '../../models/network.model';
import { Web3Service } from '../../services/web3.service';
import { ToastService } from '../../services/toast.service';

export interface FaucetWallet {
  name: string;
  address: string;
  chainId: string;
  networkName: string;
  symbol: string;
  icon: string;
  explorerBase: string;
}

export interface FaucetTx {
  hash: string;
  to: string;
  value: string;
  symbol: string;
  blockNumber: number;
  timestamp: number;
  explorerUrl: string;
  status: 'success' | 'failed';
}

// Known public faucet wallet addresses verified from live blockchain data
export const FAUCET_WALLETS: FaucetWallet[] = [
  {
    name: 'Sepolia PoW Faucet (pk910)',
    address: '0x6cc9397c3b38739dacbfaa68ead5f5d77ba5f455',
    chainId: '0xaa36a7',
    networkName: 'Sepolia Testnet',
    symbol: 'ETH',
    icon: '🔵',
    explorerBase: 'https://sepolia.etherscan.io',
  },
  {
    name: 'Sepolia Faucet',
    address: '0x0ca3aa8edae25c590e7b901d104a943a20832f11',
    chainId: '0xaa36a7',
    networkName: 'Sepolia Testnet',
    symbol: 'ETH',
    icon: '🔵',
    explorerBase: 'https://sepolia.etherscan.io',
  },
  {
    name: 'Hoodi PoW Faucet (pk910)',
    address: '0x6cc9397c3b38739dacbfaa68ead5f5d77ba5f455',
    chainId: '0x88bb0',
    networkName: 'Hoodi Testnet',
    symbol: 'ETH',
    icon: '🟣',
    explorerBase: 'https://hoodi.etherscan.io',
  },
  {
    name: 'Polygon Amoy Faucet',
    address: '0xdf854a41900b9010e3bd12b31581c380f2d291b4',
    chainId: '0x13882',
    networkName: 'Polygon Amoy',
    symbol: 'MATIC',
    icon: '🟠',
    explorerBase: 'https://amoy.polygonscan.com',
  },
  {
    name: 'Arbitrum Sepolia Faucet (pk910)',
    address: '0x6cc9397c3b38739dacbfaa68ead5f5d77ba5f455',
    chainId: '0x66eee',
    networkName: 'Arbitrum Sepolia',
    symbol: 'ETH',
    icon: '🔷',
    explorerBase: 'https://sepolia.arbiscan.io',
  },
];

@Component({
  selector: 'app-faucet-history',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './faucet-history.html',
  styleUrl: './faucet-history.scss',
})
export class FaucetHistoryComponent {
  readonly web3 = inject(Web3Service);
  readonly toast = inject(ToastService);

  // ── Filters ───────────────────────────────────────────────────────────────
  selectedChainId = signal('');
  selectedFaucetAddr = signal('');
  filterAddress = signal('');      // filter results by recipient address

  // ── State ─────────────────────────────────────────────────────────────────
  isLoading = signal(false);
  transactions = signal<FaucetTx[]>([]);
  error = signal<string | null>(null);
  lastScannedBlocks = signal(0);
  scanProgress = signal(0); // 0-100

  readonly faucetWallets = FAUCET_WALLETS;

  // Unique chain ids present in FAUCET_WALLETS
  readonly availableChains = computed(() => {
    const seen = new Map<string, { chainId: string; networkName: string; icon: string }>();
    for (const w of this.faucetWallets) {
      if (!seen.has(w.chainId)) {
        seen.set(w.chainId, { chainId: w.chainId, networkName: w.networkName, icon: w.icon });
      }
    }
    return [...seen.values()];
  });

  readonly walletsForChain = computed(() =>
    this.faucetWallets.filter(w => w.chainId === this.selectedChainId())
  );

  readonly selectedWallet = computed(() =>
    this.faucetWallets.find(
      w => w.address === this.selectedFaucetAddr() && w.chainId === this.selectedChainId()
    )
  );

  readonly filteredTxs = computed(() => {
    const filter = this.filterAddress().toLowerCase().trim();
    if (!filter) return this.transactions();
    return this.transactions().filter(tx => tx.to.toLowerCase().includes(filter));
  });

  // ── Auto-select connected network ─────────────────────────────────────────
  constructor() {
    effect(() => {
      const chainId = this.web3.chainId();
      if (chainId && this.availableChains().some(c => c.chainId === chainId)) {
        // Only auto-select if user hasn't already chosen a chain
        if (!this.selectedChainId()) {
          this.selectedChainId.set(chainId);
          // Auto-select the first faucet for that chain
          const firstWallet = this.faucetWallets.find(w => w.chainId === chainId);
          if (firstWallet) {
            this.selectedFaucetAddr.set(firstWallet.address);
          }
        }
      }
    });
  }

  // ── Event handlers ────────────────────────────────────────────────────────
  onChainChange(chainId: string): void {
    this.selectedChainId.set(chainId);
    this.selectedFaucetAddr.set('');
    this.transactions.set([]);
    this.error.set(null);
    this.filterAddress.set('');

    // Auto-select first faucet for this chain
    const firstWallet = this.faucetWallets.find(w => w.chainId === chainId);
    if (firstWallet) {
      this.selectedFaucetAddr.set(firstWallet.address);
    }
  }

  onFaucetChange(addr: string): void {
    this.selectedFaucetAddr.set(addr);
    this.transactions.set([]);
    this.error.set(null);
  }

  isValidAddress(addr: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(addr);
  }

  get canLoad(): boolean {
    return !!this.selectedChainId() && !!this.selectedFaucetAddr() && !this.isLoading();
  }

  shortHash(h: string): string { return h.slice(0, 10) + '…' + h.slice(-8); }
  shortAddr(a: string): string { return a.slice(0, 8) + '…' + a.slice(-6); }

  // ── Load history ──────────────────────────────────────────────────────────
  async loadHistory(): Promise<void> {
    const wallet = this.selectedWallet();
    if (!wallet) return;

    const network = SUPPORTED_NETWORKS.find(n => n.chainId === wallet.chainId);
    if (!network) { this.error.set('Red no encontrada.'); return; }

    this.isLoading.set(true);
    this.error.set(null);
    this.transactions.set([]);
    this.scanProgress.set(0);

    // Global timeout — abort after 45s, show partial results
    const controller = { cancelled: false };
    const timeout = setTimeout(() => {
      controller.cancelled = true;
      if (this.isLoading()) {
        this.isLoading.set(false);
        if (this.transactions().length === 0) {
          this.error.set(
            'La búsqueda tardó demasiado. El RPC de esta red es lento — intenta de nuevo.'
          );
        }
      }
    }, 45_000);

    const SCAN_BLOCKS = 300;  // enough to cover ~1h of blocks
    const BATCH = 15;

    try {
      // Connect to fastest RPC
      let provider: ethers.JsonRpcProvider | null = null;
      for (const rpc of network.rpcUrls) {
        try {
          const p = new ethers.JsonRpcProvider(rpc);
          await Promise.race([
            p.getBlockNumber(),
            new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 5000)),
          ]);
          provider = p;
          break;
        } catch { /* try next */ }
      }

      if (!provider) throw new Error('No se pudo conectar a ningún RPC de esta red.');

      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - SCAN_BLOCKS);
      const blockNums: number[] = [];
      for (let i = currentBlock; i >= fromBlock; i--) blockNums.push(i);

      const faucetAddrLower = wallet.address.toLowerCase();
      const txList: FaucetTx[] = [];
      const seen = new Set<string>();

      for (
        let b = 0;
        b < blockNums.length && txList.length < 50 && !controller.cancelled;
        b += BATCH
      ) {
        const batch = blockNums.slice(b, b + BATCH);

        // Fetch full blocks (prefetchTxs=true) — includes all tx data
        const blocks = await Promise.all(
          batch.map(n =>
            Promise.race([
              provider!.getBlock(n, true),
              new Promise<null>((r) => setTimeout(() => r(null), 5000)),
            ])
          )
        );

        for (const block of blocks) {
          if (!block?.prefetchedTransactions?.length) continue;

          for (const tx of block.prefetchedTransactions) {
            if (!tx || seen.has(tx.hash)) continue;
            if (tx.from?.toLowerCase() !== faucetAddrLower) continue;

            seen.add(tx.hash);
            txList.push({
              hash: tx.hash,
              to: tx.to ?? '',
              value: parseFloat(ethers.formatEther(tx.value ?? 0n)).toFixed(6),
              symbol: wallet.symbol,
              blockNumber: tx.blockNumber ?? block.number ?? 0,
              timestamp: (block.timestamp ?? 0) * 1000,
              explorerUrl: `${wallet.explorerBase}/tx/${tx.hash}`,
              status: 'success',
            });

            if (txList.length >= 50) break;
          }
          if (txList.length >= 50) break;
        }

        // Progressive update
        if (txList.length > 0) this.transactions.set([...txList]);
        this.scanProgress.set(Math.round(((b + BATCH) / blockNums.length) * 100));
      }

      clearTimeout(timeout);
      this.lastScannedBlocks.set(SCAN_BLOCKS);
      this.transactions.set([...txList]);

      if (txList.length === 0) {
        this.toast.info(`No se encontraron solicitudes en los últimos ${SCAN_BLOCKS} bloques.`);
      } else {
        this.toast.success(`${txList.length} solicitud(es) encontrada(s)`);
      }
    } catch (err: any) {
      clearTimeout(timeout);
      this.error.set(err?.message ?? 'Error al cargar el historial.');
      this.toast.error(this.error()!);
    } finally {
      clearTimeout(timeout);
      this.isLoading.set(false);
    }
  }
}
