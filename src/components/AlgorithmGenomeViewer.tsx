import React, { useState } from 'react';
import { AlgorithmSpec, GenerationSnapshot } from '../types';
import {
  Code2,
  Copy,
  Check,
  History,
  GitBranch,
  Dna,
  Zap,
  TrendingDown,
  Info,
} from 'lucide-react';

interface AlgorithmGenomeViewerProps {
  algorithm: AlgorithmSpec;
  selectedGeneration: number | null;
  onSelectGeneration: (gen: number) => void;
}

export const AlgorithmGenomeViewer: React.FC<AlgorithmGenomeViewerProps> = ({
  algorithm,
  selectedGeneration,
  onSelectGeneration,
}) => {
  const [copied, setCopied] = useState(false);

  // Determine which code to show (active or selected snapshot)
  const activeGen = algorithm.currentGeneration;
  const isViewingHistorical =
    selectedGeneration !== null && selectedGeneration !== activeGen;

  const snapshotToShow = isViewingHistorical
    ? algorithm.history.find((h) => h.generation === selectedGeneration)
    : null;

  const displayCode = snapshotToShow ? snapshotToShow.genomeCode : algorithm.genomeCode;
  const displayGen = isViewingHistorical ? selectedGeneration : activeGen;

  const copyCode = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = displayCode.split('\n');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-md space-y-4">
      {/* Header & Generation Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Dna className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Active Code Genome // AST Representation
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Self-modified executable logic. Live-swapped upon 100% formal verification proof.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-slate-300 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>COPY CODE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Evolutionary Lineage Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-500 flex items-center gap-1 shrink-0 text-[11px]">
          <History className="w-3 h-3" /> LINEAGE:
        </span>
        {/* Gen 0 */}
        <button
          onClick={() => onSelectGeneration(0)}
          className={`px-2.5 py-1 rounded border transition-all shrink-0 ${
            displayGen === 0
              ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          GEN 0 (SEED)
        </button>

        {/* Subsequent Generations */}
        {algorithm.history
          .filter((h) => h.generation > 0)
          .map((h) => (
            <button
              key={h.generation}
              onClick={() => onSelectGeneration(h.generation)}
              className={`px-2.5 py-1 rounded border transition-all shrink-0 flex items-center gap-1 ${
                displayGen === h.generation
                  ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <GitBranch className="w-3 h-3 text-cyan-400" />
              <span>GEN {h.generation}</span>
              <span className="text-[10px] text-emerald-400">
                {h.metrics.avgExecutionTimeUs}μs
              </span>
            </button>
          ))}
      </div>

      {/* Mutation Rationale Banner */}
      {snapshotToShow?.mutationRationale || algorithm.history[algorithm.history.length - 1]?.mutationRationale ? (
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-mono text-[10px] uppercase font-bold text-cyan-400 mb-0.5">
              {snapshotToShow ? snapshotToShow.mutationType : 'LATEST ADOPTED MUTATION'}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {snapshotToShow
                ? snapshotToShow.mutationRationale
                : algorithm.history[algorithm.history.length - 1]?.mutationRationale ||
                  'Baseline algorithm configuration.'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Code Display with Line Numbers */}
      <div className="relative rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{algorithm.entryFunction}</span>
          </div>
          <span className="text-slate-500">ECMAScript VM Sandbox Safe</span>
        </div>

        <div className="p-3 max-h-[380px] overflow-y-auto overflow-x-auto select-text">
          <pre className="text-slate-200 leading-relaxed">
            {lines.map((line, idx) => (
              <div key={idx} className="table-row">
                <span className="table-cell text-right pr-4 select-none text-slate-600 text-[11px]">
                  {idx + 1}
                </span>
                <span className="table-cell whitespace-pre">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
