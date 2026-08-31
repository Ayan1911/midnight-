import React, { useState, useEffect } from 'react';
import './styles/midnight-theme.css';
import { Navbar } from './components/Navbar';
import { HeroPipeline } from './components/HeroPipeline';
import { VotingStation } from './components/VotingStation';
import { LedgerTallyView } from './components/LedgerTallyView';
import { ProofConsole, LogEntry } from './components/ProofConsole';
import { TrustBadges } from './components/TrustBadges';
import { TransactionVerification } from './components/TransactionVerification';
import { MidnightWalletService, WalletState } from './services/walletConnector';
import { contractService } from './services/contractService';
import { ProofStep } from './types';

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    network: 'preview',
    isMock: false,
  });

  useEffect(() => {
    // Auto-check for 1AM presence on mount for headless resilience
    const checkWallet = async () => {
      const walletService = MidnightWalletService.getInstance();
      const state = await walletService.connect();
      setWallet(state);
    };
    checkWallet().catch(console.error);
  }, []);

  const [tallyA, setTallyA] = useState<number>(42);
  const [tallyB, setTallyB] = useState<number>(38);
  const [nullifiers, setNullifiers] = useState<string[]>([
    '0x88f219...bc41',
    '0x33e91a...710d',
    '0xaa0421...eef9',
  ]);
  const [isProving, setIsProving] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), text: 'Application initialized on Midnight Preview testnet.', type: 'info' },
    { timestamp: new Date().toLocaleTimeString(), text: 'Compact contract bindings loaded: voting.compact', type: 'info' },
  ]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<'pending' | 'confirmed'>('pending');
  const [walletError, setWalletError] = useState<{ message: string; isPopupBlocked: boolean } | null>(null);
  const [lastVoteParams, setLastVoteParams] = useState<{ candidateId: number; voterSecret: string } | null>(null);

  const addLog = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setLogs((prev) => [...prev, { timestamp: new Date().toLocaleTimeString(), text, type }]);
  };

  const handleConnectWallet = async () => {
    addLog('Requesting 1AM Wallet connection...', 'info');
    const walletService = MidnightWalletService.getInstance();
    const result = await walletService.connect();
    setWallet(result);
    addLog(`Connected: ${result.address} on ${result.network}`, 'success');
  };

  const handleDisconnectWallet = () => {
    const walletService = MidnightWalletService.getInstance();
    const result = walletService.disconnect();
    setWallet(result);
    addLog('Wallet disconnected. Session cleared from memory.', 'warn');
  };

  const handleCastVote = async (candidateId: number, voterSecret: string) => {
    setIsProving(true);
    setTxHash(null);
    setWalletError(null);
    setLastVoteParams({ candidateId, voterSecret });
    setTxStatus('pending');
    addLog(`Initiating private ballot for Candidate ${candidateId === 1 ? 'Alpha' : 'Beta'}...`, 'info');

    try {
      // Execute the real contract transaction flow
      const { txHash, nullifier } = await contractService.submitVote(
        candidateId === 1 ? 0 : 1, // Map UI candidate 1 to Compact 0 (Alpha), UI candidate 2 to Compact 1 (Beta)
        voterSecret,
        (steps: ProofStep[]) => {
          const currentStep = steps.find((s: ProofStep) => s.status === 'running' || s.status === 'error');
          if (currentStep) {
            addLog(`${currentStep.title}: ${currentStep.description}`, currentStep.status === 'error' ? 'warn' : 'info');
          }
        }
      );

      addLog(`ZK Proof verified on Midnight Preview! TxHash: ${txHash.slice(0, 16)}...`, 'success');
      setTxHash(txHash);
      setTxStatus('confirmed');
      setWalletError(null);

      // Refresh public ledger state
      const state = contractService.getLedgerState();
      setTallyA(state.totalVotesA);
      setTallyB(state.totalVotesB);
      setNullifiers(state.nullifiers);
    } catch (err: any) {
      const errMsg = err?.message || 'Transaction submission failed';
      const isPopupBlocked =
        errMsg.includes('disconnected') ||
        errMsg.includes('popup') ||
        errMsg.includes('closed') ||
        errMsg.includes('rejected');

      setWalletError({
        message: errMsg,
        isPopupBlocked,
      });

      addLog(`Execution Failed: ${errMsg}`, 'warn');
    } finally {
      setIsProving(false);
    }
  };

  return (
    <>
      <Navbar wallet={wallet} onConnect={handleConnectWallet} onDisconnect={handleDisconnectWallet} />

      <section className="hero-card">
        <div className="hero-grid" />
        
        {/* Animated ZK Icon Pipeline */}
        <HeroPipeline />

        <div className="hero-content">
          <h1 className="hero-heading">
            Private Ballots.
            <strong>Verifiable On-Chain Tallies.</strong>
          </h1>
          <p className="hero-sub">
            Built natively on the Midnight Network using Zero-Knowledge cryptography and selective disclosure. Your identity never leaves your device.
          </p>
        </div>

        <div className="app-grid">
          <VotingStation wallet={wallet} onCastVote={handleCastVote} isProving={isProving} />
          <LedgerTallyView
            tallyA={tallyA}
            tallyB={tallyB}
            totalBallots={tallyA + tallyB}
            nullifiers={nullifiers}
          />
        </div>
        
        <TransactionVerification
          txHash={txHash}
          status={txStatus}
          errorMessage={walletError?.message}
          isPopupBlocked={walletError?.isPopupBlocked}
          onRetry={lastVoteParams ? () => handleCastVote(lastVoteParams.candidateId, lastVoteParams.voterSecret) : undefined}
        />

        <ProofConsole logs={logs} />
      </section>

      <TrustBadges />
    </>
  );
}
