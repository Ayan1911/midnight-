import React from 'react';
import { Shield, Wallet, ExternalLink, RefreshCw, Lock, Sparkles } from 'lucide-react';
import { WalletState } from '../types';
import { truncateHash } from '../services/cryptoUtils';

interface HeaderProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onConnect,
  onDisconnect,
  onResetDemo,
}) => {
  return (
    <header className="border-b border-indigo-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <Lock className="w-2 h-2 text-slate-950 stroke-[3]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Midnight VoteZK</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full">
                Compact ZK
              </span>
            </div>
            <p className="text-xs text-slate-400">Zero-Knowledge Ballots on Midnight Preprod</p>
          </div>
        </div>

        {/* Network & Wallet Controls */}
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-emerald-400 font-medium">Midnight Preprod</span>
          </div>

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            title="Reset demo state"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Lace Wallet Button */}
          {wallet.isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Balance</span>
                <span className="text-xs font-mono font-semibold text-indigo-300">
                  {wallet.balanceTdust.toFixed(2)} tDUST
                </span>
              </div>

              <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-800/50 rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-mono text-indigo-200">
                  {truncateHash(wallet.address || '', 8, 4)}
                </span>
                <button
                  onClick={onDisconnect}
                  className="ml-2 text-xs text-slate-400 hover:text-red-400 transition-colors font-medium"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={wallet.isConnecting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 hover:from-indigo-500 to-purple-600 hover:to-purple-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {wallet.isConnecting ? 'Connecting Lace...' : 'Connect Lace Beta'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
