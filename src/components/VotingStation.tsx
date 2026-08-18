import React, { useState } from 'react';
import { Key, Check, Eye, EyeOff, RefreshCw, AlertCircle, Shield, Lock } from 'lucide-react';
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
    <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
              Anonymous Ballot Submission
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Select an option to synthesize a local zero-knowledge proof.
            </p>
          </div>
          <div className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">
            ZKIR v0.31
          </div>
        </div>

        {/* Candidate Selection */}
        <div className="space-y-2.5 mb-5">
          {candidates.map((candidate) => {
            const isSelected = selectedCandidate === candidate.id;
            return (
              <div
                key={candidate.id}
                onClick={() => onSelectCandidate(candidate.id)}
                className={`cursor-pointer rounded-lg p-4 border transition-all ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-500/80 shadow-sm ring-1 ring-zinc-500/30'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs ${
                        isSelected
                          ? 'bg-zinc-100 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {candidate.avatarIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-xs text-zinc-100">
                          {candidate.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        {candidate.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                        : 'border-zinc-700 bg-transparent text-transparent'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Private Witness Key Management */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-3.5 mb-5 font-mono text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-zinc-300 font-sans text-xs font-medium">
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              <span>Private Witness Credentials</span>
            </div>
            <div className="flex items-center gap-2 font-sans">
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
              >
                {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showSecret ? 'Hide' : 'Reveal'}</span>
              </button>
              <button
                onClick={onGenerateNewSecret}
                title="Generate new voter secret"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded transition-colors"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Rotate</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-2 bg-[#090d15] rounded border border-zinc-900">
              <div className="text-[9px] text-zinc-500 uppercase">32-Byte Voter Secret (Client Memory)</div>
              <div className="text-zinc-300 text-[10px] break-all">
                {showSecret ? voterState.voterSecret : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </div>
            </div>

            <div className="p-2 bg-[#090d15] rounded border border-zinc-900">
              <div className="text-[9px] text-zinc-500 uppercase">Derived Nullifier SHA-256 (Disclosed on Chain)</div>
              <div className="text-emerald-400 text-[10px] break-all">
                {truncateHash(voterState.nullifierHash, 14, 10)}
              </div>
            </div>
          </div>

          {voterState.hasVoted && (
            <div className="mt-2.5 p-2 bg-amber-950/30 border border-amber-800/40 rounded text-amber-300 text-[11px] font-sans flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>This nullifier has already voted. Click Rotate to generate a new ballot.</span>
            </div>
          )}
        </div>
      </div>

      {/* Submission Button */}
      <button
        onClick={onCastBallot}
        disabled={isSubmitting || !isWalletConnected || voterState.hasVoted}
        className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-zinc-950 bg-zinc-100 hover:bg-white transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
      >
        {isSubmitting ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Generating ZK Proof & Submitting to Preview...</span>
          </>
        ) : !isWalletConnected ? (
          <>
            <Lock className="w-3.5 h-3.5" />
            <span>Connect Lace Wallet to Submit Ballot</span>
          </>
        ) : voterState.hasVoted ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Ballot Cast (Rotate Key for Next Ballot)</span>
          </>
        ) : (
          <>
            <Shield className="w-3.5 h-3.5" />
            <span>
              Generate ZK Proof & Submit for Option #{selectedCandidate}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
