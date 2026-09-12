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
  level: 'info' | 'warn' | 'success' | 'agent' | 'tool';
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
