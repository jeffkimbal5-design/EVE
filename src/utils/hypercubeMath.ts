import { HypercubeVertex, HypercubeEdge } from '../types';

export const RUNIC_CIPHERS = [
  { glyph: '9 9 P', symbol: 'INIT_PRIMAL', rune: '𐍉 𐌸', concept: 'Primal Seed (0000)', desc: 'Ground state of the computational continuum' },
  { glyph: '◬ ⧖ ⨀', symbol: 'DELTA_BOUND', rune: 'ᛏ ᛒ', concept: 'Temporal Horizon (0001)', desc: 'Forward inductive termination barrier' },
  { glyph: '⩕ ⋈ ⨁', symbol: 'AFFINE_NODE', rune: 'ᚨ ᚲ', concept: 'Permutation Gate (0010)', desc: 'Conservation of multiset invariants' },
  { glyph: '⊞ ⊡ ⨂', symbol: 'TENSOR_CORE', rune: 'ᚷ ᚹ', concept: 'Tensor Orthogonal (0011)', desc: 'Higher-order tensor product state' },
  { glyph: '⍝ ⍟ ⍹', symbol: 'AST_BRANCH', rune: 'ᚺ ᚾ', concept: 'Syntax Tree (0100)', desc: 'Grammar tree bifurcation node' },
  { glyph: '⨝ ⨜ ⨞', symbol: 'JOIN_LATTICE', rune: 'ᛁ ᛃ', concept: 'Monad Convergence (0101)', desc: 'Symbolic join of deductive derivations' },
  { glyph: '⨕ ⨑ ⨒', symbol: 'FOL_PROVER', rune: 'ᛇ ᛈ', concept: 'First-Order Prover (0110)', desc: 'First-order logic deduction axiom' },
  { glyph: '⨊ ⨋ ⨏', symbol: 'SOUND_PROOF', rune: 'ᛉ ᛊ', concept: 'Verified Soundness (0111)', desc: 'Complete sound invariant closure' },
  { glyph: '⋉ ⋊ ⋋', symbol: 'NEURAL_EMBED', rune: 'ᛗ ᛚ', concept: 'Neural Latent (1000)', desc: 'Continuous embedding hyper-vector' },
  { glyph: '⋌ ⋍ ⋎', symbol: 'MUTATION_AST', rune: 'ᛜ ᛞ', concept: 'Adaptive Mutation (1001)', desc: 'Metamorphic code rewrites' },
  { glyph: '⋏ ⋐ ⋑', symbol: 'INDUCTIVE_STEP', rune: 'ᚩ ᚱ', concept: 'Inductive Step (1010)', desc: 'Step-wise monotonicity guarantee' },
  { glyph: '⋒ ⋓ ⋔', symbol: 'VM_SANDBOX', rune: 'ᛋ ᛏ', concept: 'Isolated VM (1011)', desc: 'Sub-millisecond execution cage' },
  { glyph: '⋕ ⋖ ⋗', symbol: 'CDCL_WATCH', rune: 'ᛖ ᛗ', concept: 'Watched Literal (1100)', desc: 'Conflict-driven clause learning node' },
  { glyph: '⋘ ⋙ ⋚', symbol: 'ASYMPTOTIC', rune: 'ᛚ ᛜ', concept: 'Complexity Bound (1101)', desc: 'Strict O(N log N) asymptotic envelope' },
  { glyph: '⋛ ⋜ ⋝', symbol: 'VSA_BIND', rune: 'ᛞ ᛟ', concept: 'Vector Binding (1110)', desc: 'HDC multiplicative symbol binding' },
  { glyph: '⋞ ⋟ ⋠', symbol: 'OMEGA_POINT', rune: 'ᚪ ᚫ', concept: 'Global Invariant (1111)', desc: 'Universal dual-system fixed point' },
];

/**
 * Generate 16 vertices of the 4D Hypercube (Tesseract)
 */
export function generateHypercubeVertices(): HypercubeVertex[] {
  const vertices: HypercubeVertex[] = [];
  for (let i = 0; i < 16; i++) {
    const x = (i & 1) ? 1 : -1;
    const y = (i & 2) ? 1 : -1;
    const z = (i & 4) ? 1 : -1;
    const w = (i & 8) ? 1 : -1;
    const binary = i.toString(2).padStart(4, '0');
    const rune = RUNIC_CIPHERS[i];

    vertices.push({
      index: i,
      coords: [x, y, z, w],
      binary,
      symbol: rune.symbol,
      glyph: rune.glyph,
      runeLabel: rune.concept,
    });
  }
  return vertices;
}

/**
 * Generate 32 edges connecting vertices whose Hamming distance is 1
 */
export function generateHypercubeEdges(): HypercubeEdge[] {
  const edges: HypercubeEdge[] = [];
  for (let i = 0; i < 16; i++) {
    for (let axis = 0; axis < 4; axis++) {
      const neighbor = i ^ (1 << axis);
      if (i < neighbor) {
        edges.push({
          from: i,
          to: neighbor,
          axis,
        });
      }
    }
  }
  return edges;
}

/**
 * Generate 24 square faces of the 4D Hypercube
 */
