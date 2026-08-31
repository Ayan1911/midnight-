import React from 'react';

interface TransactionVerificationProps {
  txHash: string | null;
  status: 'pending' | 'confirmed';
  errorMessage?: string | null;
  isPopupBlocked?: boolean;
  onRetry?: () => void;
}

export const TransactionVerification: React.FC<TransactionVerificationProps> = ({
  txHash,
  status,
  errorMessage,
  isPopupBlocked,
  onRetry,
}) => {
  if (isPopupBlocked || errorMessage) {
    return (
      <div
        className="panel-card"
        style={{
          marginTop: '2rem',
          textAlign: 'left',
          borderColor: 'var(--accent-pink)',
          background: 'rgba(176, 48, 136, 0.08)',
          boxShadow: '0 0 30px rgba(176, 48, 136, 0.2)',
        }}
      >
        <div className="panel-title" style={{ color: '#ff66aa', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️ 1AM Wallet Signature Suppressed or Disconnected</span>
        </div>
        <p className="panel-desc" style={{ marginTop: '6px', color: '#e0d0e8' }}>
          The 1AM Wallet signature popup did not appear or was closed by your browser's popup blocker.
        </p>

        <div
          style={{
            margin: '1.2rem 0',
            padding: '16px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.88rem',
            lineHeight: '1.6',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
            Action Required to Authorize Zero-Knowledge Transaction:
          </div>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Disable Popup Blockers for this site:</strong> Click the popup icon in your browser URL / address bar and choose <em>"Always allow popups and redirects"</em>.
            </li>
            <li>
              <strong>Check for hidden background windows:</strong> The 1AM Wallet popup may have opened behind your active browser window or is waiting in your extensions tray.
            </li>
          </ol>
        </div>

        {errorMessage && (
          <div className="mono" style={{ fontSize: '0.78rem', color: '#ff99bb', marginBottom: '1rem', wordBreak: 'break-word' }}>
            Error details: {errorMessage}
          </div>
        )}

        {onRetry && (
          <button
            type="button"
            className="btn-pill btn-primary"
            onClick={onRetry}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            ↻ Retry Signature with 1AM Wallet
          </button>
        )}
      </div>
    );
  }

  if (!txHash) return null;

  return (
    <div
      className="panel-card"
      style={{
        marginTop: '2rem',
        textAlign: 'center',
        borderColor: status === 'confirmed' ? 'var(--accent-cyan)' : 'var(--accent-pink)',
      }}
    >
      <div className="panel-title">Transaction Verification</div>
      <p className="panel-desc">
        Your vote has been submitted to the Midnight network.
      </p>

      <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <div
          className={`status-badge ${status}`}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 600,
            background: status === 'confirmed' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255, 0, 255, 0.1)',
            color: status === 'confirmed' ? 'var(--accent-cyan)' : 'var(--accent-pink)',
            border: `1px solid ${status === 'confirmed' ? 'var(--accent-cyan)' : 'var(--accent-pink)'}`,
          }}
        >
          {status === 'confirmed' ? '✓ Confirmed' : '⌛ Pending'}
        </div>
      </div>

      <div
        className="mono"
        style={{
          padding: '1rem',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          wordBreak: 'break-all',
          fontSize: '0.9rem',
          marginBottom: '1rem',
        }}
      >
        {txHash}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href={`https://explorer.1am.xyz/tx/${txHash}?network=preview`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill btn-primary"
          style={{ display: 'inline-block', textDecoration: 'none' }}
        >
          Verify on 1AM Explorer
        </a>
        <a
          href={`https://midnight-preview.subscan.io/extrinsic/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill"
          style={{ display: 'inline-block', textDecoration: 'none', background: 'rgba(255, 255, 255, 0.08)', color: '#fff' }}
        >
          Subscan Explorer
        </a>
      </div>
    </div>
  );
};
