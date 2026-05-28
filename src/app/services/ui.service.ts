import { Injectable, inject } from '@angular/core';
import { ModalService } from './modal.service';

@Injectable({ providedIn: 'root' })
export class UiService {
  private modal = inject(ModalService);

  openWalletModal(): void {
    this.modal.open();
  }

  closeWalletModal(): void {
    this.modal.close();
  }
}
