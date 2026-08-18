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
    <div className="bg-slate-950/90 border border-indigo-900/50 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            ZK Proof Pipeline Execution Logs
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Target: Compact castVote.zkir</span>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all text-xs ${
                step.status === 'running'
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                  : step.status === 'completed'
                  ? 'bg-slate-900/70 border-emerald-500/40'
                  : step.status === 'error'
                  ? 'bg-red-950/40 border-red-500/50'
                  : 'bg-slate-900/30 border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-semibold">
                  {step.status === 'running' && (
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                  )}
                  {step.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {step.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  {step.status === 'idle' && (
                    <Clock className="w-4 h-4 text-slate-500" />
                  )}
                  <span
                    className={
                      step.status === 'running'
                        ? 'text-indigo-300'
                        : step.status === 'completed'
                        ? 'text-emerald-300'
                        : step.status === 'error'
                        ? 'text-red-300'
                        : 'text-slate-400'
                    }
                  >
                    {step.title}
                  </span>
                </div>
                {step.timestamp && (
                  <span className="text-[10px] font-mono text-slate-500">
                    {step.timestamp}
                  </span>
                )}
              </div>

              <p className="text-slate-300 text-[11px] ml-6 leading-relaxed">
                {step.description}
              </p>

              {step.details && (
                <div className="mt-2 ml-6 p-2 rounded bg-slate-950/80 border border-slate-800 font-mono text-[10px] text-indigo-200 break-all">
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
