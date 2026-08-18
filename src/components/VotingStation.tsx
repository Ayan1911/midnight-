import React, { useState } from 'react';
import {
  Key,
  Shield,
  Check,
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Candidate, VoterState } from '../types';
import { truncateHash } from '../services/cryptoUtils';

interface VotingStationProps {
  candidates: Candidate[];
  voterState: VoterState;
  selectedCandidate: number;
  isSubmitting: boolean;
  isWalletConnected: boolean;
  onSelectCandidate: (candidateId: number) => void;
  onGenerateNewSecret: () => void;
  onCastBallot: () => void;
}

export const VotingStation: React.FC<VotingStationProps> = ({
  candidates,
  voterState,
  selectedCandidate,
  isSubmitting,
  isWalletConnected,
  onSelectCandidate,
  onGenerateNewSecret,
  onCastBallot,
}) => {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="bg-slate-900/60 border border-indigo-900/40 rounded-2xl p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Anonymous Ballot Station
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a candidate and generate a Zero-Knowledge proof with your local witness.
          </p>
        </div>

        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Ballot Encryption: Active</span>
        </div>
      </div>

      {/* Candidate Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {candidates.map((candidate) => {
          const isSelected = selectedCandidate === candidate.id;
          return (
            <div
              key={candidate.id}
              onClick={() => onSelectCandidate(candidate.id)}
              className={`cursor-pointer rounded-xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                        candidate.id === 0
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {candidate.avatarIcon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">
                        {candidate.name}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-400">
                        {candidate.tagline}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'border-slate-700 bg-slate-900 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {candidate.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Candidate Identifier</span>
                <span className="font-mono font-bold text-indigo-300">Option #{candidate.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voter Secret & Witness Credentials */}
      <div className="bg-slate-950/70 border border-indigo-900/30 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Private Witness Credentials (Local Device Only)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showSecret ? 'Hide Secret' : 'Reveal Secret'}</span>
            </button>
            <button
              onClick={onGenerateNewSecret}
              title="Generate new voter secret credential"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/50 px-2 py-1 rounded transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Rotate Secret Key</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-500 uppercase">32-Byte Voter Secret</span>
              <span className="text-[10px] text-purple-400 font-sans">RAM Only</span>
            </div>
            <div className="text-purple-300 break-all text-[11px] select-all">
              {showSecret ? voterState.voterSecret : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-500 uppercase">Derived Nullifier Hash</span>
              <span className="text-[10px] text-cyan-400 font-sans">Disclosed to Chain</span>
            </div>
            <div className="text-cyan-300 break-all text-[11px] select-all">
              {truncateHash(voterState.nullifierHash, 14, 10)}
            </div>
          </div>
        </div>

        {voterState.hasVoted && (
          <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              This voter secret's nullifier is already spent on the ledger. Rotate secret key to cast another simulated ballot.
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onCastBallot}
        disabled={isSubmitting || !isWalletConnected || voterState.hasVoted}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-xl shadow-indigo-600/25 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
      >
        {isSubmitting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Synthesizing ZK Proof & Submitting to Midnight...</span>
          </>
        ) : !isWalletConnected ? (
          <>
            <Lock className="w-4 h-4" />
            <span>Connect Lace Wallet to Cast Ballot</span>
          </>
        ) : voterState.hasVoted ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Ballot Already Cast with Current Nullifier</span>
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            <span>
              Generate ZK Proof & Cast Ballot for{' '}
              {selectedCandidate === 0 ? 'Candidate A' : 'Candidate B'}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
