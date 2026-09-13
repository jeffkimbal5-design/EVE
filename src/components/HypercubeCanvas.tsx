import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  HypercubeVertex,
  HypercubeEdge,
  HypercubeRenderMode,
} from '../types';
import {
  generateHypercubeVertices,
  generateHypercubeEdges,
  generateHypercubeFaces,
  rotate4D,
  project4Dto3D,
  project3Dto2D,
  evaluateSATFormula,
  hammingDistance,
} from '../utils/hypercubeMath';
import {
  Rotate3d,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Eye,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface HypercubeCanvasProps {
  mode: HypercubeRenderMode;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  selectedVertex: number | null;
  onSelectVertex: (index: number | null) => void;
  satFormula: string;
  wSlice: number;
  glowIntensity: number;
}

export const HypercubeCanvas: React.FC<HypercubeCanvasProps> = ({
  mode,
  autoRotate,
  onToggleAutoRotate,
  selectedVertex,
  onSelectVertex,
  satFormula,
  wSlice,
  glowIntensity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 4D Rotation Angles (in radians)
  const anglesRef = useRef({
    xy: 0.35,
    xz: 0.25,
    xw: 0.15,
    yz: -0.2,
    yw: 0.1,
    zw: 0.05,
  });

  const [scale, setScale] = useState<number>(240);
  const [hoveredVertex, setHoveredVertex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const dragModeRef = useRef<'3D' | '4D'>('3D');

  // Cache static topology
  const rawVertices = useRef<HypercubeVertex[]>(generateHypercubeVertices()).current;
  const rawEdges = useRef<HypercubeEdge[]>(generateHypercubeEdges()).current;
  const rawFaces = useRef<number[][]>(generateHypercubeFaces()).current;

  // Track projected 2D points for click/hover hit-testing
  const projectedPointsRef = useRef<Array<{ x: number; y: number; index: number; depth: number }>>([]);

  // Animation frame loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      if (autoRotate) {
        // Continuous rotation in 4D hyperplanes (produces the classic tesseract inversion!)
        anglesRef.current.xy += 0.006;
        anglesRef.current.xw += 0.009;
        anglesRef.current.yw += 0.007;
        anglesRef.current.xz += 0.004;
      }

      draw();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [autoRotate, mode, selectedVertex, hoveredVertex, satFormula, wSlice, glowIntensity, scale]);

  // Handle ResizeObserver for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
      canvasRef.current.style.width = `${rect.width}px`;
      canvasRef.current.style.height = `${rect.height}px`;
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const center = { x: width / 2, y: height / 2 - 20 };

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 1. Draw atmospheric background & radial mood
    const bgGradient = ctx.createRadialGradient(
      center.x,
      center.y - 40,
      20,
      center.x,
      center.y,
      Math.max(width, height) * 0.75
    );
    bgGradient.addColorStop(0, '#0c1d24'); // Deep glowing teal core
    bgGradient.addColorStop(0.45, '#071217'); // Dark slate-teal
    bgGradient.addColorStop(1, '#030709'); // Midnight void
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Floating Circular Glass Pedestal (matching the uploaded image artifact!)
    const pedestalY = center.y + 190;
    const pedestalRadiusX = 180;
    const pedestalRadiusY = 32;

    // Pedestal floor glow & shadow
    const floorGlow = ctx.createRadialGradient(
      center.x,
      pedestalY + 10,
      5,
      center.x,
      pedestalY + 10,
      pedestalRadiusX * 1.3
    );
    floorGlow.addColorStop(0, 'rgba(20, 184, 166, 0.22)');
    floorGlow.addColorStop(0.5, 'rgba(6, 78, 59, 0.08)');
    floorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = floorGlow;
    ctx.beginPath();
    ctx.ellipse(center.x, pedestalY + 20, pedestalRadiusX * 1.25, pedestalRadiusY * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glass disc base cylinder
    ctx.beginPath();
    ctx.ellipse(center.x, pedestalY + 8, pedestalRadiusX, pedestalRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 38, 44, 0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Top surface of the glass pedestal
    ctx.beginPath();
    ctx.ellipse(center.x, pedestalY, pedestalRadiusX, pedestalRadiusY, 0, 0, Math.PI * 2);
    const discGrad = ctx.createLinearGradient(
      center.x - pedestalRadiusX,
      pedestalY,
      center.x + pedestalRadiusX,
      pedestalY
    );
    discGrad.addColorStop(0, 'rgba(20, 184, 166, 0.15)');
    discGrad.addColorStop(0.5, 'rgba(45, 212, 191, 0.45)');
    discGrad.addColorStop(1, 'rgba(20, 184, 166, 0.15)');
    ctx.fillStyle = discGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(94, 234, 212, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subtle inner concentric halo on pedestal
    ctx.beginPath();
    ctx.ellipse(center.x, pedestalY, pedestalRadiusX * 0.75, pedestalRadiusY * 0.75, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Transform & Project the 16 4D Vertices
    const projected: Array<{
      x: number;
      y: number;
      depth: number;
      w4D: number;
      index: number;
      vertex: HypercubeVertex;
      isSatisfied: boolean;
    }> = [];

    rawVertices.forEach((v) => {
      // Apply 4D rotation
      const rotated = rotate4D(v.coords, anglesRef.current);

      // Slicing offset in W
      const sliced: [number, number, number, number] = [
        rotated[0],
        rotated[1],
        rotated[2],
        rotated[3] + wSlice,
      ];

      // 4D to 3D perspective
      const p3D = project4Dto3D(sliced, 2.5);

      // 3D to 2D screen
      const p2D = project3Dto2D(p3D, center, scale, 3.4);

      const isSatisfied = evaluateSATFormula(satFormula, v.index);

      projected.push({
        x: p2D.x,
        y: p2D.y,
        depth: p2D.depth,
        w4D: rotated[3],
        index: v.index,
        vertex: v,
        isSatisfied,
      });
    });

    projectedPointsRef.current = projected.map((p) => ({
      x: p.x,
      y: p.y,
      index: p.index,
      depth: p.depth,
    }));

    // 4. Render Faces (if in Runic Cipher or HDC mode for depth illusion)
    if (mode === 'runic_cipher' || mode === 'hdc_lattice') {
      // Sort faces by average depth
      const sortedFaces = rawFaces
        .map((faceIndices) => {
          const avgDepth =
            faceIndices.reduce((sum, idx) => sum + projected[idx].depth, 0) / 4;
          const avgW =
            faceIndices.reduce((sum, idx) => sum + projected[idx].w4D, 0) / 4;
          return { faceIndices, avgDepth, avgW };
        })
        .sort((a, b) => a.avgDepth - b.avgDepth);

      sortedFaces.forEach(({ faceIndices, avgDepth, avgW }) => {
        const p0 = projected[faceIndices[0]];
        const p1 = projected[faceIndices[1]];
        const p2 = projected[faceIndices[2]];
        const p3 = projected[faceIndices[3]];

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        // 4D W-coordinate determines face luminance and opacity
        const normalizedW = (avgW + 1.5) / 3;
        const alpha = Math.max(0.04, Math.min(0.22, 0.08 + normalizedW * 0.12));

        if (mode === 'runic_cipher') {
          ctx.fillStyle = `rgba(13, 44, 48, ${alpha})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(45, 212, 191, ${alpha * 1.8 * glowIntensity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Render etched runic cipher symbol at face centroid
          const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
          const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
          const faceRune = rawVertices[faceIndices[0]].glyph;

          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = `rgba(94, 234, 212, ${alpha * 2.2 * glowIntensity})`;
          ctx.fillText(faceRune, cx, cy);
        } else {
          ctx.fillStyle = `rgba(30, 58, 138, ${alpha * 0.7})`;
          ctx.fill();
        }
      });
    }

    // 5. Render 32 4D Hyper-Edges
    rawEdges.forEach((edge) => {
      const p1 = projected[edge.from];
      const p2 = projected[edge.to];

      const isHighlighted =
        selectedVertex === edge.from ||
        selectedVertex === edge.to ||
        hoveredVertex === edge.from ||
        hoveredVertex === edge.to;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (mode === 'boolean_sat') {
        // SAT mode: edge connecting two satisfying models glows green
        if (p1.isSatisfied && p2.isSatisfied) {
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
          ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
        } else if (!p1.isSatisfied && !p2.isSatisfied) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.lineWidth = 0.8;
        } else {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
          ctx.lineWidth = 1;
        }
      } else if (mode === 'tesseract_wireframe') {
        // Wireframe mode: color by dimension axis
        // 0=X (cyan), 1=Y (emerald), 2=Z (blue), 3=W (purple/magenta)
        const axisColors = [
          'rgba(34, 211, 238, 0.65)',
          'rgba(52, 211, 153, 0.65)',
          'rgba(96, 165, 250, 0.65)',
          'rgba(192, 132, 252, 0.85)', // W-axis hyper-edge!
        ];
        ctx.strokeStyle = isHighlighted ? '#ffffff' : axisColors[edge.axis];
        ctx.lineWidth = isHighlighted ? 2.5 : edge.axis === 3 ? 1.8 : 1.2;
      } else {
        // Runic Cipher mode
        const edgeAlpha = isHighlighted ? 0.9 : 0.45 * glowIntensity;
        ctx.strokeStyle = isHighlighted
          ? 'rgba(94, 234, 212, 0.95)'
          : `rgba(45, 212, 191, ${edgeAlpha})`;
        ctx.lineWidth = isHighlighted ? 2 : 1.1;
      }

      ctx.stroke();
    });

    // 6. Render 16 Hypercube Vertices
    // Sort vertices by depth so front nodes render over back nodes
    const sortedVertices = [...projected].sort((a, b) => a.depth - b.depth);

    sortedVertices.forEach((p) => {
      const isSelected = selectedVertex === p.index;
      const isHovered = hoveredVertex === p.index;
      const nodeRadius = isSelected ? 8 : isHovered ? 7 : 5;

      // Glow halo
      ctx.beginPath();
      ctx.arc(p.x, p.y, nodeRadius + 4, 0, Math.PI * 2);
      if (mode === 'boolean_sat') {
        ctx.fillStyle = p.isSatisfied
          ? 'rgba(16, 185, 129, 0.35)'
          : 'rgba(239, 68, 68, 0.25)';
      } else if (isSelected || isHovered) {
        ctx.fillStyle = 'rgba(94, 234, 212, 0.55)';
      } else {
        ctx.fillStyle = 'rgba(20, 184, 166, 0.25)';
      }
      ctx.fill();

      // Core Node
      ctx.beginPath();
      ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);

      if (mode === 'boolean_sat') {
        ctx.fillStyle = p.isSatisfied ? '#10b981' : '#ef4444';
        ctx.strokeStyle = p.isSatisfied ? '#6ee7b7' : '#fca5a5';
      } else if (isSelected) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2dd4bf';
      } else if (isHovered) {
        ctx.fillStyle = '#5eead4';
        ctx.strokeStyle = '#ffffff';
      } else {
        ctx.fillStyle = p.vertex.coords[3] > 0 ? '#2dd4bf' : '#0e7490';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      }

      ctx.lineWidth = isSelected || isHovered ? 2 : 1;
      ctx.fill();
      ctx.stroke();

      // Vertex Label (Binary State or Glyph)
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      if (isSelected || isHovered) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${p.vertex.binary} [${p.vertex.glyph}]`, p.x, p.y + 10);
      } else if (mode === 'tesseract_wireframe' || mode === 'boolean_sat') {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
        ctx.fillText(p.vertex.binary, p.x, p.y + 7);
      }
    });

    ctx.restore();
  };

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    dragModeRef.current = e.shiftKey ? '4D' : '3D';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check hit testing on projected 2D points
    let foundIndex: number | null = null;
    const hitRadius = 16;

    for (const pt of projectedPointsRef.current) {
      const dist = Math.hypot(pt.x - mouseX, pt.y - mouseY);
      if (dist <= hitRadius) {
        foundIndex = pt.index;
        break;
      }
    }
    setHoveredVertex(foundIndex);

    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (dragModeRef.current === '4D' || e.shiftKey) {
      // 4D Plane Rotations
      anglesRef.current.xw += dx * 0.01;
      anglesRef.current.yw += dy * 0.01;
    } else {
      // Standard 3D Space Orbit
      anglesRef.current.xy += dx * 0.008;
      anglesRef.current.yz += dy * 0.008;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = () => {
    if (hoveredVertex !== null) {
      onSelectVertex(selectedVertex === hoveredVertex ? null : hoveredVertex);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => Math.max(120, Math.min(480, prev - e.deltaY * 0.3)));
  };

  const handleResetRotations = () => {
    anglesRef.current = {
      xy: 0.35,
      xz: 0.25,
      xw: 0.15,
      yz: -0.2,
      yw: 0.1,
      zw: 0.05,
    };
    setScale(240);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating HUD Controls */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-white">4D HYPERCUBE</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-300">16 VERTICES • 32 EDGES • 8 CELLS</span>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-2">
        {/* Auto Rotate Toggle */}
        <button
          onClick={onToggleAutoRotate}
          className={`p-2 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
            autoRotate
              ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle 4D Hyperplane Auto-Spin"
        >
          <Rotate3d className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">4D SPIN</span>
        </button>

        {/* Zoom Controls */}
        <button
          onClick={() => setScale((s) => Math.min(480, s + 30))}
          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 backdrop-blur-md cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(120, s - 30))}
          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 backdrop-blur-md cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetRotations}
          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 backdrop-blur-md cursor-pointer"
          title="Reset Orientation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mouse Interaction Instruction Overlay */}
      <div className="absolute bottom-3 left-3 bg-slate-900/75 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-400 flex items-center gap-3">
        <span>Click + Drag: 3D Orbit</span>
        <span>•</span>
        <span className="text-cyan-300">Shift + Drag: 4D Inversion (XW/YW)</span>
        <span>•</span>
        <span>Scroll: Zoom</span>
      </div>

      {/* Mode Tag */}
      <div className="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-lg text-[11px] font-mono text-cyan-400">
        PROJECTION: PERSPECTIVE SO(4) → ℝ³ → ℝ²
      </div>
    </div>
  );
};
