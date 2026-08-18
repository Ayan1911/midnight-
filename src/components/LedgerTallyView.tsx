import React from 'react';

interface LedgerTallyViewProps {
  tallyA: number;
  tallyB: number;
  totalBallots: number;
  nullifiers: string[];
}

export const LedgerTallyView: React.FC<LedgerTallyViewProps> = ({ tallyA, tallyB, totalBallots, nullifiers }) => {
  const percentA = totalBallots > 0 ? (tallyA / totalBallots) * 100 : 50;
  const percentB = totalBallots > 0 ? (tallyB / totalBallots) * 100 : 50;

  return (
    <div className="panel-card" id="ledger">
      <div className="panel-title">
        <span>Verified Ledger Tallies</span>
        <span className="mono" style={{ fontSize: '0.72rem', color: '#4ade80' }}>LIVE PREPROD SYNC</span>
      </div>
      <p className="panel-desc">
        Public on-chain tallies verified mathematically without disclosing individual voter ballots.
      </p>

      <div className="tally-row">
        <div className="tally-item">
          <div className="tally-header">
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Candidate Alpha</span>
            <span className="tally-count mono">{tallyA}</span>
          </div>
          <div className="tally-bar-bg">
            <div className="tally-bar-fill" style={{ width: `${percentA}%` }} />
          </div>
        </div>

        <div className="tally-item">
          <div className="tally-header">
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Candidate Beta</span>
            <span className="tally-count mono">{tallyB}</span>
          </div>
          <div className="tally-bar-bg">
            <div className="tally-bar-fill" style={{ width: `${percentB}%`, background: 'linear-gradient(90deg, #00e5ff, #8888a8)' }} />
          </div>
        </div>
      </div>

      <div className="secret-box" style={{ marginBottom: 0 }}>
        <div className="secret-label">
          <span>Registered Nullifiers ({nullifiers.length})</span>
          <span>Double-Vote Prevention</span>
        </div>
        <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxHeight: 64, overflowY: 'auto' }}>
          {nullifiers.map((nullifier, idx) => (
            <div key={idx}>{nullifier}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
