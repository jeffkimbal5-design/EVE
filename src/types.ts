export type AgentStatus = 'idle' | 'planning' | 'executing' | 'completed' | 'error';

export type ToolType =
  | 'web_search'
  | 'code_sandbox'
  | 'memory_vault'
  | 'system_diagnostics'
  | 'synthesis';

export interface ExecutionStep {
  id: string;
  title: string;
  description: string;
  tool: ToolType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  toolInput?: Record<string, unknown>;
  output?: string;
  timestamp?: string;
}

export interface Artifact {
  title: string;
  type: 'code' | 'report' | 'specification' | 'plan';
  content: string;
}

export interface MissionMetrics {
  tokensEstimated: number;
  confidenceScore: number;
  autonomyLoops: number;
  executionDurationMs?: number;
}

export interface MissionResult {
  summary: string;
  reasoningTrace: string[];
  steps: ExecutionStep[];
  deliverable: Artifact;
  metrics: MissionMetrics;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'agent' | 'tool' | 'error';
  message: string;
  source?: string;
}

export interface SystemStatus {
  status: string;
  agent: string;
  version: string;
  hasApiKey: boolean;
  activeModel: string;
  capabilities: string[];
}

export type InvariantType = 'correctness' | 'safety' | 'complexity' | 'termination';

export interface FormalInvariant {
  id: string;
  rule: string;
  type: InvariantType;
  description: string;
  status: 'verified' | 'violated' | 'pending';
  lastChecked?: string;
  proofStatement?: string;
}

export interface FitnessMetrics {
  avgExecutionTimeUs: number;
  memoryAllocBytes: number;
  cyclomaticComplexity: number;
  soundnessScore: number;
  testsPassed: number;
  totalTests: number;
}

export interface GenerationSnapshot {
  generation: number;
  timestamp: string;
  genomeCode: string;
  metrics: FitnessMetrics;
  mutationType?: string;
  mutationRationale?: string;
  verificationPassed: boolean;
}

export interface AlgorithmSpec {
  id: string;
  name: string;
  domain: string;
  description: string;
  currentGeneration: number;
  entryFunction: string;
  sampleInput: string;
  genomeCode: string;
  invariants: FormalInvariant[];
  fitness: FitnessMetrics;
  history: GenerationSnapshot[];
}

export interface MutationProposal {
  source: 'neural_intuition';
  targetGeneration: number;
  mutationType: string;
  mutationRationale: string;
  neuralConfidence: number;
  proposedCode: string;
  diffSummary?: string[];
}

export interface SymbolicVerificationResult {
  source: 'symbolic_rigor_core';
  passed: boolean;
  soundnessProof: string;
  invariantsChecked: Array<{
    id: string;
    rule: string;
    passed: boolean;
    message: string;
  }>;
  counterexample?: string | null;
  formalProofTrace: string[];
  benchmarkBeforeUs: number;
  benchmarkAfterUs: number;
}

export interface SelfModificationCycleResponse {
  success: boolean;
  algorithmId: string;
  cycleId: string;
  timestamp: string;
  generationFrom: number;
  generationTo: number;
  proposal: MutationProposal;
  verification: SymbolicVerificationResult;
  adopted: boolean;
  updatedAlgorithm: AlgorithmSpec;
  deltaMetrics: {
    latencyChangePct: number;
    complexityDelta: number;
    soundnessDelta: number;
  };
}

export type HypercubeRenderMode = 'runic_cipher' | 'tesseract_wireframe' | 'hdc_lattice' | 'boolean_sat';

export interface HypercubeVertex {
  index: number;
  coords: [number, number, number, number]; // [x, y, z, w]
  binary: string; // e.g. "1011"
  symbol: string;
  glyph: string;
  runeLabel: string;
  isSatisfied?: boolean;
}

export interface HypercubeEdge {
  from: number;
  to: number;
  axis: number; // 0=x, 1=y, 2=z, 3=w
}

export interface HypercubeState {
  rotations: {
    xy: number;
    xz: number;
    xw: number;
    yz: number;
    yw: number;
    zw: number;
  };
  wSlice: number;
  perspective4D: number;
  perspective3D: number;
  autoRotate: boolean;
  selectedVertex: number | null;
  mode: HypercubeRenderMode;
  glowIntensity: number;
  satFormula: string;
}
