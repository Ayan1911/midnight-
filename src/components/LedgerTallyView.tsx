import React from 'react';
import { Database, ExternalLink, Hash, CheckCircle2 } from 'lucide-react';
import { ElectionLedgerState } from '../types';
import { truncateHash } from '../services/cryptoUtils';

interface LedgerTallyViewProps {
  ledgerState: ElectionLedgerState;
  isSyncing?: boolean;
}

export const LedgerTallyView: React.FC<LedgerTallyViewProps> = ({ ledgerState, isSyncing = false }) => {
  const { totalVotesA, totalVotesB, totalBallots, nullifiers, contractAddress } = ledgerState;

  const percentA = totalBallots > 0 ? Math.round((totalVotesA / totalBallots) * 100) : 50;
  const percentB = totalBallots > 0 ? Math.round((totalVotesB / totalBallots) * 100) : 50;

  return (
    <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
              Verified On-Chain Ledger
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Live tally state on Midnight Preview. Publicly auditable by all nodes.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-300">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>Total: <strong>{totalBallots}</strong></span>
          </div>
        </div>

        {/* Tally Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-semibold text-zinc-300">Option 0: ZK Privacy Standard</span>
              <span className="text-xs font-mono font-bold text-zinc-100">{percentA}%</span>
            </div>
            <div className="text-2xl font-mono font-bold text-cyan-400">{totalVotesA}</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-1">Verified Ballots</div>
          </div>

          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-semibold text-zinc-300">Option 1: Shielded DeFi AMM</span>
              <span className="text-xs font-mono font-bold text-zinc-100">{percentB}%</span>
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-400">{totalVotesB}</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-1">Verified Ballots</div>
          </div>
        </div>

        {/* Distribution Bar */}
        <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800 mb-5">
          <div
            style={{ width: `${percentA}%` }}
            className="h-full bg-cyan-500 transition-all duration-500 ease-out"
          ></div>
          <div
            style={{ width: `${percentB}%` }}
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          ></div>
        </div>

        {/* Nullifiers List */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
              <Hash className="w-3 h-3 text-zinc-400" />
              <span>Registered Nullifiers ({nullifiers.length})</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500">Map&lt;Bytes&lt;32&gt;, Boolean&gt;</span>
          </div>

          <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] custom-scrollbar">
            {nullifiers.map((nullifier, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded bg-[#090d15] border border-zinc-900 text-zinc-300"
              >
                <span className="text-zinc-400">{truncateHash(nullifier, 12, 10)}</span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contract Anchor */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono">
        <span className="text-zinc-500">Contract (Preview):</span>
        <a
          href={`https://explorer.preview.midnight.network/contract/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <span>{truncateHash(contractAddress, 8, 6)}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
