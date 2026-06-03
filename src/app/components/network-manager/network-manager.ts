import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Web3Service } from '../../services/web3.service';
import { UiService } from '../../services/ui.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { NetworkConfig, SUPPORTED_NETWORKS } from '../../models/network.model';

@Component({
  selector: 'app-network-manager',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './network-manager.html',
  styleUrl: './network-manager.scss',
})
export class NetworkManagerComponent {
  readonly web3 = inject(Web3Service);
  readonly ui = inject(UiService);
  readonly toast = inject(ToastService);
  readonly confirm = inject(ConfirmService);

  // Tab: 'all' | 'testnet' | 'mainnet' | 'custom'
  readonly activeTab = signal<'all' | 'testnet' | 'mainnet' | 'custom'>('all');
  readonly showAddForm = signal(false);

  // Custom network form
  readonly form = signal<Partial<NetworkConfig>>({
    chainId: '',
    chainName: '',
    nativeCurrency: { name: '', symbol: '', decimals: 18 },
    rpcUrls: [''],
    blockExplorerUrls: [''],
    explorerApiUrl: '',
  });

  readonly formError = signal<string | null>(null);

  // ── Computed lists ─────────────────────────────────────────────────────────
  readonly builtinNetworks = SUPPORTED_NETWORKS;

  readonly testnets = computed(() =>
    this.web3.allNetworks().filter(
      (n) => !n.isCustom && (
        n.chainName.toLowerCase().includes('test') ||
        n.chainName.toLowerCase().includes('sepolia') ||
        n.chainName.toLowerCase().includes('hoodi') ||
        n.chainName.toLowerCase().includes('fuji') ||
        n.chainName.toLowerCase().includes('amoy') ||
        n.chainName.toLowerCase().includes('mumbai')
      )
    )
  );

  readonly mainnets = computed(() =>
    this.web3.allNetworks().filter(
      (n) => !n.isCustom && !this.testnets().includes(n)
    )
  );

  readonly customNets = computed(() =>
    this.web3.allNetworks().filter((n) => n.isCustom)
  );

  readonly displayedNetworks = computed(() => {
    switch (this.activeTab()) {
      case 'testnet': return this.testnets();
      case 'mainnet': return this.mainnets();
      case 'custom':  return this.customNets();
      default:        return this.web3.allNetworks();
    }
  });

  // ── Network actions ────────────────────────────────────────────────────────
  isActive(network: NetworkConfig): boolean {
    return this.web3.chainId() === network.chainId;
  }

  isSwitching(network: NetworkConfig): boolean {
    return this.web3.switchingChainId() === network.chainId;
  }

  async switchTo(network: NetworkConfig): Promise<void> {
    this.toast.info(`Cambiando a ${network.chainName}…`);
    await this.web3.switchNetwork(network);
    if (!this.web3.errorMessage()) {
      this.toast.success(`Conectado a ${network.chainName}`);
    } else {
      this.toast.error(this.web3.errorMessage()!);
    }
  }

  async remove(network: NetworkConfig): Promise<void> {
    if (!this.isActive(network)) return;
    const ok = await this.confirm.open({
      title: 'Desconectar red',
      message: `¿Cambiar de red y desconectarte de "${network.chainName}"? Tu wallet seguirá conectada.`,
      confirmLabel: 'Desconectar',
      cancelLabel: 'Cancelar',
      type: 'warning',
    });
    if (ok) {
      await this.web3.removeNetwork(network);
      if (!this.web3.errorMessage()) {
        this.toast.info(`Desconectado de ${network.chainName}`);
      }
    }
  }

  deleteCustom(network: NetworkConfig): void {
    this.confirm.open({
      title: 'Eliminar red',
      message: `¿Eliminar la red personalizada "${network.chainName}" de la lista?`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      type: 'danger',
    }).then((ok) => {
      if (ok) {
        this.web3.deleteCustomNetwork(network.chainId);
        this.toast.warning(`Red "${network.chainName}" eliminada`);
      }
    });
  }

  async connect(): Promise<void> {
    this.ui.openWalletModal();
  }

  // ── Add custom network ─────────────────────────────────────────────────────
  updateForm(field: string, value: any): void {
    this.form.update((f) => {
      if (field === 'symbol') {
        return { ...f, nativeCurrency: { ...f.nativeCurrency!, symbol: value, name: value, decimals: 18 } };
      }
      if (field === 'rpcUrl') {
        return { ...f, rpcUrls: [value] };
      }
      if (field === 'explorerUrl') {
        return { ...f, blockExplorerUrls: [value] };
      }
      return { ...f, [field]: value };
    });
  }

  async submitCustomNetwork(): Promise<void> {
    this.formError.set(null);
    const f = this.form();

    if (!f.chainId?.trim()) { this.formError.set('El Chain ID es obligatorio (ej: 0x1234)'); return; }
    if (!f.chainId.startsWith('0x')) { this.formError.set('El Chain ID debe empezar con 0x'); return; }
    if (!f.chainName?.trim()) { this.formError.set('El nombre de la red es obligatorio'); return; }
    if (!f.nativeCurrency?.symbol?.trim()) { this.formError.set('El símbolo de la moneda es obligatorio'); return; }
    if (!f.rpcUrls?.[0]?.trim()) { this.formError.set('La URL RPC es obligatoria'); return; }

    const exists = this.web3.allNetworks().some((n) => n.chainId === f.chainId);
    if (exists) { this.formError.set('Ya existe una red con ese Chain ID'); return; }

    const newNet: NetworkConfig = {
      chainId: f.chainId!.trim().toLowerCase(),
      chainName: f.chainName!.trim(),
      nativeCurrency: {
        name: f.nativeCurrency!.symbol!.trim(),
        symbol: f.nativeCurrency!.symbol!.trim(),
        decimals: 18,
      },
      rpcUrls: [f.rpcUrls![0].trim()],
      blockExplorerUrls: f.blockExplorerUrls?.[0]?.trim() ? [f.blockExplorerUrls[0].trim()] : [],
      explorerApiUrl: f.explorerApiUrl?.trim() || undefined,
      isCustom: true,
    };

    await this.web3.addCustomNetwork(newNet);
    this.toast.success(`Red "${newNet.chainName}" añadida y conectada`);
    this.showAddForm.set(false);
    this.activeTab.set('custom');
    this.form.set({ chainId: '', chainName: '', nativeCurrency: { name: '', symbol: '', decimals: 18 }, rpcUrls: [''], blockExplorerUrls: [''], explorerApiUrl: '' });
  }

  // ── Icons ──────────────────────────────────────────────────────────────────
  getNetworkIcon(chainId: string): string {
    const icons: Record<string, string> = {
      '0xaa36a7': '🔵', // Sepolia
      '0x88bb0':  '🟣', // Hoodi
      '0x1389':   '🟡', // zkSYS
      '0x13882':  '🟠', // Polygon Amoy
      '0x61':     '🟤', // BSC Testnet
      '0xa869':   '🔴', // Avalanche Fuji
      '0x66eee':  '🔷', // Arbitrum Sepolia
      '0xaa37dc': '🔴', // Optimism Sepolia
      '0x1':      '⬡',  // Ethereum
      '0x89':     '🟣', // Polygon
      '0x38':     '🟡', // BSC
      '0xa4b1':   '🔷', // Arbitrum
      '0xa':      '🔴', // Optimism
    };
    return icons[chainId] ?? '🌐';
  }
}
