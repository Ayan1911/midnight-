import React from 'react';
import { EyeOff, Cpu, Globe, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { truncateHash } from '../services/cryptoUtils';

interface PrivacyVisualizerProps {
  voterSecret: string;
  nullifierHash: string;
  selectedCandidate: number;
  totalVotesA: number;
  totalVotesB: number;
}

export const PrivacyVisualizer: React.FC<PrivacyVisualizerProps> = ({
  voterSecret,
  nullifierHash,
  selectedCandidate,
  totalVotesA,
  totalVotesB,
}) => {
  return (
    <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
            3-Zone Privacy Architecture (Selective Disclosure)
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Witness data never crosses into Ledger without disclose()</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Witness Zone */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                <span>1. Witness (Client RAM)</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-800 rounded">
                Off-Chain Secret
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
              Private 32-byte voter secret stored temporarily in local memory. Never sent over RPC.
            </p>
          </div>

          <div className="space-y-1.5 font-mono text-[10px] bg-[#090d15] p-2.5 rounded border border-zinc-900">
            <div className="text-zinc-500 uppercase text-[9px]">Voter Secret (Ephemeral)</div>
            <div className="text-cyan-300 break-all">{truncateHash(voterSecret, 10, 8)}</div>
          </div>
        </div>

        {/* 2. Circuit Zone */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Circuit (ZK Prover)</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 rounded">
                castVote.zkir
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
              Calculates deterministic nullifier <code className="text-zinc-300">SHA-256(voterSecret)</code> and generates ZK-SNARK proof.
            </p>
          </div>

          <div className="space-y-1.5 font-mono text-[10px] bg-[#090d15] p-2.5 rounded border border-zinc-900">
            <div className="text-zinc-500 uppercase text-[9px]">Derived Nullifier Hash</div>
            <div className="text-emerald-400 break-all">{truncateHash(nullifierHash, 10, 8)}</div>
          </div>
        </div>

        {/* 3. Ledger Zone */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Ledger (Midnight Preview)</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded">
                On-Chain State
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
              Public tally increments and spent nullifier list. Public observers cannot link voter wallet to vote choice.
            </p>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] bg-[#090d15] p-2.5 rounded border border-zinc-900">
            <span className="text-zinc-400">Public Tallies:</span>
            <span className="text-zinc-200 font-bold">
              A: {totalVotesA} | B: {totalVotesB}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
