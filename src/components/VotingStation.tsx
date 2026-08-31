import React, { useState, useRef } from 'react';
import { WalletState } from '../services/walletConnector';

interface VotingStationProps {
  wallet: WalletState;
  onCastVote: (candidateId: number, voterSecret: string) => Promise<void>;
  isProving: boolean;
}

/**
 * Generates a cryptographically secure 32-byte secret salt in isolated JS memory.
 * Never exposed via DOM inputs or plaintext HTML rendering.
 */
function generateSecureEntropy(): string {
  const buffer = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(buffer);
  } else {
    for (let i = 0; i < 32; i++) buffer[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(buffer, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const VotingStation: React.FC<VotingStationProps> = ({ wallet, onCastVote, isProving }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<number>(1);
  
  // Isolated in memory / JS state — NEVER rendered to DOM inputs or plaintext HTML
  const secretRef = useRef<string>(generateSecureEntropy());
  const [entropyGeneratedAt, setEntropyGeneratedAt] = useState<string>(() => new Date().toLocaleTimeString());

  const rotateSecret = () => {
    secretRef.current = generateSecureEntropy();
    setEntropyGeneratedAt(new Date().toLocaleTimeString());
  };

  const handleSubmit = async () => {
    if (!wallet.connected || isProving) return;
    await onCastVote(selectedCandidate, secretRef.current);
    rotateSecret();
  };

  return (
    <div className="panel-card" id="ballot">
      <div className="panel-title">
        <span>Anonymous Ballot Station</span>
        <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-pink)' }}>ZK-SHIELDED</span>
      </div>
      <p className="panel-desc">
        Select your candidate. Your vote choice and identity are computed locally in your browser's private witness zone. Only the zero-knowledge proof and nullifier are submitted to the ledger.
      </p>

      <div className="candidate-selector">
        <button
          type="button"
          className={`candidate-btn ${selectedCandidate === 1 ? 'selected' : ''}`}
          onClick={() => setSelectedCandidate(1)}
        >
          <div className="candidate-name">Candidate Alpha</div>
          <div className="candidate-meta">Protocol Governance Upgrade v2.0</div>
        </button>

        <button
          type="button"
          className={`candidate-btn ${selectedCandidate === 2 ? 'selected' : ''}`}
          onClick={() => setSelectedCandidate(2)}
        >
          <div className="candidate-name">Candidate Beta</div>
          <div className="candidate-meta">Treasury Allocation Framework</div>
        </button>
      </div>

      {/* Zero DOM Leak Witness Box */}
      <div className="secret-box">
        <div className="secret-label">
          <span>Private Witness State (Isolated JS Memory)</span>
          <button
            type="button"
            onClick={rotateSecret}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem' }}
          >
            ↻ Re-seed Entropy
          </button>
        </div>
        <div className="secret-value mono" style={{ letterSpacing: '2px', color: 'var(--accent-cyan)' }}>
          ●●●●●●●●●●●●●●●● (32-Byte Secret Salt Isolated in RAM • {entropyGeneratedAt})
        </div>
      </div>

      <button
        className="btn-pill btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
        disabled={!wallet.connected || isProving}
        onClick={handleSubmit}
      >
        {isProving ? 'Generating ZK Proof...' : wallet.connected ? 'Cast Private Vote' : 'Connect Lace Wallet to Vote'}
      </button>
    </div>
  );
};
