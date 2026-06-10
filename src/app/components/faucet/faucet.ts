import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Web3Service } from '../../services/web3.service';
import { ToastService } from '../../services/toast.service';

export interface FaucetInfo {
  networkName: string;
  chainId: string;
  symbol: string;
  icon: string;
  amount: string;
  cooldown: string;
  faucets: {
    name: string;
    url: string;           // base URL
    supportsAddress: boolean; // can pre-fill address in URL
    addressParam?: string;   // query param name e.g. "address"
    requiresLogin: boolean;
    notes?: string;
  }[];
}

export const FAUCET_LIST: FaucetInfo[] = [
  {
    networkName: 'Sepolia Testnet',
    chainId: '0xaa36a7',
    symbol: 'ETH',
    icon: '🔵',
    amount: '0.5 ETH',
    cooldown: '24h',
    faucets: [
      {
        name: 'Alchemy Faucet',
        url: 'https://sepoliafaucet.com',
        supportsAddress: false,
        requiresLogin: true,
        notes: 'Requiere cuenta Alchemy (gratis)',
      },
      {
        name: 'Google Cloud Faucet',
        url: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
        supportsAddress: false,
        requiresLogin: true,
        notes: 'Requiere cuenta Google',
      },
      {
        name: 'Chainlink Faucet',
        url: 'https://faucets.chain.link/sepolia',
        supportsAddress: true,
        addressParam: 'addr',
        requiresLogin: false,
        notes: 'Sin login, directo',
      },
      {
        name: 'Infura Faucet',
        url: 'https://www.infura.io/faucet/sepolia',
        supportsAddress: false,
        requiresLogin: true,
        notes: 'Requiere cuenta Infura (gratis)',
      },
    ],
  },
  {
    networkName: 'Hoodi Testnet',
    chainId: '0x88bb0',
    symbol: 'ETH',
    icon: '🟣',
    amount: '1 ETH',
    cooldown: '24h',
    faucets: [
      {
        name: 'Hoodi Faucet (ethpandaops)',
        url: 'https://hoodi-faucet.pk910.de',
        supportsAddress: true,
        addressParam: 'addr',
        requiresLogin: false,
        notes: 'PoW faucet, sin login',
      },
      {
        name: 'Chainlink Faucet',
        url: 'https://faucets.chain.link/hoodi',
        supportsAddress: true,
        addressParam: 'addr',
        requiresLogin: false,
        notes: 'Sin login, directo',
      },
    ],
  },
  {
    networkName: 'Polygon Amoy Testnet',
    chainId: '0x13882',
    symbol: 'MATIC',
    icon: '🟠',
    amount: '0.5 MATIC',
    cooldown: '24h',
    faucets: [
      {
        name: 'Polygon Faucet',
        url: 'https://faucet.polygon.technology',
        supportsAddress: false,
        requiresLogin: false,
        notes: 'Faucet oficial de Polygon',
      },
      {
        name: 'Chainlink Faucet',
        url: 'https://faucets.chain.link/polygon-amoy',
        supportsAddress: true,
        addressParam: 'addr',
        requiresLogin: false,
        notes: 'Sin login, directo',
      },
    ],
  },
  {
    networkName: 'BNB Smart Chain Testnet',
    chainId: '0x61',
    symbol: 'tBNB',
    icon: '🟤',
    amount: '0.1 tBNB',
    cooldown: '24h',
    faucets: [
      {
        name: 'BNB Chain Faucet',
        url: 'https://testnet.bnbchain.org/faucet-smart',
        supportsAddress: false,
        requiresLogin: false,
        notes: 'Faucet oficial BNB',
      },
    ],
  },
  {
    networkName: 'Avalanche Fuji Testnet',
    chainId: '0xa869',
    symbol: 'AVAX',
    icon: '🔴',
    amount: '2 AVAX',
    cooldown: '24h',
    faucets: [
      {
        name: 'Avalanche Faucet',
        url: 'https://core.app/tools/testnet-faucet',
        supportsAddress: false,
        requiresLogin: false,
        notes: 'Faucet oficial Avalanche',
      },
      {
        name: 'Chainlink Faucet',
        url: 'https://faucets.chain.link/fuji',
        supportsAddress: true,
        addressParam: 'addr',
        requiresLogin: false,
        notes: 'Sin login, directo',
      },
    ],
  },
  {
    networkName: 'Arbitrum Sepolia',
    chainId: '0x66eee',
    symbol: 'ETH',
    icon: '🔷',
    amount: '0.1 ETH',
    cooldown: '24h',
    faucets: [
      {
        name: 'Chainlink Faucet',
        url: 'https://faucets.chain.link/arbitrum-sepolia',
        supportsAddress: true,
        addressParam: 'addr',
        requiresLogin: false,
        notes: 'Sin login, directo',
      },
      {
        name: 'Alchemy Faucet',
        url: 'https://www.alchemy.com/faucets/arbitrum-sepolia',
        supportsAddress: false,
        requiresLogin: true,
        notes: 'Requiere cuenta Alchemy',
      },
    ],
  },
  {
    networkName: 'Optimism Sepolia',
    chainId: '0xaa37dc',
    symbol: 'ETH',
    icon: '🔴',
    amount: '0.05 ETH',
    cooldown: '24h',
    faucets: [
      {
        name: 'Chainlink Faucet',
        url: 'https://faucets.chain.link/optimism-sepolia',
        supportsAddress: true,
        addressParam: 'addr',
        requiresLogin: false,
        notes: 'Sin login, directo',
      },
      {
        name: 'Alchemy Faucet',
        url: 'https://www.alchemy.com/faucets/optimism-sepolia',
        supportsAddress: false,
        requiresLogin: true,
        notes: 'Requiere cuenta Alchemy',
      },
    ],
  },
];

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

  address = signal('');
  selectedChainId = signal('');
  readonly faucets = FAUCET_LIST;

  get selectedFaucet(): FaucetInfo | undefined {
    return this.faucets.find(f => f.chainId === this.selectedChainId());
  }

  get myAddress(): string {
    return this.web3.account() ?? '';
  }

  isValidAddress(addr: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(addr);
  }

  setAddress(val: any): void {
    this.address.set(val != null ? String(val).trim() : '');
  }

  useMyAddress(): void {
    if (this.web3.account()) {
      this.address.set(this.web3.account()!);
    }
  }

  openFaucet(faucet: FaucetInfo['faucets'][0]): void {
    const addr = this.address();
    let url = faucet.url;

    if (faucet.supportsAddress && faucet.addressParam && this.isValidAddress(addr)) {
      url = `${faucet.url}?${faucet.addressParam}=${addr}`;
    }

    window.open(url, '_blank', 'noopener');
    this.toast.info(`Abriendo ${faucet.name}…`);
  }

  copyAddress(): void {
    const addr = this.address();
    if (!addr) return;
    navigator.clipboard.writeText(addr).then(() => {
      this.toast.success('Dirección copiada al portapapeles');
    });
  }
}
