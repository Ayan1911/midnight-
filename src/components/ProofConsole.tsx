import React from 'react';
import { Terminal, CheckCircle2, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { ProofStep } from '../types';

interface ProofConsoleProps {
  steps: ProofStep[];
  isSubmitting: boolean;
}

export const ProofConsole: React.FC<ProofConsoleProps> = ({ steps, isSubmitting }) => {
  if (steps.length === 0 && !isSubmitting) return null;

  return (
    <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
            Cryptographic Execution Stream
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">Circuit: castVote.zkir</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {steps.map((step) => {
          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                step.status === 'running'
                  ? 'bg-zinc-900 border-cyan-500/80'
                  : step.status === 'completed'
                  ? 'bg-zinc-950/80 border-emerald-800/60'
                  : step.status === 'error'
                  ? 'bg-red-950/40 border-red-800/60'
                  : 'bg-zinc-950/40 border-zinc-900 opacity-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-medium text-[11px]">
                    {step.status === 'running' && (
                      <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                    )}
                    {step.status === 'completed' && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                    {step.status === 'error' && (
                      <AlertCircle className="w-3 h-3 text-red-400" />
                    )}
                    {step.status === 'idle' && (
                      <Clock className="w-3 h-3 text-zinc-600" />
                    )}
                    <span
                      className={
                        step.status === 'running'
                          ? 'text-cyan-300'
                          : step.status === 'completed'
                          ? 'text-emerald-300'
                          : step.status === 'error'
                          ? 'text-red-300'
                          : 'text-zinc-400'
                      }
                    >
                      {step.title}
                    </span>
                  </div>
                </div>

                <p className="text-zinc-400 text-[10px] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {step.details && (
                <div className="mt-2 p-1.5 rounded bg-[#070a10] border border-zinc-900 font-mono text-[9px] text-zinc-300 break-all">
                  {step.details}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
