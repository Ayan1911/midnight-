import React from 'react';
import { BarChart3, Database, ShieldAlert, CheckCircle, ExternalLink, Hash } from 'lucide-react';
import { ElectionLedgerState } from '../types';
import { truncateHash } from '../services/cryptoUtils';

interface LedgerTallyViewProps {
  ledgerState: ElectionLedgerState;
}

export const LedgerTallyView: React.FC<LedgerTallyViewProps> = ({ ledgerState }) => {
  const { totalVotesA, totalVotesB, totalBallots, nullifiers, contractAddress } = ledgerState;

  const percentA = totalBallots > 0 ? Math.round((totalVotesA / totalBallots) * 100) : 50;
  const percentB = totalBallots > 0 ? Math.round((totalVotesB / totalBallots) * 100) : 50;

  return (
    <div className="bg-slate-900/60 border border-indigo-900/40 rounded-2xl p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              On-Chain Ledger State & Tallies
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Public state stored on Midnight Preprod blockchain. Verifiable by all nodes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Total Ballots: <strong className="text-white">{totalBallots}</strong></span>
        </div>
      </div>

      {/* Vote Comparison Progress */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
          <div className="p-4 bg-gradient-to-br from-cyan-950/60 to-slate-950/80 border border-cyan-800/40 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-cyan-300 font-bold">Candidate A</span>
              <span className="font-mono text-xl font-bold text-white">{totalVotesA}</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Proposal 104: ZK Privacy Standard</p>
            <div className="text-right text-xs font-mono text-cyan-400 font-bold">{percentA}%</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-950/60 to-slate-950/80 border border-purple-800/40 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-purple-300 font-bold">Candidate B</span>
              <span className="font-mono text-xl font-bold text-white">{totalVotesB}</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Proposal 105: Shielded DeFi AMM</p>
            <div className="text-right text-xs font-mono text-purple-400 font-bold">{percentB}%</div>
          </div>
        </div>

        {/* Dual Progress Bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${percentA}%` }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 ease-out"
          ></div>
          <div
            style={{ width: `${percentB}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700 ease-out"
          ></div>
        </div>
      </div>

      {/* Spent Nullifiers Registry */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Registered Spent Nullifiers ({nullifiers.length})
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Compact Map&lt;Bytes&lt;32&gt;, Boolean&gt;</span>
        </div>

        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs custom-scrollbar">
          {nullifiers.map((nullifier, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-300 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px]">#{idx + 1}</span>
                <span className="text-cyan-300 font-semibold">{truncateHash(nullifier, 12, 10)}</span>
              </div>
              <span className="px-2 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                SPENT & VERIFIED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Verification Link */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <span className="text-slate-400">Deployed Contract Address:</span>
        <a
          href={`https://explorer.preprod.midnight.network/contract/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>{truncateHash(contractAddress, 10, 8)}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
