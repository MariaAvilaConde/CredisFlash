import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Web3Service } from '../../services/web3.service';
import { UiService } from '../../services/ui.service';
import { NetworkConfig } from '../../models/network.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  readonly web3 = inject(Web3Service);
  readonly ui = inject(UiService);
  readonly showNetworkPicker = signal(false);

  // Use the reactive signal from the service so custom networks appear too
  get networks() { return this.web3.allNetworks(); }

  ngOnInit(): void {
    if (this.web3.isConnected()) {
      this.web3.refreshBalance();
    }
  }

  shortAddress(addr: string | null): string {
    if (!addr) return '';
    return addr.slice(0, 10) + '...' + addr.slice(-8);
  }

  async connect(): Promise<void> {
    this.ui.openWalletModal();
  }

  copyAddress(): void {
    const addr = this.web3.account();
    if (addr) navigator.clipboard.writeText(addr);
  }

  isActive(network: NetworkConfig): boolean {
    return this.web3.chainId() === network.chainId;
  }

  isSwitching(network: NetworkConfig): boolean {
    return this.web3.switchingChainId() === network.chainId;
  }

  async switchTo(network: NetworkConfig): Promise<void> {
    await this.web3.switchNetwork(network);
    this.showNetworkPicker.set(false);
  }

  getNetworkIcon(chainId: string): string {
    const icons: Record<string, string> = {
      '0xaa36a7': '🔵',
      '0x88bb0': '🟣',
      '0x1389': '🟡',
      '0x1': '⬡',
    };
    return icons[chainId] ?? '🌐';
  }
}
