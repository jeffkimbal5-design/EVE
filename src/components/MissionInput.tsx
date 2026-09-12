import React, { useState } from 'react';
import { Play, Sparkles, Sliders, ArrowRight, CornerDownLeft, Shield, Zap } from 'lucide-react';
import { AgentStatus } from '../types';

interface MissionInputProps {
  onLaunchMission: (mission: string, autonomyLevel: string) => void;
  status: AgentStatus;
}

const PRESETS = [
  {
    label: 'Architecture & Security Audit',
    query: 'Execute a thorough architecture security audit on an event-driven microservice system and identify latency vulnerabilities.',
    autonomy: 'high',
  },
  {
    label: 'Autonomous Code Refactor',
    query: 'Synthesize a high-performance concurrent worker queue in TypeScript with graceful shutdown and backpressure control.',
    autonomy: 'extreme',
  },
  {
    label: 'Market & Tech Intelligence Brief',
    query: 'Synthesize multi-modal telemetry and market positioning vectors for autonomous edge AI agent frameworks in 2026.',
    autonomy: 'balanced',
  },
  {
    label: 'Self-Healing System Diagnosis',
    query: 'Investigate node memory spikes, inspect active goroutines, and verify failover invariants for cluster node alpha.',
    autonomy: 'high',
  },
];

export const MissionInput: React.FC<MissionInputProps> = ({ onLaunchMission, status }) => {
  const [missionText, setMissionText] = useState('');
  const [autonomyLevel, setAutonomyLevel] = useState<'conservative' | 'balanced' | 'high' | 'extreme'>('high');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionText.trim() || status === 'planning' || status === 'executing') return;
    onLaunchMission(missionText.trim(), autonomyLevel);
  };

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setMissionText(preset.query);
    setAutonomyLevel(preset.autonomy as any);
  };

  const isBusy = status === 'planning' || status === 'executing';

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-6 backdrop-blur-sm relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Mission Directives & Directive Dispatcher
          </h2>
          <p className="text-xs text-slate-400">
            Define objectives for EVE PRIME. The agent will formulate multi-step plans, invoke tools, and produce deliverables.
          </p>
        </div>

        {/* Autonomy Level */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Autonomy:</span>
          <select
            value={autonomyLevel}
            onChange={(e) => setAutonomyLevel(e.target.value as any)}
            disabled={isBusy}
            className="bg-transparent text-xs text-cyan-300 font-mono focus:outline-none cursor-pointer"
          >
            <option value="conservative" className="bg-slate-900 text-slate-200">Conservative (Guarded)</option>
            <option value="balanced" className="bg-slate-900 text-slate-200">Balanced</option>
            <option value="high" className="bg-slate-900 text-slate-200">High (Proactive)</option>
            <option value="extreme" className="bg-slate-900 text-slate-200">Autonomous Core (Full)</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={missionText}
            onChange={(e) => setMissionText(e.target.value)}
            disabled={isBusy}
            placeholder="Instruct EVE PRIME: e.g. 'Deploy an autonomous worker thread pool with circuit breaker and telemetry metrics'..."
            className="w-full bg-slate-950/90 border border-slate-700/80 rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
              Ctrl+Enter to dispatch
            </span>
            <button
              type="submit"
              disabled={!missionText.trim() || isBusy}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-semibold flex items-center gap-2 transition-all ${
                isBusy
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/20 active:scale-95'
              }`}
            >
              {isBusy ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-cyan-400 rounded-full animate-spin" />
                  PROCESSING
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  DISPATCH MISSION
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Preset Suggestions */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Tactical Directives
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isBusy}
              onClick={() => handleSelectPreset(p)}
              className="text-left p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all text-xs group"
            >
              <div className="font-semibold text-slate-300 group-hover:text-cyan-300 flex items-center justify-between">
                <span>{p.label}</span>
                <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                {p.query}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
