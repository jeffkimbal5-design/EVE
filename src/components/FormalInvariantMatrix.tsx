import React from 'react';
import { FormalInvariant } from '../types';
import { ShieldCheck, AlertCircle, Clock, CheckCircle2, FileCheck2, Cpu } from 'lucide-react';

interface FormalInvariantMatrixProps {
  invariants: FormalInvariant[];
  soundnessScore: number;
}

export const FormalInvariantMatrix: React.FC<FormalInvariantMatrixProps> = ({
  invariants,
  soundnessScore,
}) => {
  const getTypeBadge = (type: FormalInvariant['type']) => {
    switch (type) {
      case 'correctness':
        return 'bg-blue-950/60 text-blue-400 border-blue-800/60';
      case 'safety':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
      case 'complexity':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/60';
      case 'termination':
        return 'bg-purple-950/60 text-purple-400 border-purple-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusIcon = (status: FormalInvariant['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'violated':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Symbolic Invariant & Proof Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Deductive constraints verified by System 2 before admitting any neural code mutation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400">FORMAL PROOF INDEX</div>
            <div className="text-sm font-mono font-bold text-emerald-400">
              {soundnessScore}% VERIFIED
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 bg-emerald-950/40 flex items-center justify-center text-xs font-mono font-bold text-emerald-300">
            {invariants.filter((i) => i.status === 'verified').length}/{invariants.length}
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {invariants.map((inv) => (
          <div
            key={inv.id}
            className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusIcon(inv.status)}
                <code className="text-xs font-mono font-semibold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {inv.rule}
                </code>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getTypeBadge(
                    inv.type
                  )}`}
                >
                  {inv.type}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                {inv.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 ml-6 mb-1">{inv.description}</p>

            {inv.proofStatement && (
              <div className="ml-6 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 bg-slate-900/40 px-2 py-1 rounded">
                <FileCheck2 className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="text-slate-400">{inv.proofStatement}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
