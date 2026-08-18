import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PrivacyVisualizer } from './components/PrivacyVisualizer';
import { VotingStation } from './components/VotingStation';
import { LedgerTallyView } from './components/LedgerTallyView';
import { ProofConsole } from './components/ProofConsole';
import { TransactionHistory } from './components/TransactionHistory';
import { walletConnector } from './services/walletConnector';
import { contractService } from './services/contractService';
import { generateVoterSecret, deriveNullifierHash } from './services/cryptoUtils';
import { Candidate, VoterState, WalletState, ProofStep, ElectionLedgerState } from './types';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const CANDIDATES: Candidate[] = [
  {
    id: 0,
    name: 'Option 0: ZK Privacy Standard',
    tagline: 'Enforce native zero-knowledge verification for ledger updates',
    description:
      'Implements standard zk-SNARK validation for all smart contract state changes across Midnight Network.',
    color: 'cyan',
    avatarIcon: '0',
  },
  {
    id: 1,
    name: 'Option 1: Shielded DeFi AMM',
    tagline: 'Private liquidity pools with encrypted settlement',
    description:
      'Establishes native shielded token pools and confidential cross-chain liquidity rails with selective disclosure.',
    color: 'emerald',
    avatarIcon: '1',
  },
];

export const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    networkId: 'preview',
    balanceTdust: 0,
    isConnecting: false,
    error: null,
    walletName: 'Lace Wallet',
  });

  const [voterState, setVoterState] = useState<VoterState>({
    voterSecret: '',
    nullifierHash: '',
    hasVoted: false,
    voteChoice: undefined,
  });

  const [selectedCandidate, setSelectedCandidate] = useState<number>(0);
  const [ledgerState, setLedgerState] = useState<ElectionLedgerState>(contractService.getLedgerState());
  const [proofSteps, setProofSteps] = useState<ProofStep[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const dAppSectionRef = useRef<HTMLDivElement | null>(null);

  // Initialize voter secret and sync state
  useEffect(() => {
    initVoterCredentials();

    // Subscribe to live contract state changes
    const unsubscribe = contractService.subscribe((state) => {
      setLedgerState(state);
    });

    // Background sync with Midnight Preview Indexer
    const syncInterval = setInterval(async () => {
      setIsSyncing(true);
      await contractService.syncWithIndexer();
      setIsSyncing(false);
    }, 15000);

    return () => {
      unsubscribe();
      clearInterval(syncInterval);
    };
  }, []);

  const initVoterCredentials = async (forcedSecret?: string) => {
    const secret = forcedSecret || generateVoterSecret();
    const nullifier = await deriveNullifierHash(secret);
    const hasVoted = contractService.isNullifierSpent(nullifier);

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
        walletName: res.isSimulated ? 'Lace (Preview Session)' : 'Lace Wallet',
      });
      setNotification({
        type: 'success',
        message: `Connected to Midnight Preview (${res.isSimulated ? 'Testnet Session' : 'Lace Extension'})`,
      });
    } catch (err: any) {
      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: err?.message || 'Failed to connect wallet',
      }));
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to connect Lace wallet',
      });
    }
  };

  const handleDisconnectWallet = () => {
    walletConnector.disconnect();
    setWallet({
      isConnected: false,
      address: null,
      networkId: 'preview',
      balanceTdust: 0,
      isConnecting: false,
      error: null,
      walletName: 'Lace Wallet',
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
      message: 'New voter secret generated locally. Unspent nullifier ready.',
    });
  };

  const handleScrollToDApp = () => {
    if (dAppSectionRef.current) {
      dAppSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
      const result = await contractService.submitVote(
        selectedCandidate,
        voterState.voterSecret,
        (steps) => setProofSteps([...steps])
      );

      setVoterState((prev) => ({
        ...prev,
        hasVoted: true,
        voteChoice: selectedCandidate,
      }));

      setNotification({
        type: 'success',
        message: `Ballot confirmed on Midnight Preview! TxHash: ${result.txHash.slice(0, 10)}...`,
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
    contractService.resetToDefault();
    setProofSteps([]);
    initVoterCredentials();
    setNotification({
      type: 'info',
      message: 'Session state reset to default testnet baseline.',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Xero Landing Hero Section */}
      <HeroSection
        brandName="Xero"
        title="The simple way"
        titleAccent="encryption your data"
        subtitle="Fully managed data encrypting service and annotation platform for teams of all industries."
        ctaText="Get Started"
        isLoggedIn={wallet.isConnected}
        userAddress={wallet.address}
        onLogin={wallet.isConnected ? handleDisconnectWallet : handleConnectWallet}
        onSignup={handleConnectWallet}
        onGetStarted={handleScrollToDApp}
        onMethodClick={handleScrollToDApp}
        onPricingClick={handleScrollToDApp}
        onDocsClick={() => window.open('https://docs.midnight.network', '_blank')}
      />

      {/* 2. Top Header for Live Testnet Telemetry */}
      <div id="dapp-section" ref={dAppSectionRef} className="scroll-mt-6">
        <Header
          wallet={wallet}
          onConnect={handleConnectWallet}
          onDisconnect={handleDisconnectWallet}
          onResetDemo={handleResetDemo}
          isSyncing={isSyncing}
        />
      </div>

      {/* Notifications */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 w-full">
          <div
            className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                : notification.type === 'error'
                ? 'bg-red-950/60 border-red-800/80 text-red-300'
                : 'bg-zinc-900 border-zinc-700 text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              ) : (
                <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-zinc-400 hover:text-white text-xs ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main DApp Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Network & Protocol Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#0e131f] border border-zinc-800/80 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <div className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                <span>Midnight Preview Testnet</span>
                <span className="font-mono text-[10px] text-zinc-400 font-normal">
                  Contract: {ledgerState.contractAddress.slice(0, 10)}...{ledgerState.contractAddress.slice(-6)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Zero-Knowledge circuit <code className="text-cyan-400 font-mono">castVote</code> active with nullifier double-spend protection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <div>
              Total Ballots: <span className="text-zinc-100 font-bold">{ledgerState.totalBallots}</span>
            </div>
            <div>
              Status: <span className="text-emerald-400 font-semibold">{ledgerState.isOpen ? 'Open' : 'Closed'}</span>
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

        {/* Main Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <LedgerTallyView ledgerState={ledgerState} isSyncing={isSyncing} />
        </div>

        {/* Cryptographic Execution Logs */}
        <ProofConsole steps={proofSteps} isSubmitting={isSubmitting} />

        {/* Recent Activity */}
        <TransactionHistory transactions={contractService.getTransactions()} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#080c14] py-4 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Midnight Network Preview • Compact Smart Contracts v0.31.1</div>
          <div>ZK Prover Engine • Lace DApp Connector</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
