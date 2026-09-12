import React from 'react';
import { Brain, Terminal, ShieldAlert, CheckCircle } from 'lucide-react';
import { MissionMetrics } from '../types';

interface ReasoningTraceProps {
  trace: string[];
  metrics?: MissionMetrics;
  summary?: string;
}

export const ReasoningTrace: React.FC<ReasoningTraceProps> = ({ trace, metrics, summary }) => {
  if (!trace || trace.length === 0) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 text-center">
        <Brain className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400 font-medium">Cognitive Engine Standby</p>
        <p className="text-xs text-slate-500 mt-1">
          EVE PRIME's internal thought deliberation and constraint evaluation trace will stream here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-6 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          Internal Deliberation & Cognitive Vector
        </h3>
        {metrics && (
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Confidence: {(metrics.confidenceScore * 100).toFixed(0)}%</span>
            <span>Loops: {metrics.autonomyLoops}</span>
          </div>
        )}
      </div>

      {summary && (
        <div className="bg-cyan-950/40 border border-cyan-800/40 rounded-lg p-3 text-xs text-cyan-200">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-cyan-400 block mb-1">
            Executive Synthesis
          </span>
          {summary}
        </div>
      )}

      <div className="space-y-2">
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
          Agent Thought Nodes
        </span>
        <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 max-h-56 overflow-y-auto">
          {trace.map((thought, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-cyan-500 shrink-0 select-none">[{idx + 1}]</span>
              <span className="text-slate-300 leading-relaxed">{thought}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
