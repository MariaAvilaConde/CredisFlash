import { ethers } from 'ethers';
import { walletAddress, walletBalance, networkName, isConnected, provider, signer, addAlert } from './store';

const NETWORKS = {
  '0x1': { name: 'Ethereum Mainnet', symbol: 'ETH', rpc: 'https://mainnet.infura.io/v3/', explorer: 'https://etherscan.io' },
  '0xaa36a7': { 
    name: 'Sepolia Testnet', 
    symbol: 'SepoliaETH', 
    rpc: 'https://sepolia.infura.io/v3/', 
    explorer: 'https://sepolia.etherscan.io',
    chainId: '0xaa36a7',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'SepoliaETH', decimals: 18 }
  },
  '0x4268': { 
    name: 'Holesky Testnet', 
    symbol: 'HoleskyETH', 
    rpc: 'https://rpc.holesky.ethpandaops.io', 
    explorer: 'https://holesky.etherscan.io',
    chainId: '0x4268',
    nativeCurrency: { name: 'Holesky ETH', symbol: 'HoleskyETH', decimals: 18 }
  }
};

export async function connectWallet() {
  if (typeof window === 'undefined') return;

  const injected = window.pali || window.ethereum;
  if (!injected) {
    addAlert('Pali Wallet no detectada. Por favor instálala.', 'error');
    return;
  }

  try {
    const accounts = await injected.request({ method: 'eth_requestAccounts' });
    const addr = accounts[0];
    walletAddress.set(addr);

    const _provider = new ethers.BrowserProvider(injected);
    const _signer = await _provider.getSigner();
    
    provider.set(_provider);
    signer.set(_signer);
    isConnected.set(true);

    const network = await _provider.getNetwork();
    const chainId = '0x' + network.chainId.toString(16);
    networkName.set(NETWORKS[chainId]?.name || `Chain ID: ${network.chainId}`);

    await updateBalance(_provider, addr);
    addAlert('Sesión iniciada correctamente', 'success');

    // Setup listeners
    injected.on('accountsChanged', (newAccounts) => {
      if (newAccounts.length === 0) {
        disconnectWallet();
      } else {
        walletAddress.set(newAccounts[0]);
        updateBalance(_provider, newAccounts[0]);
      }
    });

    injected.on('chainChanged', () => {
      window.location.reload();
    });

  } catch (error) {
    console.error(error);
    addAlert('Error al conectar la billetera: ' + error.message, 'error');
  }
}

export function disconnectWallet() {
  walletAddress.set(null);
  walletBalance.set('0.0');
  networkName.set('Unknown');
  isConnected.set(false);
  provider.set(null);
  signer.set(null);
  addAlert('Sesión cerrada', 'info');
}

export async function updateBalance(p, addr) {
  if (!p || !addr) return;
  try {
    const bal = await p.getBalance(addr);
    walletBalance.set(ethers.formatEther(bal));
  } catch (error) {
    console.error(error);
  }
}

export async function switchNetwork(chainId) {
  const injected = window.pali || window.ethereum;
  if (!injected) return;

  try {
    await injected.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      const net = NETWORKS[chainId];
      try {
        await injected.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: net.chainId,
              chainName: net.name,
              nativeCurrency: net.nativeCurrency,
              rpcUrls: [net.rpc],
              blockExplorerUrls: [net.explorer],
            },
          ],
        });
      } catch (addError) {
        addAlert('Error al agregar la red: ' + addError.message, 'error');
      }
    } else {
      addAlert('Error al cambiar de red: ' + switchError.message, 'error');
    }
  }
}

export async function sendTransaction(to, amount) {
  let s;
  signer.subscribe(v => s = v)();
  if (!s) {
    addAlert('Conecta tu billetera primero', 'error');
    return;
  }

  try {
    addAlert('Iniciando transferencia...', 'info');
    const tx = await s.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });
    addAlert('Transacción enviada: ' + tx.hash.slice(0, 10) + '...', 'info');
    await tx.wait();
    addAlert('Transferencia completada con éxito', 'success');
    
    let p, addr;
    provider.subscribe(v => p = v)();
    walletAddress.subscribe(v => addr = v)();
    updateBalance(p, addr);
    
    return tx;
  } catch (error) {
    console.error(error);
    addAlert('Error en la transferencia: ' + error.message, 'error');
  }
}

export async function getTransactionHistory(address, apiKey) {
  if (!address) return [];
  // Default to Mainnet for history if not specified, but usually we use the current chain
  // For this demo, let's assume Sepolia if not mainnet
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${apiKey || 'YourApiKeyToken'}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
