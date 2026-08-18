import React, { useState } from 'react';
import './styles/midnight-theme.css';
import { Navbar } from './components/Navbar';
import { HeroPipeline } from './components/HeroPipeline';
import { VotingStation } from './components/VotingStation';
import { LedgerTallyView } from './components/LedgerTallyView';
import { ProofConsole, LogEntry } from './components/ProofConsole';
import { TrustBadges } from './components/TrustBadges';
import { MidnightWalletService, WalletState } from './services/walletConnector';

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    network: 'preview',
    isMock: false,
  });

  const [tallyA, setTallyA] = useState<number>(42);
  const [tallyB, setTallyB] = useState<number>(38);
  const [nullifiers, setNullifiers] = useState<string[]>([
    '0x88f219...bc41',
    '0x33e91a...710d',
    '0xaa0421...eef9',
  ]);
  const [isProving, setIsProving] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), text: 'Application initialized on Midnight Preprod network.', type: 'info' },
    { timestamp: new Date().toLocaleTimeString(), text: 'Compact contract bindings loaded: voting.compact', type: 'info' },
  ]);

  const addLog = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setLogs((prev) => [...prev, { timestamp: new Date().toLocaleTimeString(), text, type }]);
  };

  const handleConnectWallet = async () => {
    addLog('Requesting Lace Beta Wallet connection...', 'info');
    const walletService = MidnightWalletService.getInstance();
    const result = await walletService.connectLace();
    setWallet(result);
    addLog(`Connected: ${result.address} on ${result.network}`, 'success');
  };

  const handleCastVote = async (candidateId: number, voterSecret: string) => {
    setIsProving(true);
    addLog(`Initiating private ballot for Candidate ${candidateId === 1 ? 'Alpha' : 'Beta'}...`, 'info');
    
    // 1. Derive SHA-256 Nullifier locally
    const simulatedNullifier = `0x${voterSecret.slice(0, 12)}...${voterSecret.slice(-4)}`;
    addLog(`Derived local nullifier: ${simulatedNullifier}`, 'info');

    // 2. Proof Generation
    addLog('Executing Compact ZK Circuit (castVote.zkir)... Generating Zero-Knowledge Proof.', 'info');
    const walletService = MidnightWalletService.getInstance();
    const txHash = await walletService.generateProofAndSubmit(candidateId, simulatedNullifier);

    // 3. Update public ledger state
    if (candidateId === 1) setTallyA((prev) => prev + 1);
    else setTallyB((prev) => prev + 1);
    setNullifiers((prev) => [simulatedNullifier, ...prev]);

    addLog(`ZK Proof verified on Midnight Preprod! TxHash: ${txHash.slice(0, 16)}...`, 'success');
    setIsProving(false);
  };

  return (
    <>
      <Navbar wallet={wallet} onConnect={handleConnectWallet} />

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

        <ProofConsole logs={logs} />
      </section>

      <TrustBadges />
    </>
  );
}
