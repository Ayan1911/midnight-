import React from 'react';
import { History, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TransactionRecord } from '../types';
import { truncateHash } from '../services/cryptoUtils';

interface TransactionHistoryProps {
  transactions: TransactionRecord[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  if (transactions.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-indigo-900/40 rounded-2xl p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Recent On-Chain Transactions ({transactions.length})
          </h3>
        </div>
        <span className="text-xs text-slate-400">Midnight Preprod Explorer</span>
      </div>

      <div className="space-y-2">
        {transactions.map((tx, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs gap-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-white font-semibold">{truncateHash(tx.txHash, 10, 8)}</span>
                  <span className="text-[10px] text-slate-500">Block #{tx.blockNumber}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Spent Nullifier: <span className="text-cyan-300 font-mono">{truncateHash(tx.nullifier, 8, 6)}</span> | Proof Size: {tx.proofSize}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">{tx.timestamp}</span>
              <a
                href={`https://explorer.preprod.midnight.network/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 hover:text-white transition-colors"
                title="View on Midnight Preprod Explorer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
