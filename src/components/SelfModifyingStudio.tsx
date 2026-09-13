import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlgorithmSpec,
  SelfModificationCycleResponse,
  FormalInvariant,
} from '../types';
import {
  fetchNeurosymbolicAlgorithms,
  triggerSelfModificationCycle,
  resetAlgorithmToGenesis,
} from '../services/agentApi';
import { DualSystemBridge } from './DualSystemBridge';
import { FormalInvariantMatrix } from './FormalInvariantMatrix';
import { AlgorithmGenomeViewer } from './AlgorithmGenomeViewer';
import { SandboxRunner } from './SandboxRunner';
import {
  Brain,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Gauge,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface SelfModifyingStudioProps {
  onLogEvent?: (level: 'info' | 'warn' | 'success' | 'agent' | 'tool', msg: string) => void;
  speak?: (text: string) => void;
}

export const SelfModifyingStudio: React.FC<SelfModifyingStudioProps> = ({
  onLogEvent,
  speak,
}) => {
  const [algorithms, setAlgorithms] = useState<AlgorithmSpec[]>([]);
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>('adaptive-sorter');
  const [selectedGenHistory, setSelectedGenHistory] = useState<number | null>(null);
  const [mutationGoal, setMutationGoal] = useState<string>('optimization');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCycling, setIsCycling] = useState<boolean>(false);
  const [cyclePhase, setCyclePhase] = useState<'idle' | 'neural_propose' | 'symbolic_verify' | 'adoption' | 'error'>('idle');
  const [lastCycleResult, setLastCycleResult] = useState<SelfModificationCycleResponse | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Load algorithms on mount
  useEffect(() => {
    loadAlgorithms();
  }, []);

  const loadAlgorithms = async () => {
    setIsLoading(true);
    try {
      const data = await fetchNeurosymbolicAlgorithms();
      setAlgorithms(data);
      if (data.length > 0 && !selectedAlgoId) {
        setSelectedAlgoId(data[0].id);
      }
    } catch (err: any) {
      onLogEvent?.('warn', `Neurosymbolic data load warning: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const activeAlgorithm =
    algorithms.find((a) => a.id === selectedAlgoId) || algorithms[0];

  const handleTriggerCycle = async () => {
    if (!activeAlgorithm || isCycling) return;
    setIsCycling(true);
    setNotice(null);
    setCyclePhase('neural_propose');

    const startMsg = `Initializing Neurosymbolic cycle for [${activeAlgorithm.name}]. System 1 proposing mutation...`;
    onLogEvent?.('agent', startMsg);
    speak?.(`System 1 neural engine synthesizing mutation for generation ${activeAlgorithm.currentGeneration + 1}.`);

    try {
      // Step 1: Neural synthesis phase simulation delay for visual feedback
      await new Promise((r) => setTimeout(r, 600));
      setCyclePhase('symbolic_verify');
      onLogEvent?.('tool', `Candidate AST synthesized. Dispatching to System 2 Symbolic Rigor Core & VM Sandbox...`);

      // Call server endpoint
      const result = await triggerSelfModificationCycle(activeAlgorithm.id, mutationGoal);
      setLastCycleResult(result);

      await new Promise((r) => setTimeout(r, 500));

      if (result.adopted) {
        setCyclePhase('adoption');
        onLogEvent?.(
          'success',
          `Symbolic verification PASSED (100%). Invariants preserved. Code Genome self-modified to Generation ${result.generationTo}!`
        );
        speak?.(`Formal verification passed. Self-modifying algorithm promoted to generation ${result.generationTo}.`);
      } else {
        setCyclePhase('error');
        onLogEvent?.(
          'warn',
          `Candidate rejected by System 2 prover. Counterexample: ${result.verification.counterexample || 'Invariant violation'}`
        );
      }

      // Update state with modified algorithm
      setAlgorithms((prev) =>
        prev.map((a) => (a.id === result.algorithmId ? result.updatedAlgorithm : a))
      );
      setSelectedGenHistory(null); // Return to active generation view

      setTimeout(() => {
        setCyclePhase('idle');
        setIsCycling(false);
      }, 1200);
    } catch (err: any) {
      setCyclePhase('error');
      setIsCycling(false);
      onLogEvent?.('warn', `Self-modification cycle aborted: ${err.message}`);
      setTimeout(() => setCyclePhase('idle'), 2000);
    }
  };

  const handleResetGenesis = async () => {
    if (!activeAlgorithm) return;
    try {
      const reset = await resetAlgorithmToGenesis(activeAlgorithm.id);
      setAlgorithms((prev) =>
        prev.map((a) => (a.id === reset.id ? reset : a))
      );
      setSelectedGenHistory(null);
      setLastCycleResult(null);
      setNotice(`Reset "${activeAlgorithm.name}" to Gen 0 Genesis.`);
      onLogEvent?.('info', `Reset [${activeAlgorithm.name}] to Generation 0.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      onLogEvent?.('warn', `Reset failed: ${err.message}`);
    }
  };

  if (isLoading || !activeAlgorithm) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl font-mono text-xs text-slate-400">
        <Cpu className="w-6 h-6 text-cyan-400 mx-auto mb-2 animate-pulse" />
        Synchronizing Neurosymbolic Runtime & Verification Provers...
      </div>
    );
  }

  // Calculate speedup vs Gen 0
  const gen0History = activeAlgorithm.history.find((h) => h.generation === 0);
  const baselineLatency = gen0History
    ? gen0History.metrics.avgExecutionTimeUs
    : activeAlgorithm.fitness.avgExecutionTimeUs;
  const currentLatency = activeAlgorithm.fitness.avgExecutionTimeUs;
  const latencyReduction =
    baselineLatency > 0
      ? Math.round(((baselineLatency - currentLatency) / baselineLatency) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Algorithm Archetype Selector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 sm:p-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              ACTIVE SELF-MODIFYING GENOME:
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Select an algorithmic domain to inspect and evolve
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {algorithms.map((algo) => {
            const isSelected = algo.id === selectedAlgoId;
            return (
              <button
                key={algo.id}
                onClick={() => {
                  setSelectedAlgoId(algo.id);
                  setSelectedGenHistory(null);
                  setLastCycleResult(null);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-slate-100 line-clamp-1">
                    {algo.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      algo.currentGeneration > 0
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    GEN {algo.currentGeneration}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {algo.domain}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Telemetry & Fitness Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Generation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>GENERATION</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 flex items-baseline gap-2">
            GEN {activeAlgorithm.currentGeneration}
            {activeAlgorithm.currentGeneration > 0 ? (
              <span className="text-xs font-mono text-emerald-400 font-normal">
                ({activeAlgorithm.history.length} cycles)
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-500 font-normal">
                (Genesis baseline)
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Execution Latency */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>AVG LATENCY</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 flex items-baseline gap-2">
            {activeAlgorithm.fitness.avgExecutionTimeUs} μs
            {latencyReduction > 0 && (
              <span className="text-xs font-mono text-emerald-300 font-semibold flex items-center">
                <TrendingDown className="w-3 h-3 inline" /> {latencyReduction}% faster
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Formal Proof Index */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>PROOF COMPLIANCE</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-400 flex items-baseline gap-2">
            {activeAlgorithm.fitness.soundnessScore}%
            <span className="text-xs font-mono text-slate-400 font-normal">
              ({activeAlgorithm.fitness.testsPassed}/{activeAlgorithm.fitness.totalTests} rules)
            </span>
          </div>
        </div>

        {/* Metric 4: Complexity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>CYCLOMATIC</span>
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300">
            V(G) = {activeAlgorithm.fitness.cyclomaticComplexity}
          </div>
        </div>
      </div>

      {/* Visual Dual-System Architecture Diagram */}
      <DualSystemBridge
        isCycleActive={isCycling}
        activePhase={cyclePhase}
        lastProposalType={lastCycleResult?.proposal.mutationType}
        lastProofResult={lastCycleResult?.verification.soundnessProof}
        currentGen={activeAlgorithm.currentGeneration}
      />

      {/* Interactive Mutation Control Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Self-Modification Trigger & Metamorphic Evolution
            </h4>
            <p className="text-xs text-slate-400">
              System 1 proposes a candidate code mutation. System 2 verifies inductive invariants in the VM sandbox before adoption.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Goal Selector */}
            <select
              value={mutationGoal}
              onChange={(e) => setMutationGoal(e.target.value)}
              disabled={isCycling}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="optimization">Objective: Performance Optimization</option>
              <option value="asymptotic_hardening">Objective: Asymptotic Hardening (O(N log N))</option>
              <option value="branch_pruning">Objective: Branch Pruning & Cache Locality</option>
              <option value="memory_compression">Objective: Memory Alloc Minimization</option>
            </select>

            {/* Cycle Trigger Button */}
            <button
              onClick={handleTriggerCycle}
              disabled={isCycling}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isCycling ? 'animate-spin' : ''}`} />
              {isCycling
                ? 'EVOLVING & VERIFYING...'
                : `TRIGGER SELF-MODIFICATION [→ GEN ${activeAlgorithm.currentGeneration + 1}]`}
            </button>

            {/* Reset to Genesis */}
            <button
              onClick={handleResetGenesis}
              disabled={isCycling || activeAlgorithm.currentGeneration === 0}
              className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-30 text-slate-400 hover:text-slate-200 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-colors"
              title="Reset to Gen 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET GEN 0</span>
            </button>
          </div>
        </div>

        {/* Notice Message */}
        {notice && (
          <div className="mt-3 p-2.5 rounded bg-cyan-950/40 border border-cyan-800/50 text-xs font-mono text-cyan-300">
            {notice}
          </div>
        )}

        {/* Last Cycle Telemetry Report */}
        {lastCycleResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  CYCLE [{lastCycleResult.cycleId}]: GEN {lastCycleResult.generationFrom} → GEN {lastCycleResult.generationTo}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                ADOPTED & HOT-SWAPPED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                  System 1 Neural Proposal:
                </div>
                <div className="text-slate-200 font-semibold">
                  {lastCycleResult.proposal.mutationType}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {lastCycleResult.proposal.mutationRationale}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">
                  System 2 Symbolic Verification:
                </div>
                <div className="text-slate-200 font-mono text-[11px]">
                  Latency Before: {lastCycleResult.verification.benchmarkBeforeUs}μs → After:{' '}
                  <strong className="text-emerald-400">{lastCycleResult.verification.benchmarkAfterUs}μs</strong> (
                  {lastCycleResult.deltaMetrics.latencyChangePct}% reduction)
                </div>
                <p className="text-emerald-300 text-[11px] font-mono">
                  {lastCycleResult.verification.soundnessProof}
                </p>
              </div>
            </div>

            {/* Proof Trace Steps */}
            {lastCycleResult.verification.formalProofTrace.length > 0 && (
              <div className="pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-500 space-y-0.5">
                {lastCycleResult.verification.formalProofTrace.map((trace, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="text-cyan-500">›</span>
                    <span>{trace}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Main Grid: Code Genome & Symbolic Invariants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {/* Active Code Genome & Lineage */}
          <AlgorithmGenomeViewer
            algorithm={activeAlgorithm}
            selectedGeneration={selectedGenHistory}
            onSelectGeneration={(gen) => setSelectedGenHistory(gen)}
          />

          {/* Interactive Live Sandbox Runner */}
          <SandboxRunner
            algorithmId={activeAlgorithm.id}
            entryFunction={activeAlgorithm.entryFunction}
            defaultInput={activeAlgorithm.sampleInput}
            currentGen={activeAlgorithm.currentGeneration}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Formal Invariants & Proof Matrix */}
          <FormalInvariantMatrix
            invariants={activeAlgorithm.invariants}
            soundnessScore={activeAlgorithm.fitness.soundnessScore}
          />
        </div>
      </div>
    </div>
  );
};
