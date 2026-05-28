import { Component, EventEmitter, HostListener, inject, Output, signal, ViewEncapsulation } from '@angular/core';
import { Web3Service, WALLET_CATALOG, WalletOption } from '../../services/web3.service';

@Component({
  selector: 'app-wallet-modal',
  standalone: true,
  imports: [],
  templateUrl: './wallet-modal.html',
  styleUrl: './wallet-modal.scss',
  encapsulation: ViewEncapsulation.None,
})
export class WalletModalComponent {
  readonly web3 = inject(Web3Service);

  @Output() close = new EventEmitter<void>();

  readonly connecting = signal<string | null>(null);
  readonly wallets: WalletOption[] = WALLET_CATALOG;

  // ── Detection ──────────────────────────────────────────────────────────────
  isDetected(walletId: string): boolean {
    return this.web3.isWalletDetected(walletId);
  }

  /** How many wallets are actually installed */
  get detectedCount(): number {
    return this.wallets.filter((w) => this.isDetected(w.id)).length;
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async connect(wallet: WalletOption): Promise<void> {
    this.connecting.set(wallet.id);
    const ok = await this.web3.connectWithWallet(wallet.id);
    this.connecting.set(null);
    if (ok) this.close.emit();
  }

  openInstall(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('wallet-modal-backdrop')) {
      this.close.emit();
    }
  }
}
