import React, { useState } from 'react';
import { FileCode, FileText, Copy, Check, Download, ExternalLink, Sparkles } from 'lucide-react';
import { Artifact } from '../types';

interface ArtifactViewerProps {
  artifact: Artifact | null;
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ artifact }) => {
  const [copied, setCopied] = useState(false);

  if (!artifact) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-8 text-center backdrop-blur-sm">
        <FileCode className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400 font-medium">No Artifact Generated Yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Completed missions will compile code modules, architectural briefs, or specifications here.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.title.toLowerCase().replace(/\s+/g, '_')}.${artifact.type === 'code' ? 'ts' : 'md'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            {artifact.type === 'code' ? (
              <FileCode className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100 font-mono">
                {artifact.title}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                {artifact.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Compiled by EVE PRIME Synthesis Core</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>COPY</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 overflow-hidden">
        <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto max-h-96 whitespace-pre-wrap">
          {artifact.content}
        </pre>
      </div>
    </div>
  );
};
