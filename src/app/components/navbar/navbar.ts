import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Web3Service } from '../../services/web3.service';
import { UiService } from '../../services/ui.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  readonly web3 = inject(Web3Service);
  readonly ui = inject(UiService);
  readonly toast = inject(ToastService);
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  openModal(): void {
    this.web3.clearError();
    this.ui.openWalletModal();
    this.menuOpen.set(false);
  }

  shortAddress(addr: string | null): string {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }

  async disconnect(): Promise<void> {
    await this.web3.disconnectWallet();
    this.toast.info('Wallet desconectada');
  }
}
