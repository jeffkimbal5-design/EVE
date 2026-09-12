import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Code,
  Globe,
  Database,
  Activity,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ExecutionStep, ToolType } from '../types';

interface ExecutionGraphProps {
  steps: ExecutionStep[];
  activeStepId: string | null;
}

const getToolIcon = (tool: ToolType) => {
  switch (tool) {
    case 'code_sandbox':
      return <Code className="w-4 h-4 text-emerald-400" />;
    case 'web_search':
      return <Globe className="w-4 h-4 text-cyan-400" />;
    case 'memory_vault':
      return <Database className="w-4 h-4 text-amber-400" />;
    case 'system_diagnostics':
      return <Activity className="w-4 h-4 text-purple-400" />;
    default:
      return <Cpu className="w-4 h-4 text-blue-400" />;
  }
};

const getToolBadgeColor = (tool: ToolType) => {
  switch (tool) {
    case 'code_sandbox':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
    case 'web_search':
      return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
    case 'memory_vault':
      return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    case 'system_diagnostics':
      return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
    default:
      return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
  }
};

export const ExecutionGraph: React.FC<ExecutionGraphProps> = ({ steps, activeStepId }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
        <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400 font-medium">Awaiting Mission Directives</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          When you dispatch a mission, EVE PRIME will decompose the problem into an autonomous step execution pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Autonomous Execution Graph
        </h3>
        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          {steps.filter((s) => s.status === 'completed').length} / {steps.length} ROUTINES CONCLUDED
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = activeStepId === step.id;
          const isDone = step.status === 'completed';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className={`p-3.5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-slate-950 border-cyan-500/80 shadow-sm shadow-cyan-950/50'
                  : isDone
                  ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/30 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="mt-0.5 sm:mt-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isActive ? (
                      <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                      <h4 className="text-xs sm:text-sm font-medium text-slate-100 font-mono">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded border flex items-center gap-1.5 ${getToolBadgeColor(
                      step.tool
                    )}`}
                  >
                    {getToolIcon(step.tool)}
                    <span className="uppercase">{step.tool.replace('_', ' ')}</span>
                  </span>
                </div>
              </div>

              {/* Step Output / Log Snippet if completed */}
              {step.output && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-xs font-mono text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800 flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300 break-all">{step.output}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
