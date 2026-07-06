import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Web3Service } from '../../services/web3.service';
import { ToastService } from '../../services/toast.service';
import { FaucetService, FaucetNetwork, FaucetResult, FAUCET_NETWORKS } from '../../services/faucet.service';

@Component({
  selector: 'app-faucet',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './faucet.html',
  styleUrl: './faucet.scss',
})
export class FaucetComponent {
  readonly web3 = inject(Web3Service);
  readonly toast = inject(ToastService);
  readonly faucetSvc = inject(FaucetService);

  address = signal('');
  selectedChainId = signal('');

  // Result of last successful send
  lastResult = signal<FaucetResult | null>(null);

  // Cooldown timer refresh tick (every second)
  private tick = signal(0);

  // ── All supported faucet networks ─────────────────────────────────────────
  readonly networks: FaucetNetwork[] = FAUCET_NETWORKS;

  readonly selectedNetwork = computed(() =>
    this.networks.find(n => n.chainId === this.selectedChainId())
  );

  // Pre-select network from connected wallet
  constructor() {
    effect(() => {
      const chainId = this.web3.chainId();
      if (chainId && this.networks.some(n => n.chainId === chainId)) {
        this.selectedChainId.set(chainId);
      }
    });

    // Tick every second to update cooldown displays reactively
    setInterval(() => this.tick.update(v => v + 1), 1000);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isValidAddress(addr: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(addr);
  }

  setAddress(val: any): void {
    this.address.set(val != null ? String(val).trim() : '');
    this.lastResult.set(null);
    this.faucetSvc.errorMessage.set(null);
  }

  useMyAddress(): void {
    if (this.web3.account()) {
      this.address.set(this.web3.account()!);
      this.lastResult.set(null);
    }
  }

  copyAddress(): void {
    const addr = this.address();
    if (!addr) return;
    navigator.clipboard.writeText(addr).then(() => {
      this.toast.success('Dirección copiada al portapapeles');
    });
  }

  // ── Cooldown helpers (reactive via tick signal) ───────────────────────────
  cooldownRemaining(network: FaucetNetwork): number {
    this.tick(); // subscribe to tick so this recomputes each second
    return this.faucetSvc.cooldownRemaining(network, this.address());
  }

  cooldownLabel(network: FaucetNetwork): string {
    const ms = this.cooldownRemaining(network);
    return ms > 0 ? this.faucetSvc.formatCooldown(ms) : '';
  }

  canClaim(network: FaucetNetwork): boolean {
    return (
      this.isValidAddress(this.address()) &&
      !!this.selectedChainId() &&
      !this.faucetSvc.isSending() &&
      this.faucetSvc.canClaim(network, this.address())
    );
  }

  get canSend(): boolean {
    const net = this.selectedNetwork();
    if (!net) return false;
    return this.canClaim(net);
  }

  // ── Main action ───────────────────────────────────────────────────────────
  async requestTokens(): Promise<void> {
    const net = this.selectedNetwork();
    const addr = this.address();
    if (!net || !this.isValidAddress(addr)) return;

    this.lastResult.set(null);
    this.toast.info(`Enviando ${net.label} a ${addr.slice(0, 8)}…`);

    const result = await this.faucetSvc.sendTokens(net, addr);

    if (result) {
      this.lastResult.set(result);
      this.toast.success(`¡${result.amount} enviados a tu dirección!`);
    } else if (this.faucetSvc.errorMessage()) {
      this.toast.error(this.faucetSvc.errorMessage()!);
    }
  }
}
