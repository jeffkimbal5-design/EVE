import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, ArrowDownCircle } from 'lucide-react';
import { LogEntry } from '../types';

interface TelemetryLogProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const TelemetryLog: React.FC<TelemetryLogProps> = ({ logs, onClearLogs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'agent':
        return 'text-cyan-400 font-semibold';
      case 'tool':
        return 'text-purple-400 font-semibold';
      case 'success':
        return 'text-emerald-400 font-semibold';
      case 'warn':
        return 'text-amber-400 font-semibold';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Live Agent Telemetry & Log Stream
        </h3>
        <button
          onClick={onClearLogs}
          title="Clear Log Terminal"
          className="text-xs text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs text-slate-300 h-48 overflow-y-auto space-y-1.5 scroll-smooth"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-6">
            Listening for kernel events...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 shrink-0 select-none text-[11px]">
                {log.timestamp}
              </span>
              <span className={`uppercase text-[10px] px-1 rounded bg-slate-900 shrink-0 select-none ${getLevelColor(log.level)}`}>
                {log.level}
              </span>
              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
