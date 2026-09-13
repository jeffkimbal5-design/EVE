import React from 'react';
import {
  HypercubeVertex,
  HypercubeRenderMode,
} from '../types';
import {
  RUNIC_CIPHERS,
  generateHypercubeVertices,
  hammingDistance,
  evaluateSATFormula,
} from '../utils/hypercubeMath';
import {
  Box,
  Binary,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  Hash,
  Dna,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface HypercubeInspectorProps {
  selectedVertexIndex: number | null;
  onSelectVertex: (index: number | null) => void;
  mode: HypercubeRenderMode;
  onChangeMode: (mode: HypercubeRenderMode) => void;
  wSlice: number;
  onChangeWSlice: (val: number) => void;
  satFormula: string;
  onChangeSatFormula: (formula: string) => void;
  glowIntensity: number;
  onChangeGlowIntensity: (val: number) => void;
}

export const HypercubeInspector: React.FC<HypercubeInspectorProps> = ({
  selectedVertexIndex,
  onSelectVertex,
  mode,
  onChangeMode,
  wSlice,
  onChangeWSlice,
  satFormula,
  onChangeSatFormula,
  glowIntensity,
  onChangeGlowIntensity,
}) => {
  const vertices = generateHypercubeVertices();
  const selectedVertex =
    selectedVertexIndex !== null ? vertices[selectedVertexIndex] : null;

  // Neighbors of selected vertex (Hamming distance = 1)
  const neighbors = selectedVertex
    ? [0, 1, 2, 3].map((axis) => {
        const neighborIdx = selectedVertex.index ^ (1 << axis);
        const axisNames = ['X-Axis', 'Y-Axis', 'Z-Axis', 'W-Hyper'];
        return {
          vertex: vertices[neighborIdx],
          axisName: axisNames[axis],
          axis,
        };
      })
    : [];

  return (
    <div className="space-y-5">
      {/* Rendering Mode Selector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
        <h4 className="text-xs font-mono font-semibold text-slate-300 mb-2.5 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          4D HYPERCUBE PROJECTION MODE
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChangeMode('runic_cipher')}
            className={`p-2.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${
              mode === 'runic_cipher'
                ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200 shadow-md shadow-cyan-950/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>RUNIC CIPHER</span>
              <span className="text-[10px] text-cyan-400 font-normal">ARTIFACT</span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              Etched glyphs & illuminated pedestal
            </div>
          </button>

          <button
            onClick={() => onChangeMode('tesseract_wireframe')}
            className={`p-2.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${
              mode === 'tesseract_wireframe'
                ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200 shadow-md shadow-cyan-950/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>TESSERACT 4D</span>
              <span className="text-[10px] text-purple-400 font-normal">SCHLEGEL</span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              Inner-outer morphing wireframe
            </div>
          </button>

          <button
            onClick={() => onChangeMode('boolean_sat')}
            className={`p-2.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${
              mode === 'boolean_sat'
                ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200 shadow-md shadow-cyan-950/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>BOOLEAN SAT</span>
              <span className="text-[10px] text-emerald-400 font-normal">SOLVER</span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              Truth assignment state lattice
            </div>
          </button>

          <button
            onClick={() => onChangeMode('hdc_lattice')}
            className={`p-2.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${
              mode === 'hdc_lattice'
                ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200 shadow-md shadow-cyan-950/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>VECTOR VSA</span>
              <span className="text-[10px] text-blue-400 font-normal">HDC</span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              Hyperdimensional symbolic binding
            </div>
          </button>
        </div>
      </div>

      {/* Dynamic Controls based on Mode */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md space-y-3.5">
        <h4 className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          DIMENSION & RENDERING CONTROLS
        </h4>

        {/* 4D W-Coordinate Slicing Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>4D W-HYPERPLANE SLICE:</span>
            <span className="text-cyan-300 font-semibold">{wSlice.toFixed(2)} W</span>
          </div>
          <input
            type="range"
            min="-1.2"
            max="1.2"
            step="0.05"
            value={wSlice}
            onChange={(e) => onChangeWSlice(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Glow Intensity Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>RUNIC GLOW INTENSITY:</span>
            <span className="text-cyan-300 font-semibold">{Math.round(glowIntensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="2.0"
            step="0.1"
            value={glowIntensity}
            onChange={(e) => onChangeGlowIntensity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Boolean SAT Formula Selector (Visible if SAT mode active) */}
        {mode === 'boolean_sat' && (
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <label className="text-xs font-mono text-emerald-400 block font-semibold">
              ACTIVE PROPOSITIONAL CLAUSE:
            </label>
            <select
              value={satFormula}
              onChange={(e) => onChangeSatFormula(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="horn_clause">Horn Clause: (¬A ∨ B) ∧ (¬B ∨ C) ∧ (¬C ∨ D)</option>
              <option value="invariant_closure">Invariant Closure: (A ∧ B) ∨ (C ∧ D)</option>
              <option value="pigeonhole">Pigeonhole 4-Var: (A ⊕ B) ∧ (C ⊕ D) ∧ (¬A ∨ ¬C)</option>
              <option value="cdcl_hard">CDCL 3-SAT: (A ∨ ¬B ∨ C) ∧ (¬A ∨ B ∨ ¬D)</option>
            </select>
          </div>
        )}
      </div>

      {/* Vertex Inspector Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <h4 className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            QUANTUM-SYMBOLIC REGISTER
          </h4>
          {selectedVertex && (
            <button
              onClick={() => onSelectVertex(null)}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300"
            >
              DESELECT
            </button>
          )}
        </div>

        {selectedVertex ? (
          <div className="space-y-3 font-mono text-xs">
            {/* Binary & Glyph Badge */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500">STATE VECTOR:</div>
                <div className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                  <span>|{selectedVertex.binary}⟩</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-normal">
                    Node #{selectedVertex.index}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-500">RUNIC GLYPH:</div>
                <div className="text-base font-bold text-amber-300">
                  {selectedVertex.glyph}
                </div>
              </div>
            </div>

            {/* Inscribed Concept & 4D Coordinate Spec */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CONCEPT:</span>
                <span className="text-slate-200 font-semibold">{selectedVertex.runeLabel}</span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">4D COORD (X,Y,Z,W):</span>
                <span className="text-slate-200">
                  ({selectedVertex.coords.map((c) => (c > 0 ? '+1' : '-1')).join(', ')})
                </span>
              </div>
            </div>

            {/* SAT Validity Status */}
            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">CLAUSE SATISFACTION:</span>
              {evaluateSATFormula(satFormula, selectedVertex.index) ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SATISFIABLE MODEL
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                  <XCircle className="w-3.5 h-3.5" /> FALSIFIED
                </span>
              )}
            </div>

            {/* Hamming Adjacent Neighbors (4D Hypercube 1-hop) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-500 uppercase">
                Hyper-Connected Neighbors (Hamming Distance = 1):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {neighbors.map(({ vertex, axisName }) => (
                  <button
                    key={vertex.index}
                    onClick={() => onSelectVertex(vertex.index)}
                    className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-600 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-bold">|{vertex.binary}⟩</span>
                      <span className="text-slate-500">{axisName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {vertex.glyph} {vertex.runeLabel.split('(')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-xs font-mono text-slate-500 space-y-1">
            <Box className="w-6 h-6 text-slate-600 mx-auto mb-1 animate-pulse" />
            <p>Click any vertex or face on the 4D canvas to inspect its quantum-symbolic register.</p>
          </div>
        )}
      </div>

      {/* Quick 16-Vertex Grid Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
        <h4 className="text-xs font-mono font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span>HYPERCUBE STATE LATTICE</span>
          <span className="text-[10px] text-slate-500 font-normal">2⁴ = 16 STATES</span>
        </h4>

        <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
          {vertices.map((v) => {
            const isSelected = selectedVertexIndex === v.index;
            const isSat = evaluateSATFormula(satFormula, v.index);
            return (
              <button
                key={v.index}
                onClick={() => onSelectVertex(isSelected ? null : v.index)}
                className={`p-1.5 rounded border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950 border-cyan-400 text-white font-bold'
                    : mode === 'boolean_sat'
                    ? isSat
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:border-emerald-600'
                      : 'bg-rose-950/20 border-rose-900/40 text-rose-400 hover:border-rose-700'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px]">{v.binary}</div>
                <div className="text-[9px] text-slate-500 truncate">{v.glyph}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
