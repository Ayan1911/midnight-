import React from 'react';
import { EyeOff, Cpu, Globe, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
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
    <div className="bg-slate-900/60 border border-indigo-900/40 rounded-2xl p-6 backdrop-blur-md shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Midnight 3-Zone Architecture & Privacy Model
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Observing how data moves from local private witness into zero-knowledge circuits and onto the public ledger.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-indigo-950/60 border border-indigo-800/40 px-3 py-1.5 rounded-lg text-indigo-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span>Rule: Witness data only leaks via explicit disclose()</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
        {/* 1. Witness Zone */}
        <div className="bg-gradient-to-b from-purple-950/40 to-slate-950/70 border border-purple-800/40 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-purple-600/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-200">1. Witness Zone</h3>
                  <span className="text-[10px] text-purple-400/80 uppercase font-mono">Private Local Storage</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                NEVER DISCLOSED
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Lives exclusively in client RAM. No validator, indexer, or observer ever receives this data.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-purple-900/30">
                <span className="text-[10px] text-slate-500 block uppercase">Voter Secret Credential</span>
                <span className="text-purple-300 font-semibold text-[11px] break-all">
                  {truncateHash(voterSecret, 12, 8)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-purple-900/30">
                <span className="text-[10px] text-slate-500 block uppercase">Private Raw Choice</span>
                <span className="text-purple-300 font-semibold text-[11px]">
                  {selectedCandidate === 0 ? 'Candidate A (Option 0)' : 'Candidate B (Option 1)'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center gap-1.5 text-[11px] text-purple-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted in browser session</span>
          </div>
        </div>

        {/* 2. Circuit Zone */}
        <div className="bg-gradient-to-b from-indigo-950/40 to-slate-950/70 border border-indigo-800/40 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-600/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-200">2. Circuit Zone</h3>
                  <span className="text-[10px] text-indigo-400/80 uppercase font-mono">ZK Prover Engine</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                ZK-SNARK
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Executes Compact constraints off-chain and compiles mathematical proofs via <code className="text-indigo-300">castVote.zkir</code>.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-indigo-900/30">
                <span className="text-[10px] text-slate-500 block uppercase">Circuit Operation</span>
                <span className="text-indigo-300 text-[11px]">persistentHash(voterSecret)</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-indigo-900/30">
                <span className="text-[10px] text-slate-500 block uppercase">Derived Nullifier Hash</span>
                <span className="text-cyan-300 font-semibold text-[11px] break-all">
                  {truncateHash(nullifierHash, 10, 6)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-900/30 flex items-center gap-1.5 text-[11px] text-indigo-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Constraints verified in Zero-Knowledge</span>
          </div>
        </div>

        {/* 3. Ledger Zone */}
        <div className="bg-gradient-to-b from-cyan-950/40 to-slate-950/70 border border-cyan-800/40 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-600/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-cyan-200">3. Ledger Zone</h3>
                  <span className="text-[10px] text-cyan-400/80 uppercase font-mono">Midnight Preprod Chain</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                PUBLIC STATE
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Only disclosed values & ZK proofs are anchored to the blockchain. No voter wallet linkage.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-cyan-900/30 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">Public Candidate A Count</span>
                <span className="text-cyan-300 font-bold text-sm">{totalVotesA}</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-cyan-900/30 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">Public Candidate B Count</span>
                <span className="text-cyan-300 font-bold text-sm">{totalVotesB}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-900/30 flex items-center gap-1.5 text-[11px] text-cyan-400">
            <Globe className="w-3.5 h-3.5" />
            <span>Publicly auditable by any network node</span>
          </div>
        </div>
      </div>
    </div>
  );
};