export function generateHypercubeFaces(): number[][] {
  const faces: number[][] = [];
  // For each pair of coordinate axes (a1, a2) in {0,1,2,3},
  // the other two coordinates can have 4 combinations of values (+-1).
  for (let a1 = 0; a1 < 3; a1++) {
    for (let a2 = a1 + 1; a2 < 4; a2++) {
      const otherAxes = [0, 1, 2, 3].filter((a) => a !== a1 && a !== a2);
      for (let v1 = 0; v1 < 2; v1++) {
        for (let v2 = 0; v2 < 2; v2++) {
          const base = (v1 << otherAxes[0]) | (v2 << otherAxes[1]);
          const p0 = base;
          const p1 = base | (1 << a1);
          const p2 = base | (1 << a1) | (1 << a2);
          const p3 = base | (1 << a2);
          faces.push([p0, p1, p2, p3]);
        }
      }
    }
  }
  return faces;
}

/**
 * 4D Rotation in 6 planes (XY, XZ, XW, YZ, YW, ZW)
 */
export function rotate4D(
  v: [number, number, number, number],
  angles: {
    xy: number;
    xz: number;
    xw: number;
    yz: number;
    yw: number;
    zw: number;
  }
): [number, number, number, number] {
  let [x, y, z, w] = v;

  // XY rotation
  if (angles.xy !== 0) {
    const cos = Math.cos(angles.xy);
    const sin = Math.sin(angles.xy);
    const xNew = x * cos - y * sin;
    const yNew = x * sin + y * cos;
    x = xNew;
    y = yNew;
  }

  // XZ rotation
  if (angles.xz !== 0) {
    const cos = Math.cos(angles.xz);
    const sin = Math.sin(angles.xz);
    const xNew = x * cos - z * sin;
    const zNew = x * sin + z * cos;
    x = xNew;
    z = zNew;
  }

  // XW rotation (4D inner-outer tesseract morphing)
  if (angles.xw !== 0) {
    const cos = Math.cos(angles.xw);
    const sin = Math.sin(angles.xw);
    const xNew = x * cos - w * sin;
    const wNew = x * sin + w * cos;
    x = xNew;
    w = wNew;
  }

  // YZ rotation
  if (angles.yz !== 0) {
    const cos = Math.cos(angles.yz);
    const sin = Math.sin(angles.yz);
    const yNew = y * cos - z * sin;
    const zNew = y * sin + z * cos;
    y = yNew;
    z = zNew;
  }

  // YW rotation (4D inner-outer tesseract morphing)
  if (angles.yw !== 0) {
    const cos = Math.cos(angles.yw);
    const sin = Math.sin(angles.yw);
    const yNew = y * cos - w * sin;
    const wNew = y * sin + w * cos;
    y = yNew;
    w = wNew;
  }

  // ZW rotation
  if (angles.zw !== 0) {
    const cos = Math.cos(angles.zw);
    const sin = Math.sin(angles.zw);
    const zNew = z * cos - w * sin;
    const wNew = z * sin + w * cos;
    z = zNew;
    w = wNew;
  }

  return [x, y, z, w];
}

/**
 * 4D to 3D Perspective Projection
 */
export function project4Dto3D(
  v: [number, number, number, number],
  d4: number = 2.4
): [number, number, number] {
  const [x, y, z, w] = v;
  const denominator = Math.max(0.2, d4 - w);
  const factor = 1.0 / denominator;
  return [x * factor, y * factor, z * factor];
}

/**
 * 3D to 2D Screen Projection
 */
export function project3Dto2D(
  v: [number, number, number],
  center: { x: number; y: number },
  scale: number = 280,
  d3: number = 3.2
): { x: number; y: number; depth: number } {
  const [x, y, z] = v;
  const denominator = Math.max(0.3, d3 - z);
  const factor = 1.0 / denominator;
  return {
    x: center.x + x * factor * scale,
    y: center.y - y * factor * scale,
    depth: z,
  };
}

/**
 * Hamming distance between two 4-bit vertices
 */
export function hammingDistance(v1: number, v2: number): number {
  let xor = v1 ^ v2;
  let count = 0;
  while (xor > 0) {
    count += xor & 1;
    xor >>= 1;
  }
  return count;
}

/**
 * Evaluate boolean SAT formula on a 4-bit vertex
 * Variables: A (bit 0), B (bit 1), C (bit 2), D (bit 3)
 */
export function evaluateSATFormula(
  formulaType: string,
  vertexIndex: number
): boolean {
  const A = !!(vertexIndex & 1);
  const B = !!(vertexIndex & 2);
  const C = !!(vertexIndex & 4);
  const D = !!(vertexIndex & 8);

  switch (formulaType) {
    case 'horn_clause':
      // (A -> B) and (B -> C) and (not C or D)
      return (!A || B) && (!B || C) && (!C || D);
    case 'pigeonhole':
      // 4-variable pigeonhole constraint
      return (A || B) && (!A || !B) && (C || D) && (!C || !D) && (!A || !C);
    case 'invariant_closure':
      // Monotonicity & termination: (A and B) or (C and D)
      return (A && B) || (C && D) || (A && C && D);
    case 'cdcl_hard':
    default:
      // Hard 3-SAT: (A or not B or C) and (not A or B or not D) and (not C or D)
      return (A || !B || C) && (!A || B || !D) && (!C || D) && (B || C || D);
  }
}
