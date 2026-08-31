import React from 'react';
import { ExternalLink, CheckCircle2, History } from 'lucide-react';
import { TransactionRecord } from '../types';
import { truncateHash } from '../services/cryptoUtils';

interface TransactionHistoryProps {
  transactions: TransactionRecord[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  if (transactions.length === 0) return null;

  return (
    <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-zinc-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
            Recent On-Chain Activity ({transactions.length})
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">Explorer Network: Preview</span>
      </div>

      <div className="space-y-2">
        {transactions.map((tx, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs gap-2"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <div className="font-mono text-[11px]">
                <div className="flex items-center gap-2 text-zinc-200 font-medium">
                  <span>{truncateHash(tx.txHash, 10, 8)}</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Block #{tx.blockNumber}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 font-sans">
                  Nullifier: <span className="text-cyan-400 font-mono">{truncateHash(tx.nullifier, 8, 6)}</span> • Choice: Option #{tx.candidateChoice}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
              <span>{tx.timestamp}</span>
              <a
                href={`https://explorer.1am.xyz/tx/${tx.txHash}?network=preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                title="View on 1AM Preview Explorer"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
