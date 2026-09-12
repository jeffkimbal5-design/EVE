import React, { useState } from 'react';
import {
  Code,
  Globe,
  Database,
  Activity,
  Play,
  RotateCw,
  Terminal,
  CheckCircle,
} from 'lucide-react';
import { executeToolDirectly } from '../services/agentApi';

export const ToolGrid: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'code_sandbox' | 'web_search' | 'memory_vault' | 'system_diagnostics'>('system_diagnostics');
  const [inputVal, setInputVal] = useState('');
  const [running, setRunning] = useState(false);
  const [toolResult, setToolResult] = useState<any>(null);

  const handleExecute = async () => {
    setRunning(true);
    setToolResult(null);
    try {
      let params: Record<string, unknown> = {};
      if (activeTool === 'code_sandbox') {
        params = {
          language: 'typescript',
          code: inputVal || 'const primes = [2, 3, 5, 7, 11];\nconsole.log("Verified EVE Sandbox primes:", primes);',
        };
      } else if (activeTool === 'web_search') {
        params = { query: inputVal || 'autonomous agent architecture patterns 2026' };
      } else if (activeTool === 'memory_vault') {
        params = { action: 'write', key: 'active_session', value: inputVal || 'Session token: EVE_ALPHA_99' };
      } else {
        params = { mode: 'full_audit' };
      }

      const res = await executeToolDirectly(activeTool, params);
      setToolResult(res);
    } catch (err: any) {
      setToolResult({ error: err.message });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Agent Tool Modules & Capabilities
          </h3>
          <p className="text-xs text-slate-400">
            Directly test or inspect any of EVE PRIME's underlying capability modules.
          </p>
        </div>

        {/* Tool selector tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTool('system_diagnostics');
              setToolResult(null);
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTool === 'system_diagnostics'
                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Diagnostics
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTool('code_sandbox');
              setInputVal('function calculateThroughput(tasks: number, ms: number) {\n  return (tasks / (ms / 1000)).toFixed(2) + " ops/sec";\n}');
              setToolResult(null);
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTool === 'code_sandbox'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Sandbox
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTool('web_search');
              setInputVal('Gemini 3.8 Flash agent benchmarks');
              setToolResult(null);
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTool === 'web_search'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTool('memory_vault');
              setInputVal('agent_mode: autonomous_execution');
              setToolResult(null);
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
              activeTool === 'memory_vault'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Memory
          </button>
        </div>
      </div>

      {/* Tool Input / Trigger Area */}
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-3">
        {activeTool !== 'system_diagnostics' ? (
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              Tool Input Parameters
            </label>
            <textarea
              rows={2}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Enter input for ${activeTool}...`}
              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/80"
            />
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-mono">
            Probes active kernel load, memory utilization, routine threads, and network latency.
          </div>
        )}

        <div className="flex justify-between items-center pt-1">
          <span className="text-[11px] text-slate-500 font-mono">
            Isolated execution container
          </span>
          <button
            onClick={handleExecute}
            disabled={running}
            className="px-3 py-1.5 rounded text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            {running ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
            )}
            INVOKE {activeTool.toUpperCase()}
          </button>
        </div>

        {toolResult && (
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Tool Output Stream
            </span>
            <pre className="p-2.5 bg-slate-900/90 rounded border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-40">
              {JSON.stringify(toolResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
