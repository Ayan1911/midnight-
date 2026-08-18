import React from 'react';
import { Shield, Wallet, RefreshCw, Lock, Radio } from 'lucide-react';
import { WalletState } from '../types';
import { truncateHash } from '../services/cryptoUtils';

interface HeaderProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  onResetDemo: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onConnect,
  onDisconnect,
  onResetDemo,
  isSyncing = false,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-[#080c14]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm shadow-inner">
            ZK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">Midnight VoteZK</h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 rounded">
                Preview Testnet
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">Compact 0.31.1 • Zero-Knowledge Ballots</p>
          </div>
        </div>

        {/* Network & Wallet Actions */}
        <div className="flex items-center gap-2.5">
          {/* Live Node Sync Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
            <Radio className={`w-3 h-3 text-emerald-400 ${isSyncing ? 'animate-pulse' : ''}`} />
            <span className="text-emerald-400 font-medium">Node #184920</span>
          </div>

          {/* Reset Demo State */}
          <button
            onClick={onResetDemo}
            title="Reset Local Session"
            className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Wallet Trigger / Account Pill */}
          {wallet.isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] font-mono text-zinc-300">
                <span className="text-zinc-500">Balance:</span>
                <span className="text-cyan-400 font-semibold">{wallet.balanceTdust.toFixed(1)} tDUST</span>
              </div>

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700/80 rounded-md px-2.5 py-1 text-xs font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span className="text-zinc-200">{truncateHash(wallet.address || '', 6, 4)}</span>
                <button
                  onClick={onDisconnect}
                  className="text-[10px] text-zinc-500 hover:text-red-400 ml-1.5 transition-colors uppercase font-sans font-semibold"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={wallet.isConnecting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-md shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{wallet.isConnecting ? 'Connecting...' : 'Connect Lace'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
