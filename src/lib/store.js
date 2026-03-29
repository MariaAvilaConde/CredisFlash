import { writable } from 'svelte/store';

export const walletAddress = writable(null);
export const walletBalance = writable('0.0');
export const networkName = writable('Unknown');
export const isConnected = writable(false);
export const provider = writable(null);
export const signer = writable(null);
export const alerts = writable([]);

export function addAlert(message, type = 'info') {
  const id = Date.now();
  alerts.update(a => [...a, { id, message, type }]);
  setTimeout(() => {
    removeAlert(id);
  }, 5000);
}

export function removeAlert(id) {
  alerts.update(a => a.filter(alert => alert.id !== id));
}
