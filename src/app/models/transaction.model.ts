export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  status: 'success' | 'failed' | 'pending';
  networkChainId: string;
  explorerUrl: string;
}
