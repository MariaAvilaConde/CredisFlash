import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiService } from '../../services/ui.service';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  readonly ui = inject(UiService);
  readonly web3 = inject(Web3Service);

  openWalletModal(): void {
    this.ui.openWalletModal();
  }
}
