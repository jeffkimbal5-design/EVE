import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Timer, Terminal } from 'lucide-react';
import { executeAlgorithmSandbox } from '../services/agentApi';

interface SandboxRunnerProps {
  algorithmId: string;
  entryFunction: string;
  defaultInput: string;
  currentGen: number;
}

export const SandboxRunner: React.FC<SandboxRunnerProps> = ({
  algorithmId,
  entryFunction,
  defaultInput,
  currentGen,
}) => {
  const [inputVal, setInputVal] = useState(defaultInput);
  const [outputVal, setOutputVal] = useState<string | null>(null);
  const [execTimeUs, setExecTimeUs] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync when defaultInput changes (e.g. changing algorithm)
  React.useEffect(() => {
    setInputVal(defaultInput);
    setOutputVal(null);
    setExecTimeUs(null);
    setError(null);
  }, [defaultInput, algorithmId]);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await executeAlgorithmSandbox(algorithmId, inputVal);
      if (res.success) {
        setOutputVal(
          typeof res.result === 'object'
            ? JSON.stringify(res.result, null, 2)
            : String(res.result)
        );
        setExecTimeUs(res.executionTimeUs);
      } else {
        setError(res.error || 'Execution encountered an anomaly.');
      }
    } catch (err: any) {
      setError(err.message || 'Sandbox communication error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Live VM Execution Sandbox
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Execute the active Gen {currentGen} algorithm against test vectors in isolated Node.js context.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInputVal(defaultInput)}
            className="px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-800 rounded hover:border-slate-700 bg-slate-950 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> RESET INPUT
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Input area */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            INPUT PARAMETERS FOR <code className="text-cyan-400">{entryFunction}</code>:
          </label>
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            placeholder="Enter input JSON or array..."
          />
        </div>

        {/* Execution trigger */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
            {isRunning ? 'EVALUATING IN SANDBOX...' : 'EXECUTE GENOME'}
          </button>

          {execTimeUs !== null && (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg">
              <Timer className="w-3.5 h-3.5" />
              <span>
                LATENCY: <strong>{execTimeUs} μs</strong> (microsecond precision)
              </span>
            </div>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-xs font-mono text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase text-[10px] text-rose-400">
                SANDBOX FAULT
              </div>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Output area */}
        {outputVal !== null && (
          <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 pb-1 border-b border-slate-900">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SANDBOX RESULT VERIFIED (EXIT 0)</span>
              </div>
              <span>RETURN PAYLOAD</span>
            </div>
            <pre className="text-cyan-200 overflow-x-auto whitespace-pre-wrap max-h-48">
              {outputVal}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
