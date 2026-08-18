import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PrivacyVisualizer } from './components/PrivacyVisualizer';
import { VotingStation } from './components/VotingStation';
import { LedgerTallyView } from './components/LedgerTallyView';
import { ProofConsole } from './components/ProofConsole';
import { TransactionHistory } from './components/TransactionHistory';
import { walletConnector } from './services/walletConnector';
import { votingService } from './services/votingService';
import { generateVoterSecret, deriveNullifierHash } from './services/cryptoUtils';
import { Candidate, VoterState, WalletState, ProofStep, ElectionLedgerState } from './types';
import { Shield, Sparkles, CheckCircle, AlertCircle, Info, Lock } from 'lucide-react';

const CANDIDATES: Candidate[] = [
  {
    id: 0,
    name: 'Proposal 104: ZK Privacy Standard',
    tagline: 'Mandatory Zero-Knowledge Proofs for State Transitions',
    description:
      'Implements standard zk-SNARK validation for all smart contract state changes across the Midnight Network, ensuring absolute data sovereignty for institutional and private users alike.',
    color: 'cyan',
    avatarIcon: 'A',
  },
  {
    id: 1,
    name: 'Proposal 105: Shielded DeFi AMM',
    tagline: 'Private Automated Market Maker with Encrypted Pools',
    description:
      'Establishes native shielded token pools and confidential cross-chain liquidity rails, eliminating front-running and MEV through selective disclosure cryptography.',
    color: 'purple',
    avatarIcon: 'B',
  },
];

export const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    networkId: 'midnight-preprod',
    balanceTdust: 0,
    isConnecting: false,
    error: null,
    walletName: 'Lace Beta',
  });

  const [voterState, setVoterState] = useState<VoterState>({
    voterSecret: '',
    nullifierHash: '',
    hasVoted: false,
    voteChoice: undefined,
  });

  const [selectedCandidate, setSelectedCandidate] = useState<number>(0);
  const [ledgerState, setLedgerState] = useState<ElectionLedgerState>(votingService.getLedgerState());
  const [proofSteps, setProofSteps] = useState<ProofStep[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Initialize voter secret on first render
  useEffect(() => {
    initVoterCredentials();
  }, []);

  const initVoterCredentials = async (forcedSecret?: string) => {
    const secret = forcedSecret || generateVoterSecret();
    const nullifier = await deriveNullifierHash(secret);
    const hasVoted = votingService.isNullifierSpent(nullifier);

    setVoterState({
      voterSecret: secret,
      nullifierHash: nullifier,
      hasVoted,
    });
  };

  const handleConnectWallet = async () => {
    setWallet((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const res = await walletConnector.connectLace();
      setWallet({
        isConnected: true,
        address: res.address,
        networkId: res.networkId,
        balanceTdust: res.balanceTdust,
        isConnecting: false,
        error: null,
        walletName: res.isSimulated ? 'Lace Beta (Simulated Preprod)' : 'Lace Beta',
      });
      setNotification({
        type: 'success',
        message: `Connected to Lace Wallet (${res.isSimulated ? 'Simulated Preprod' : 'Midnight Preprod'})`,
      });
    } catch (err: any) {
      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: err?.message || 'Failed to connect wallet',
      }));
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to connect wallet',
      });
    }
  };

  const handleDisconnectWallet = () => {
    walletConnector.disconnect();
    setWallet({
      isConnected: false,
      address: null,
      networkId: 'midnight-preprod',
      balanceTdust: 0,
      isConnecting: false,
      error: null,
      walletName: 'Lace Beta',
    });
    setNotification({
      type: 'info',
      message: 'Wallet disconnected',
    });
  };

  const handleRotateSecret = () => {
    initVoterCredentials();
    setNotification({
      type: 'info',
      message: 'Rotated voter secret. New nullifier generated in Witness zone.',
    });
  };

  const handleCastBallot = async () => {
    if (!wallet.isConnected) {
      setNotification({
        type: 'error',
        message: 'Please connect your Lace Wallet first.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await votingService.executeVoteCircuit(
        selectedCandidate,
        voterState.voterSecret,
        (steps) => setProofSteps([...steps])
      );

      // Refresh states
      setLedgerState(votingService.getLedgerState());
      setVoterState((prev) => ({
        ...prev,
        hasVoted: true,
        voteChoice: selectedCandidate,
      }));

      setNotification({
        type: 'success',
        message: `Ballot successfully verified and cast in ZK! TxHash: ${result.txHash.slice(0, 10)}...`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Transaction failed during ZK proof generation',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetDemo = () => {
    votingService.resetDemoState();
    setLedgerState(votingService.getLedgerState());
    setProofSteps([]);
    initVoterCredentials();
    setNotification({
      type: 'info',
      message: 'Demo state reset to initial Midnight Preprod parameters.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        wallet={wallet}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
        onResetDemo={handleResetDemo}
      />

      {/* Global Notifications */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : notification.type === 'error'
                ? 'bg-red-950/80 border-red-500/50 text-red-300'
                : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white text-xs ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-indigo-900/40 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compact Smart Contract Architecture (0.31.1)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
              Anonymous Ballots with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Publicly Verifiable Tallies
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              Midnight uses Zero-Knowledge cryptography to protect user privacy. All ballot data, voter keys, and choices stay strictly inside your local <strong>Witness</strong>. The contract updates public tallies without ever revealing who voted or linking your wallet address.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Witness: Local RAM Secret</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Circuit: castVote.zkir</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ledger: disclose() only</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Zone Architecture Visualizer */}
        <PrivacyVisualizer
          voterSecret={voterState.voterSecret}
          nullifierHash={voterState.nullifierHash}
          selectedCandidate={selectedCandidate}
          totalVotesA={ledgerState.totalVotesA}
          totalVotesB={ledgerState.totalVotesB}
        />

        {/* Voting Station & Live Tallies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VotingStation
            candidates={CANDIDATES}
            voterState={voterState}
            selectedCandidate={selectedCandidate}
            isSubmitting={isSubmitting}
            isWalletConnected={wallet.isConnected}
            onSelectCandidate={(id) => setSelectedCandidate(id)}
            onGenerateNewSecret={handleRotateSecret}
            onCastBallot={handleCastBallot}
          />

          <LedgerTallyView ledgerState={ledgerState} />
        </div>

        {/* Proof Telemetry Logs */}
        <ProofConsole steps={proofSteps} isSubmitting={isSubmitting} />

        {/* Recent Transactions */}
        <TransactionHistory transactions={votingService.getTransactions()} />
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-900/40 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Midnight Preprod Connected</span>
          </div>
          <div>
            Built with Compact Language, React, and Midnight.js SDK. Zero-Knowledge Cryptography natively enforced.
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Network ID: midnight-preprod
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
