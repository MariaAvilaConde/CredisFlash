import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Web3Service } from '../../services/web3.service';
import { UiService } from '../../services/ui.service';
import { Transaction } from '../../models/transaction.model';
import { SuccessCountPipe } from '../../pipes/success-count.pipe';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe, SuccessCountPipe],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class HistoryComponent implements OnInit {
  readonly web3 = inject(Web3Service);
  readonly ui = inject(UiService);

  ngOnInit(): void {
    if (this.web3.isConnected() && this.web3.transactions().length === 0) {
      this.loadHistory();
    }
  }

  async loadHistory(): Promise<void> {
    await this.web3.loadTransactionHistory();
  }

  isOutgoing(tx: Transaction): boolean {
    return tx.from.toLowerCase() === this.web3.account()?.toLowerCase();
  }

  shortHash(hash: string): string {
    return hash.slice(0, 10) + '...' + hash.slice(-8);
  }

  shortAddr(addr: string): string {
    return addr.slice(0, 8) + '...' + addr.slice(-6);
  }

  async connect(): Promise<void> {
    this.ui.openWalletModal();
  }
}
