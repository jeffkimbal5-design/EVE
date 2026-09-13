import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  HypercubeRenderMode,
} from '../types';
import { HypercubeCanvas } from './HypercubeCanvas';
import { HypercubeInspector } from './HypercubeInspector';
import { RUNIC_CIPHERS, hammingDistance } from '../utils/hypercubeMath';
import {
  Box,
  Rotate3d,
  Layers,
  Sparkles,
  Binary,
  Compass,
  Cpu,
  ShieldCheck,
  Zap,
  KeyRound,
  Eye,
  Info,
  Dna,
} from 'lucide-react';

interface HypercubeStudioProps {
  onLogEvent?: (level: 'info' | 'warn' | 'success' | 'agent' | 'tool', msg: string) => void;
  speak?: (text: string) => void;
}

export const HypercubeStudio: React.FC<HypercubeStudioProps> = ({
  onLogEvent,
  speak,
}) => {
  const [mode, setMode] = useState<HypercubeRenderMode>('runic_cipher');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  const [wSlice, setWSlice] = useState<number>(0.0);
  const [satFormula, setSatFormula] = useState<string>('cdcl_hard');
  const [glowIntensity, setGlowIntensity] = useState<number>(1.1);
  const [showArtifactReference, setShowArtifactReference] = useState<boolean>(false);

  // HDC Vector Symbolic Architecture state
  const [hdcVectorA, setHdcVectorA] = useState<number>(3); // binary 0011
  const [hdcVectorB, setHdcVectorB] = useState<number>(6); // binary 0110

  const handleSelectVertex = (idx: number | null) => {
    setSelectedVertex(idx);
    if (idx !== null) {
      const v = RUNIC_CIPHERS[idx];
      onLogEvent?.(
        'tool',
        `Inspected Hypercube Node #${idx} |${idx.toString(2).padStart(4, '0')}⟩: ${v.concept} [${v.glyph}]`
      );
    }
  };

  const handleToggleAutoRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    onLogEvent?.('info', `Hypercube 4D Auto-Rotation ${next ? 'engaged' : 'halted'}.`);
  };

  // VSA Operations
  const vsaBound = hdcVectorA ^ hdcVectorB; // XOR is binding in binary hypercubes
  const vsaBundleHamming = hammingDistance(hdcVectorA, hdcVectorB);
  const vsaPermute = ((hdcVectorA << 1) | (hdcVectorA >> 3)) & 0xf; // Circular 4-bit bitshift

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Box className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold font-mono tracking-wide text-white">
                4D NEUROSYMBOLIC HYPERCUBE MATRIX
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                TESSERACT SO(4)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Higher-dimensional state manifold embodying dual-system neurosymbolic reasoning.
              Features continuous 4D rotation through hyperplanes (XW, YW, ZW), cryptographic runic cipher inscriptions,
              and Vector Symbolic Architecture (HDC) on {'{0, 1}⁴'}.
            </p>
          </div>

          {/* Dimension Metric Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px]">DIMENSIONS</span>
              <span className="text-cyan-400 font-bold">4D [X, Y, Z, W]</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px]">VERTICES</span>
              <span className="text-emerald-400 font-bold">2⁴ = 16</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px]">HYPER-EDGES</span>
              <span className="text-purple-400 font-bold">32 EDGES</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px]">BOUNDING CELLS</span>
              <span className="text-blue-400 font-bold">8 CUBES</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 4D Canvas + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive 4D Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <HypercubeCanvas
            mode={mode}
            autoRotate={autoRotate}
            onToggleAutoRotate={handleToggleAutoRotate}
            selectedVertex={selectedVertex}
            onSelectVertex={handleSelectVertex}
            satFormula={satFormula}
            wSlice={wSlice}
            glowIntensity={glowIntensity}
          />

          {/* Cryptographic Runic Cipher Inscription Decoder */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-200">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>CRYPTOGRAPHIC RUNIC CIPHER MATRIX (ARTIFACT DECODER)</span>
              </div>
              <button
                onClick={() => setShowArtifactReference(!showArtifactReference)}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showArtifactReference ? 'HIDE ARTIFACT' : 'VIEW ARTIFACT'}</span>
              </button>
            </div>

            {/* Collapsible Artifact Reference Card */}
            {showArtifactReference && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center gap-4"
              >
                <div className="w-32 h-32 rounded-lg border border-cyan-500/40 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-cyan-950/40">
                  <div className="text-center p-2 font-mono text-[10px] text-cyan-300 space-y-1">
                    <Box className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
                    <div className="font-bold text-slate-200">EVE_PRIME</div>
                    <div className="text-cyan-400 font-semibold">HYPERCUBE</div>
                    <div className="text-[9px] text-slate-500">Artifact Reference</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono text-slate-300">
                  <h5 className="font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Artifact Inscriptions: The Cryptographic Monolith
                  </h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    The floating hypercube artifact embodies an ancient cybernetic cipher inscribed with
                    discrete propositional logic clauses, mathematical operators, and runic glyphs. The levitating
                    glass disc ground plane reflects quantum-coherent states across the 4-dimensional continuum.
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                    <span>Key Signatures: 9 9 P, ◬, ⧖, ⨀</span>
                    <span>•</span>
                    <span>Material: Dark Slate-Teal Metamaterial</span>
                    <span>•</span>
                    <span>Substrate: Coherent Glass Pedestal</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Inscribed Runes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {RUNIC_CIPHERS.slice(0, 8).map((cipher, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectVertex(idx)}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-cyan-400 font-bold group-hover:text-cyan-300">
                      {cipher.glyph}
                    </span>
                    <span className="text-[10px] text-slate-500">{cipher.rune}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-200 truncate">
                    {cipher.symbol}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {cipher.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vector Symbolic Architecture (VSA / HDC) Live Calculator */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-200">
                <Dna className="w-4 h-4 text-purple-400" />
                <span>HYPERDIMENSIONAL COMPUTING (HDC) & VECTOR SYMBOLIC ARCHITECTURE</span>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                VSA ON B⁴
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              In neurosymbolic architectures, hypercubes represent the geometric space for Vector Symbolic Architectures (VSA).
              Manipulate symbols via multiplicative binding ($\otimes$), additive bundling ($\oplus$), and coordinate permutation ($\rho$).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
              {/* Vector A Input */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>VECTOR A (SYMBOL 1):</span>
                  <span className="text-cyan-400 font-bold">|{hdcVectorA.toString(2).padStart(4, '0')}⟩</span>
                </div>
                <select
                  value={hdcVectorA}
                  onChange={(e) => setHdcVectorA(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {RUNIC_CIPHERS.map((c, i) => (
                    <option key={i} value={i}>
                      |{i.toString(2).padStart(4, '0')}⟩ {c.symbol} ({c.glyph})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vector B Input */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>VECTOR B (SYMBOL 2):</span>
                  <span className="text-cyan-400 font-bold">|{hdcVectorB.toString(2).padStart(4, '0')}⟩</span>
                </div>
                <select
                  value={hdcVectorB}
                  onChange={(e) => setHdcVectorB(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {RUNIC_CIPHERS.map((c, i) => (
                    <option key={i} value={i}>
                      |{i.toString(2).padStart(4, '0')}⟩ {c.symbol} ({c.glyph})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* VSA Operations Output */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-purple-900/40 text-center">
                <span className="text-[10px] text-slate-500 block">BINDING (A ⊗ B):</span>
                <span className="text-sm font-bold text-purple-300">
                  |{vsaBound.toString(2).padStart(4, '0')}⟩
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {RUNIC_CIPHERS[vsaBound].glyph}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-blue-900/40 text-center">
                <span className="text-[10px] text-slate-500 block">HAMMING DIST:</span>
                <span className="text-sm font-bold text-blue-300">
                  d_H = {vsaBundleHamming} bits
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {vsaBundleHamming === 1 ? 'Direct Hyper-Edge' : 'Diagonal Transit'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-cyan-900/40 text-center">
                <span className="text-[10px] text-slate-500 block">PERMUTATION ρ(A):</span>
                <span className="text-sm font-bold text-cyan-300">
                  |{vsaPermute.toString(2).padStart(4, '0')}⟩
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {RUNIC_CIPHERS[vsaPermute].glyph}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inspector & Mode Controls */}
        <div className="lg:col-span-4 space-y-6">
          <HypercubeInspector
            selectedVertexIndex={selectedVertex}
            onSelectVertex={handleSelectVertex}
            mode={mode}
            onChangeMode={setMode}
            wSlice={wSlice}
            onChangeWSlice={setWSlice}
            satFormula={satFormula}
            onChangeSatFormula={setSatFormula}
            glowIntensity={glowIntensity}
            onChangeGlowIntensity={setGlowIntensity}
          />
        </div>
      </div>
    </div>
  );
};
