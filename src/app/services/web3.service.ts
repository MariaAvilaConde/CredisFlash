import { Injectable, signal, computed } from '@angular/core';
import { BrowserProvider, ethers } from 'ethers';
import {
  NetworkConfig,
  getAllNetworks,
  addCustomNetwork,
  removeCustomNetwork,
  getCustomNetworks,
} from '../models/network.model';
import { Transaction } from '../models/transaction.model';

// ── EIP-6963 types ─────────────────────────────────────────────────────────
export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;   // data URI
  rdns: string;   // reverse-DNS identifier e.g. "io.metamask"
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any;  // EIP-1193 provider
}

// ── Wallet catalog ─────────────────────────────────────────────────────────
export interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: string;       // key for SVG switch in template
  installUrl: string;
  isPopular: boolean;
  rdns?: string;      // EIP-6963 reverse-DNS (used to match discovered providers)
}

export type ErrorType = 'error' | 'warning' | 'info' | null;

declare global {
  interface Window {
    ethereum?: any;
    pali?: any;       // Pali Wallet native UTXO provider
  }
}

// ── Static wallet catalog ──────────────────────────────────────────────────
export const WALLET_CATALOG: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'La wallet más popular para Ethereum y redes EVM',
    icon: 'metamask',
    installUrl: 'https://metamask.io/download/',
    isPopular: true,
    rdns: 'io.metamask',
  },
  {
    id: 'pali',
    name: 'Pali Wallet',
    description: 'Wallet oficial de Syscoin — EVM + UTXO nativo',
    icon: 'pali',
    installUrl: 'https://paliwallet.com/',
    isPopular: true,
    rdns: 'io.paliwallet',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Wallet de Coinbase, fácil y segura',
    icon: 'coinbase',
    installUrl: 'https://www.coinbase.com/wallet',
    isPopular: false,
    rdns: 'com.coinbase.wallet',
  },
  {
    id: 'brave',
    name: 'Brave Wallet',
    description: 'Wallet integrada en el navegador Brave',
    icon: 'brave',
    installUrl: 'https://brave.com/wallet/',
    isPopular: false,
    rdns: 'com.brave.wallet',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    description: 'Multi-chain wallet móvil y de escritorio',
    icon: 'trust',
    installUrl: 'https://trustwallet.com/',
    isPopular: false,
    rdns: 'com.trustwallet.app',
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    description: 'Wallet avanzada para DeFi power users',
    icon: 'rabby',
    installUrl: 'https://rabby.io/',
    isPopular: false,
    rdns: 'io.rabby',
  },
];

@Injectable({ providedIn: 'root' })
export class Web3Service {
  private provider: BrowserProvider | null = null;
  private rawProvider: any = null;
  private providerChainId: string | null = null;

  private eip6963Providers = new Map<string, EIP6963ProviderDetail>();
  readonly discoveredWallets = signal<EIP6963ProviderDetail[]>([]);

  readonly account          = signal<string | null>(null);
  readonly chainId          = signal<string | null>(null);
  readonly balance          = signal<string>('0');
  readonly isConnected      = computed(() => !!this.account());
  readonly transactions     = signal<Transaction[]>([]);
  readonly isLoading        = signal<boolean>(false);
  readonly switchingChainId = signal<string | null>(null);
  readonly errorMessage     = signal<string | null>(null);
  readonly errorType        = signal<ErrorType>(null);
  readonly allNetworks      = signal<NetworkConfig[]>(getAllNetworks());

  constructor() {
    // Start EIP-6963 discovery as soon as the service is created
    this.initEIP6963();
  }

