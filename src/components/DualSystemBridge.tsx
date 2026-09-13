import React from 'react';
import { motion } from 'motion/react';
import {
  Brain,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Layers,
  Zap,
} from 'lucide-react';

interface DualSystemBridgeProps {
  isCycleActive: boolean;
  activePhase: 'idle' | 'neural_propose' | 'symbolic_verify' | 'adoption' | 'error';
  lastProposalType?: string;
  lastProofResult?: string;
  currentGen: number;
}

export const DualSystemBridge: React.FC<DualSystemBridgeProps> = ({
  isCycleActive,
  activePhase,
  lastProposalType,
  lastProofResult,
  currentGen,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-md relative overflow-hidden">
      {/* Background subtle grid accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800 relative z-10">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Neurosymbolic Dual-System Architecture
          </h3>
          <p className="text-xs text-slate-400">
            System 1 generates intuitive heuristic code mutations; System 2 enforces formal mathematical proofs and deductive invariants.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            LOOP ACTIVE // GEN {currentGen}
          </span>
        </div>
      </div>

      {/* Tri-Node Interactive Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
        {/* Node 1: System 1 (Neural Intuition) */}
        <motion.div
          animate={{
            borderColor:
              activePhase === 'neural_propose'
                ? 'rgba(6, 182, 212, 0.8)'
                : 'rgba(51, 65, 85, 0.6)',
            backgroundColor:
              activePhase === 'neural_propose'
                ? 'rgba(8, 51, 68, 0.4)'
                : 'rgba(15, 23, 42, 0.7)',
          }}
          className="rounded-lg p-3.5 border transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
              <Brain className="w-4 h-4" />
              <span>SYSTEM 1: NEURAL INTUITION</span>
            </div>
            {activePhase === 'neural_propose' && (
              <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Gemini 3.8 Flash probabilistic engine. Inspects AST bottlenecks, synthesizes algorithmic candidate mutations, and proposes structural optimizations.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300">
            Output: <span className="text-slate-300">{lastProposalType || 'Candidate AST Mutation'}</span>
          </div>
        </motion.div>

        {/* Node 2: Neurosymbolic Bridge (Feedback & Gate) */}
        <motion.div
          animate={{
            borderColor:
              activePhase === 'symbolic_verify'
                ? 'rgba(168, 85, 247, 0.8)'
                : 'rgba(51, 65, 85, 0.6)',
            backgroundColor:
              activePhase === 'symbolic_verify'
                ? 'rgba(59, 7, 100, 0.4)'
                : 'rgba(15, 23, 42, 0.7)',
          }}
          className="rounded-lg p-3.5 border transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-semibold">
              <Zap className="w-4 h-4" />
              <span>BIDIRECTIONAL FILTER GATE</span>
            </div>
            {activePhase === 'symbolic_verify' && (
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Isolated VM execution sandbox with zero-trust containment. Rejects hallucinations and translates symbolic counterexamples into corrective neural prompts.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-purple-300">
            Fuzzing: <span className="text-slate-300">7 Domain Boundary Vectors</span>
          </div>
        </motion.div>

        {/* Node 3: System 2 (Symbolic Rigor Core) */}
        <motion.div
          animate={{
            borderColor:
              activePhase === 'adoption'
                ? 'rgba(16, 185, 129, 0.8)'
                : 'rgba(51, 65, 85, 0.6)',
            backgroundColor:
              activePhase === 'adoption'
                ? 'rgba(6, 78, 59, 0.4)'
                : 'rgba(15, 23, 42, 0.7)',
          }}
          className="rounded-lg p-3.5 border transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>SYSTEM 2: SYMBOLIC RIGOR</span>
            </div>
            {activePhase === 'adoption' && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            First-order logic prover. Verifies monotonicity, multi-set conservation, termination guarantees, and asymptotic O(N log N) envelopes.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-300">
            Proof: <span className="text-slate-300">{lastProofResult || 'Soundness Invariants Enforced'}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
