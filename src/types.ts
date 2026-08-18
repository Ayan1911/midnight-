export interface Candidate {
  id: number;
  name: string;
  tagline: string;
  description: string;
  color: string;
  avatarIcon: string;
}

export interface VoterState {
  voterSecret: string; // 32-byte hex
  nullifierHash: string; // 32-byte hex derived via persistentHash
  hasVoted: boolean;
  voteChoice?: number;
}

export interface ElectionLedgerState {
  isOpen: boolean;
  totalVotesA: number;
  totalVotesB: number;
  totalBallots: number;
  nullifiers: string[]; // List of registered spent nullifiers
  contractAddress: string;
  network: string;
}

export interface ProofStep {
  id: string;
  title: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  timestamp?: string;
  details?: string;
}

export interface TransactionRecord {
  txHash: string;
  nullifier: string;
  candidateChoice: number;
  timestamp: string;
  status: 'confirmed' | 'pending';
  blockNumber: number;
  proofSize: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  networkId: string;
  balanceTdust: number;
  isConnecting: boolean;
  error: string | null;
  walletName: string;
}