  // ── EIP-6963 Multi-Provider Discovery ─────────────────────────────────────
  private initEIP6963(): void {
    if (typeof window === 'undefined') return;

    // Listen for wallets announcing themselves
    window.addEventListener('eip6963:announceProvider', (event: any) => {
      const detail: EIP6963ProviderDetail = event.detail;
      if (!detail?.info?.rdns) return;
      this.eip6963Providers.set(detail.info.rdns, detail);
      this.discoveredWallets.set([...this.eip6963Providers.values()]);
    });

    // Request all installed wallets to announce
    window.dispatchEvent(new Event('eip6963:requestProvider'));
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  get currentNetwork(): NetworkConfig | undefined {
    return this.allNetworks().find((n) => n.chainId === this.chainId());
  }

  get explorerBaseUrl(): string {
    return this.currentNetwork?.blockExplorerUrls[0] ?? '';
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  hasAnyWallet(): boolean {
    return (
      typeof window !== 'undefined' &&
      (!!window.ethereum || !!window.pali || this.eip6963Providers.size > 0)
    );
  }

  clearError(): void {
    this.errorMessage.set(null);
    this.errorType.set(null);
  }

  /**
   * Check if a wallet from the catalog is available.
   * Priority: EIP-6963 (most reliable) → window.ethereum flags → window.pali
   */
  isWalletDetected(walletId: string): boolean {
    if (typeof window === 'undefined') return false;

    const catalog = WALLET_CATALOG.find((w) => w.id === walletId);

    // 1. EIP-6963 check (most reliable — each wallet announces itself)
    if (catalog?.rdns && this.eip6963Providers.has(catalog.rdns)) return true;

    // 2. Legacy window.ethereum flag checks
    const eth = window.ethereum;
    if (!eth) {
      // 3. Pali native provider (UTXO mode, no window.ethereum)
      if (walletId === 'pali') return !!window.pali;
      return false;
    }

    // Handle multi-provider arrays (some browsers expose window.ethereum.providers[])
    const providers: any[] = eth.providers ?? [eth];

    switch (walletId) {
      case 'metamask':
        return providers.some((p) => p.isMetaMask && !p.isBraveWallet && !p.isCoinbaseWallet);
      case 'pali':
        return !!window.pali || providers.some((p) => p.isPaliWallet || p.isSyscoin);
      case 'coinbase':
        return providers.some((p) => p.isCoinbaseWallet || p.isCoinbaseBrowser);
      case 'brave':
        return providers.some((p) => p.isBraveWallet);
      case 'trust':
        return providers.some((p) => p.isTrust || p.isTrustWallet);
      case 'rabby':
        return providers.some((p) => p.isRabby);
      default:
        return false;
    }
  }

  /**
   * Resolve the correct EIP-1193 provider object for a given wallet ID.
   * EIP-6963 providers are preferred; falls back to window.ethereum / window.pali.
   */
  private resolveProvider(walletId: string): any | null {
    const catalog = WALLET_CATALOG.find((w) => w.id === walletId);

    // 1. EIP-6963 — exact match by rdns
    if (catalog?.rdns) {
      const detail = this.eip6963Providers.get(catalog.rdns);
      if (detail) return detail.provider;
    }

    // 2. Pali native provider
    if (walletId === 'pali' && window.pali) return window.pali;

    // 3. window.ethereum.providers[] array (multiple wallets installed)
    const eth = window.ethereum;
    if (!eth) return null;
    const providers: any[] = eth.providers ?? [eth];

    switch (walletId) {
      case 'metamask':
        return providers.find((p) => p.isMetaMask && !p.isBraveWallet && !p.isCoinbaseWallet) ?? null;
      case 'pali':
        return providers.find((p) => p.isPaliWallet || p.isSyscoin) ?? null;
      case 'coinbase':
        return providers.find((p) => p.isCoinbaseWallet || p.isCoinbaseBrowser) ?? null;
      case 'brave':
        return providers.find((p) => p.isBraveWallet) ?? null;
      case 'trust':
        return providers.find((p) => p.isTrust || p.isTrustWallet) ?? null;
      case 'rabby':
        return providers.find((p) => p.isRabby) ?? null;
      default:
        return eth;
    }
  }

  // ── Connect with a specific wallet ─────────────────────────────────────────
  async connectWithWallet(walletId: string): Promise<boolean> {
    const raw = this.resolveProvider(walletId);
    if (!raw) {
      this.errorMessage.set('Wallet no detectada. Instálala e intenta de nuevo.');
      this.errorType.set('error');
      return false;
    }
    try {
      this.isLoading.set(true);
      this.clearError();

      this.rawProvider = raw;
      this.provider = new BrowserProvider(raw);

      const accounts: string[] = await this.provider.send('eth_requestAccounts', []);
      if (accounts.length === 0) return false;

      this.account.set(accounts[0]);
      const network = await this.provider.getNetwork();
      const cid = '0x' + network.chainId.toString(16);
      this.chainId.set(cid);
      this.providerChainId = cid;
      await this.refreshBalance();
      this.setupListeners(raw);
      return true;
    } catch (err: any) {
      this.setError(err);
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  // ── Legacy connectWallet (uses window.ethereum directly) ──────────────────
  async connectWallet(): Promise<void> {
    const raw = window.ethereum ?? window.pali;
    if (!raw) {
      this.errorMessage.set('No se detectó ninguna wallet. Instala MetaMask o Pali Wallet.');
      this.errorType.set('error');
      return;
    }
    await this.connectWithWallet('metamask');
  }

  async disconnectWallet(): Promise<void> {
    this.account.set(null);
    this.chainId.set(null);
    this.balance.set('0');
    this.transactions.set([]);
    this.provider = null;
    this.rawProvider = null;
    this.providerChainId = null;
    this.clearError();
  }

  // ── Provider management ────────────────────────────────────────────────────
  private refreshProvider(): void {
    const raw = this.rawProvider ?? window.ethereum;
    if (!raw) return;
    this.provider = new BrowserProvider(raw);
    this.providerChainId = this.chainId();
  }

  private getProvider(): BrowserProvider {
    if (!this.provider || this.providerChainId !== this.chainId()) {
      this.refreshProvider();
    }
    return this.provider!;
  }

  async refreshBalance(): Promise<void> {
    if (!this.account()) return;
    try {
      const p = this.getProvider();
      const bal = await p.getBalance(this.account()!);
      this.balance.set(parseFloat(ethers.formatEther(bal)).toFixed(6));
    } catch {
      this.balance.set('0');
    }
  }

  // ── Networks ───────────────────────────────────────────────────────────────
  async switchNetwork(network: NetworkConfig): Promise<void> {
    const raw = this.rawProvider ?? window.ethereum;
    if (!raw) return;
    try {
      this.switchingChainId.set(network.chainId);
      this.clearError();
      await raw.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (switchError: any) {
      const code = switchError?.code ?? switchError?.error?.code;
      if (code === 4902) {
        await this.addNetworkToWallet(network);
      } else {
        this.setError(switchError);
      }
    } finally {
      this.switchingChainId.set(null);
    }
  }

  async addNetworkToWallet(network: NetworkConfig): Promise<void> {
    const raw = this.rawProvider ?? window.ethereum;
    if (!raw) return;
    try {
      this.switchingChainId.set(network.chainId);
      await raw.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: network.chainId,
          chainName: network.chainName,
          nativeCurrency: network.nativeCurrency,
          rpcUrls: network.rpcUrls,
          blockExplorerUrls: network.blockExplorerUrls,
        }],
      });
    } catch (err: any) {
      this.setError(err);
    } finally {
      this.switchingChainId.set(null);
    }
  }

  // Keep old name for backward compat
  async addNetworkToMetaMask(network: NetworkConfig): Promise<void> {
    return this.addNetworkToWallet(network);
  }

  async removeNetwork(network: NetworkConfig): Promise<void> {
    // If this network is currently active, switch to the first available different network
    if (this.chainId() === network.chainId) {
      const fallback = this.allNetworks().find((n) => n.chainId !== network.chainId);
      if (fallback) {
        await this.switchNetwork(fallback);
      }
    }
    // If it's a custom network, also remove it from the list
    if (network.isCustom) {
      this.deleteCustomNetwork(network.chainId);
    }
  }

  async addCustomNetwork(network: NetworkConfig): Promise<void> {
    addCustomNetwork(network);
    this.allNetworks.set(getAllNetworks());
    await this.addNetworkToWallet(network);
  }

  deleteCustomNetwork(chainId: string): void {
    removeCustomNetwork(chainId);
    this.allNetworks.set(getAllNetworks());
  }

  getCustomNetworks(): NetworkConfig[] {
    return getCustomNetworks();
  }

  // ── LocalStorage tx persistence ───────────────────────────────────────────
  private localTxKey(address: string, chainId: string): string {
    return `crediflash_txs_${address.toLowerCase()}_${chainId}`;
  }

  private saveLocalTx(tx: Transaction): void {
    try {
      const key = this.localTxKey(tx.from, tx.networkChainId);
      const stored: Transaction[] = JSON.parse(localStorage.getItem(key) ?? '[]');
      // Avoid duplicates
      const updated = [tx, ...stored.filter((t) => t.hash !== tx.hash)].slice(0, 100);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch { /* ignore storage errors */ }
  }

  private loadLocalTxs(address: string, chainId: string): Transaction[] {
    try {
      const key = this.localTxKey(address, chainId);
      return JSON.parse(localStorage.getItem(key) ?? '[]');
    } catch { return []; }
  }

  private mergeTxLists(local: Transaction[], remote: Transaction[]): Transaction[] {
    const seen = new Set<string>();
    const merged: Transaction[] = [];
    for (const tx of [...remote, ...local]) {
      if (!seen.has(tx.hash)) {
        seen.add(tx.hash);
        merged.push(tx);
      }
    }
    return merged.sort((a, b) => b.timestamp - a.timestamp);
  }

  // ── Transactions ───────────────────────────────────────────────────────────
  async sendTransaction(to: string, amountEth: string): Promise<string | null> {
    if (!this.account()) {
      this.errorMessage.set('Wallet no conectada');
      this.errorType.set('error');
      return null;
    }
    try {
      this.isLoading.set(true);
      this.clearError();
      const p = this.getProvider();
      const signer = await p.getSigner();
      const tx = await signer.sendTransaction({ to, value: ethers.parseEther(String(amountEth)) });
      const receipt = await tx.wait();
      const explorerUrl = `${this.explorerBaseUrl}/tx/${tx.hash}`;
      const newTx: Transaction = {
        hash: tx.hash,
        from: this.account()!,
        to,
        value: amountEth,
        timestamp: Date.now(),
        blockNumber: receipt?.blockNumber ?? 0,
        status: receipt?.status === 1 ? 'success' : 'failed',
        networkChainId: this.chainId() ?? '',
        explorerUrl,
      };
      this.transactions.update((txs) => [newTx, ...txs]);
      this.saveLocalTx(newTx);
      await this.refreshBalance();
      return tx.hash;
    } catch (err: any) {
      this.setError(err);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadTransactionHistory(): Promise<void> {
    if (!this.account()) return;
    const address = this.account()!;
    const chainId = this.chainId() ?? '';
    const network = this.currentNetwork;
    this.isLoading.set(true);
    this.clearError();

    // Show locally stored txs immediately while remote loads
    const localTxs = this.loadLocalTxs(address, chainId);
    if (localTxs.length > 0) {
      this.transactions.set(localTxs);
    } else {
      this.transactions.set([]);
    }

    // Timeout: only abort if no results at all after 30 seconds
    const timeout = setTimeout(() => {
      if (this.isLoading()) {
        this.isLoading.set(false);
        if (this.transactions().length === 0) {
          this.errorMessage.set('La carga tardó demasiado. Pulsa "Actualizar" para reintentar.');
          this.errorType.set('warning');
        }
      }
    }, 30_000);

    try {
      if (network?.explorerApiUrl) {
        try {
          await this.loadHistoryViaApi(address, network);
          // Merge API results with local txs
          const apiTxs = this.transactions();
          this.transactions.set(this.mergeTxLists(localTxs, apiTxs));
        } catch (apiErr: any) {
          console.warn('Explorer API failed, falling back to RPC scan:', apiErr?.message);
          try {
            await this.loadHistoryViaRpc(address);
            const rpcTxs = this.transactions();
            this.transactions.set(this.mergeTxLists(localTxs, rpcTxs));
          } catch {
            // Both failed — at least show local txs
            this.transactions.set(localTxs);
          }
        }
      } else {
        try {
          await this.loadHistoryViaRpc(address);
          const rpcTxs = this.transactions();
          this.transactions.set(this.mergeTxLists(localTxs, rpcTxs));
        } catch {
          this.transactions.set(localTxs);
        }
      }
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.includes('network changed') || err?.code === 'NETWORK_ERROR') {
        this.errorMessage.set('La red cambió durante la carga. Pulsa "Actualizar" para reintentar.');
        this.errorType.set('warning');
      } else {
        this.errorMessage.set('Error al cargar historial: ' + this.parseError(err).message);
        this.errorType.set('error');
      }
    } finally {
      clearTimeout(timeout);
      this.isLoading.set(false);
    }
  }

  private async loadHistoryViaApi(address: string, network: NetworkConfig): Promise<void> {
    const base = network.explorerApiUrl!;
    const keyParam = network.explorerApiKey ? `&apikey=${network.explorerApiKey}` : '';

    // Etherscan V2 uses a single endpoint with chainid param
    const chainIdDecimal = parseInt(network.chainId, 16);
    const chainParam = base.includes('/v2/') ? `&chainid=${chainIdDecimal}` : '';
    const url = `${base}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc${chainParam}${keyParam}`;

    let data: any;
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();

      console.log(`[CredisFlash] Explorer API (attempt ${attempt + 1}):`, data.status, data.message, 'results:', Array.isArray(data.result) ? data.result.length : data.result);

      const isRateLimit = data.status === '0' && (
        String(data.result).toLowerCase().includes('rate') ||
        String(data.message).toLowerCase().includes('rate')
      );
      if (isRateLimit && attempt === 0) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      break;
    }

    if (Array.isArray(data.result) && data.result.length > 0) {
      const explorerBase = network.blockExplorerUrls[0];
      this.transactions.set(
        data.result.map((item: any) => ({
          hash: item.hash,
          from: item.from,
          to: item.to,
          value: parseFloat(ethers.formatEther(item.value ?? '0')).toFixed(6),
          timestamp: parseInt(item.timeStamp, 10) * 1000,
          blockNumber: parseInt(item.blockNumber, 10),
          status: item.isError === '0' ? 'success' : 'failed',
          networkChainId: this.chainId() ?? '',
          explorerUrl: `${explorerBase}/tx/${item.hash}`,
        }))
      );
      return;
    }

    if (data.message === 'No transactions found') {
      this.transactions.set([]);
      return;
    }

    if (data.status === '0') {
      throw new Error(`API error: ${data.message ?? 'unknown'}`);
    }

    this.transactions.set([]);
  }

  private async loadHistoryViaRpc(address: string): Promise<void> {
    const p = this.getProvider();
    const snapshotChainId = this.chainId();
    const currentBlock = await p.getBlockNumber();

    const SCAN_BLOCKS = 500;
    const BATCH_SIZE = 5;
    const fromBlock = Math.max(0, currentBlock - SCAN_BLOCKS);
    const blockNums: number[] = [];
    for (let i = currentBlock; i >= fromBlock; i--) blockNums.push(i);

    const addrLower = address.toLowerCase();
    const txList: Transaction[] = [];
    const seenHashes = new Set<string>();

    for (let b = 0; b < blockNums.length && txList.length < 25; b += BATCH_SIZE) {
      if (this.chainId() !== snapshotChainId) break;

      const batch = blockNums.slice(b, b + BATCH_SIZE);

      // Fetch block headers only (prefetchTxs=false) to get tx hashes cheaply
      const blocks = await Promise.all(
        batch.map((n) => p.getBlock(n, false).catch(() => null))
      );

      for (const block of blocks) {
        if (!block?.transactions?.length) continue;
        if (this.chainId() !== snapshotChainId) break;

        // Fetch all txs in the block in parallel
        const txResults = await Promise.all(
          block.transactions.map((h) =>
            typeof h === 'string'
              ? p.getTransaction(h).catch(() => null)
              : Promise.resolve(h as any)
          )
        );

        const relevant = txResults.filter(
          (tx) =>
            tx &&
            !seenHashes.has(tx.hash) &&
            (tx.from?.toLowerCase() === addrLower || tx.to?.toLowerCase() === addrLower)
        );

        for (const tx of relevant) {
          if (!tx || seenHashes.has(tx.hash)) continue;
          seenHashes.add(tx.hash);
          const receipt = await p.getTransactionReceipt(tx.hash).catch(() => null);
          txList.push({
            hash: tx.hash,
            from: tx.from ?? '',
            to: tx.to ?? '',
            value: parseFloat(ethers.formatEther(tx.value ?? 0n)).toFixed(6),
            timestamp: (block.timestamp ?? 0) * 1000,
            blockNumber: tx.blockNumber ?? block.number ?? 0,
            status: receipt?.status === 1 ? 'success' : 'failed',
            networkChainId: this.chainId() ?? '',
            explorerUrl: `${this.explorerBaseUrl}/tx/${tx.hash}`,
          });
          if (txList.length >= 25) break;
        }

        if (txList.length >= 25) break;
      }

      // Show partial results progressively
      if (txList.length > 0) {
        this.transactions.set([...txList]);
      }
    }

    this.transactions.set([...txList]);
  }

  // ── Error handling ─────────────────────────────────────────────────────────
  private parseError(err: any): { message: string; type: ErrorType } {
    const providerErr = err?.error ?? err?.info?.error ?? err;
    const code: number | string = providerErr?.code ?? err?.code;
    switch (code) {
      case 4001:        return { message: 'Solicitud rechazada. Puedes intentarlo de nuevo cuando quieras.', type: 'warning' };
      case 4100:        return { message: 'Cuenta no autorizada. Desbloquea la wallet e inténtalo de nuevo.', type: 'error' };
      case 4200:        return { message: 'Método no soportado por este proveedor.', type: 'error' };
      case 4900:        return { message: 'Wallet desconectada. Comprueba tu conexión a internet.', type: 'error' };
      case 4901:        return { message: 'La red seleccionada no está disponible.', type: 'error' };
      case 4902:        return { message: 'Red no encontrada. Se añadirá automáticamente.', type: 'info' };
      case 'ACTION_REJECTED': return { message: 'Acción rechazada. Puedes intentarlo de nuevo cuando quieras.', type: 'warning' };
      case -32000:      return { message: 'Fondos insuficientes (incluye gas fees).', type: 'error' };
      case -32603:      return { message: 'Error interno del proveedor. Inténtalo de nuevo.', type: 'error' };
      default: {
        const raw: string = providerErr?.message ?? err?.message ?? '';
        const clean = raw.replace(/^ethers-user-denied:\s*/i, '').trim();
        return { message: clean || 'Ocurrió un error inesperado. Inténtalo de nuevo.', type: 'error' };
      }
    }
  }

  private setError(err: any): void {
    const { message, type } = this.parseError(err);
    this.errorMessage.set(message);
    this.errorType.set(type);
  }

  // ── Listeners ──────────────────────────────────────────────────────────────
  private setupListeners(raw: any): void {
    if (!raw) return;
    raw.removeAllListeners?.('accountsChanged');
    raw.removeAllListeners?.('chainChanged');

    raw.on?.('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) this.disconnectWallet();
      else { this.account.set(accounts[0]); this.refreshBalance(); }
    });

    raw.on?.('chainChanged', (chainId: string) => {
      const normalized = chainId.startsWith('0x')
        ? chainId
        : '0x' + parseInt(chainId, 10).toString(16);
      this.chainId.set(normalized);
      this.refreshProvider();
      this.transactions.set([]);
      this.clearError();
      this.refreshBalance();
    });
  }
}
