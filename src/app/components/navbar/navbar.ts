import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Web3Service } from '../../services/web3.service';
import { UiService } from '../../services/ui.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';

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
  readonly confirm = inject(ConfirmService);
  readonly menuOpen = signal(false);
  readonly walletMenuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  toggleWalletMenu(): void {
    this.walletMenuOpen.update((v) => !v);
  }

  closeWalletMenu(): void {
    this.walletMenuOpen.set(false);
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
    this.walletMenuOpen.set(false);
    await this.web3.disconnectWallet();
    this.toast.info('Wallet desconectada');
  }

  async fullLogout(): Promise<void> {
    this.walletMenuOpen.set(false);
    const ok = await this.confirm.open({
      title: 'Cerrar sesión total',
      message: 'Se revocarán los permisos en MetaMask. La próxima vez tendrás que volver a aprobar la conexión.',
      confirmLabel: 'Cerrar sesión',
      cancelLabel: 'Cancelar',
      type: 'danger',
    });
    if (ok) {
      await this.web3.fullLogout();
      this.toast.info('Sesión cerrada. MetaMask pedirá permiso la próxima vez.');
    }
  }
}
