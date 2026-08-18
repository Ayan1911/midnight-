import React, { useState } from 'react';
import { WalletState } from '../services/walletConnector';

interface VotingStationProps {
  wallet: WalletState;
  onCastVote: (candidateId: number, voterSecret: string) => Promise<void>;
  isProving: boolean;
}

export const VotingStation: React.FC<VotingStationProps> = ({ wallet, onCastVote, isProving }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<number>(1);
  const [voterSecret, setVoterSecret] = useState<string>(() => {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  });

  const rotateSecret = () => {
    setVoterSecret(Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(''));
  };

  const handleSubmit = async () => {
    if (!wallet.connected) return;
    await onCastVote(selectedCandidate, voterSecret);
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

      <div className="secret-box">
        <div className="secret-label">
          <span>Private Voter Secret (32-Byte Entropy)</span>
          <button
            type="button"
            onClick={rotateSecret}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem' }}
          >
            ↻ Regenerate
          </button>
        </div>
        <div className="secret-value mono">{voterSecret}</div>
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
