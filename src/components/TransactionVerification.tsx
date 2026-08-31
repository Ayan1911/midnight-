import React from 'react';

interface TransactionVerificationProps {
  txHash: string | null;
  status: 'pending' | 'confirmed';
}

export const TransactionVerification: React.FC<TransactionVerificationProps> = ({ txHash, status }) => {
  if (!txHash) return null;

  return (
    <div className="panel-card" style={{ marginTop: '2rem', textAlign: 'center', borderColor: status === 'confirmed' ? 'var(--accent-cyan)' : 'var(--accent-pink)' }}>
      <div className="panel-title">Transaction Verification</div>
      <p className="panel-desc">
        Your vote has been submitted to the Midnight network.
      </p>
      
      <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <div className={`status-badge ${status}`} style={{
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 600,
          background: status === 'confirmed' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255, 0, 255, 0.1)',
          color: status === 'confirmed' ? 'var(--accent-cyan)' : 'var(--accent-pink)',
          border: `1px solid ${status === 'confirmed' ? 'var(--accent-cyan)' : 'var(--accent-pink)'}`
        }}>
          {status === 'confirmed' ? '✓ Confirmed' : '⌛ Pending'}
        </div>
      </div>
      
      <div className="mono" style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', wordBreak: 'break-all', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {txHash}
      </div>

      <a 
        href={`https://explorer.preview.midnight.network/tx/${txHash}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="btn-pill btn-primary"
        style={{ display: 'inline-block', textDecoration: 'none' }}
      >
        Verify on Midnight Explorer
      </a>
    </div>
  );
};
