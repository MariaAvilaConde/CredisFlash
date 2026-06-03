import { Component, EventEmitter, HostListener, inject, Output, signal, ViewEncapsulation } from '@angular/core';
import { Web3Service, WALLET_CATALOG, WalletOption } from '../../services/web3.service';
import { ToastService } from '../../services/toast.service';

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
  readonly toast = inject(ToastService);

  @Output() close = new EventEmitter<void>();

  readonly connecting = signal<string | null>(null);
  readonly wallets: WalletOption[] = WALLET_CATALOG;

  isDetected(walletId: string): boolean {
    return this.web3.isWalletDetected(walletId);
  }

  get detectedCount(): number {
    return this.wallets.filter((w) => this.isDetected(w.id)).length;
  }

  async connect(wallet: WalletOption): Promise<void> {
    this.connecting.set(wallet.id);
    const ok = await this.web3.connectWithWallet(wallet.id);
    this.connecting.set(null);
    if (ok) {
      this.toast.success(`${wallet.name} conectada`);
      this.close.emit();
    } else if (this.web3.errorMessage()) {
      this.toast.error(this.web3.errorMessage()!);
    }
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
