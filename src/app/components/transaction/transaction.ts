import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Web3Service } from '../../services/web3.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transaction.html',
  styleUrl: './transaction.scss',
})
export class TransactionComponent {
  readonly web3 = inject(Web3Service);
  readonly ui = inject(UiService);

  toAddress = signal('');
  amount = signal('');
  txHash = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  get explorerTxUrl(): string {
    const hash = this.txHash();
    if (!hash) return '';
    return `${this.web3.explorerBaseUrl}/tx/${hash}`;
  }

  isValidAddress(addr: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(addr);
  }

  isValidAmount(amt: string): boolean {
    const n = parseFloat(amt);
    return !isNaN(n) && n > 0;
  }

  get canSend(): boolean {
    return (
      this.web3.isConnected() &&
      this.isValidAddress(this.toAddress()) &&
      this.isValidAmount(this.amount()) &&
      !this.web3.isLoading()
    );
  }

  async send(): Promise<void> {
    this.txHash.set(null);
    this.successMsg.set(null);
    const hash = await this.web3.sendTransaction(this.toAddress(), this.amount());
    if (hash) {
      this.txHash.set(hash);
      this.successMsg.set('¡Transacción enviada con éxito!');
      this.toAddress.set('');
      this.amount.set('');
    }
  }

  async connect(): Promise<void> {
    this.ui.openWalletModal();
  }
}
