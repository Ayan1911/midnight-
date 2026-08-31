import React, { useState, useEffect } from 'react';
import { WalletState } from '../services/walletConnector';

interface NavbarProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ wallet, onConnect, onDisconnect }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    const nextState = !menuOpen;
    setMenuOpen(nextState);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = nextState ? 'hidden' : '';
    }
  };

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, []);

  return (
    <nav className="hero-nav">
      <a href="/" className="nav-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span>Midnight Voting</span>
        <span className="nav-logo-badge">Preprod</span>
      </a>

      <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
        <ul className="nav-links">
          <li><a href="#ballot" className="active" onClick={() => setMenuOpen(false)}>Cast Ballot</a></li>
          <li><a href="#ledger" onClick={() => setMenuOpen(false)}>Ledger Tally</a></li>
          <li><a href="#console" onClick={() => setMenuOpen(false)}>ZK Console</a></li>
          <li><a href="https://docs.midnight.network" target="_blank" rel="noreferrer">Protocol Docs</a></li>
        </ul>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {wallet.connected ? (
            <>
              <button className="btn-pill btn-secondary mono" title="Connected to Midnight Testnet" style={{ cursor: 'default' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                {wallet.address}
              </button>
              {onDisconnect && (
                <button
                  className="btn-pill"
                  onClick={onDisconnect}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#f87171',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    fontSize: '0.8rem',
                    padding: '8px 14px'
                  }}
                  title="Disconnect Wallet"
                >
                  Disconnect
                </button>
              )}
            </>
          ) : wallet.error === '1AM_NOT_FOUND' ? (
            <button className="btn-pill" style={{ background: '#374151', color: '#9ca3af', cursor: 'not-allowed' }} disabled>
              1AM Wallet Not Detected
            </button>
          ) : (
            <button className="btn-pill btn-primary" onClick={onConnect}>
              Connect 1AM Wallet
            </button>
          )}
        </div>
      </div>

      <button className={`menu-toggle ${menuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle navigation menu">
        <span />
        <span />
      </button>
    </nav>
  );
};
