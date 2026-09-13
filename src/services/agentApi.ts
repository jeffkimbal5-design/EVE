import {
  MissionResult,
  SystemStatus,
  AlgorithmSpec,
  SelfModificationCycleResponse,
  SymbolicVerificationResult,
  FormalInvariant,
} from '../types';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function runAgentMission(
  mission: string,
  context?: string,
  autonomyLevel = 'high'
): Promise<{ success: boolean; source: string; data: MissionResult }> {
  const res = await fetch('/api/agent/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mission, context, autonomyLevel }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Agent mission execution failed');
  }

  return res.json();
}

export async function executeToolDirectly(
  toolName: string,
  parameters: Record<string, unknown>
): Promise<any> {
  const res = await fetch('/api/agent/execute-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toolName, parameters }),
  });

  if (!res.ok) {
    throw new Error(`Tool execution failed: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchNeurosymbolicAlgorithms(): Promise<AlgorithmSpec[]> {
  const res = await fetch('/api/neurosymbolic/algorithms');
  if (!res.ok) {
    throw new Error('Failed to fetch algorithms');
  }
  const data = await res.json();
  return data.data;
}

export async function triggerSelfModificationCycle(
  algorithmId: string,
  goal = 'optimization'
): Promise<SelfModificationCycleResponse> {
  const res = await fetch('/api/neurosymbolic/cycle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithmId, goal }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Self-modification cycle failed');
  }
  return res.json();
}

export async function executeAlgorithmSandbox(
  algorithmId: string,
  input: string
): Promise<{ success: boolean; result: any; executionTimeUs: number; error?: string }> {
  const res = await fetch('/api/neurosymbolic/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithmId, input }),
  });
  if (!res.ok) {
    throw new Error('Sandbox execution failed');
  }
  return res.json();
}

export async function resetAlgorithmToGenesis(algorithmId: string): Promise<AlgorithmSpec> {
  const res = await fetch('/api/neurosymbolic/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithmId }),
  });
  if (!res.ok) {
    throw new Error('Reset algorithm failed');
  }
  const data = await res.json();
  return data.data;
}

export async function verifyCandidateCode(
  algorithmId: string,
  candidateCode: string,
  invariants?: FormalInvariant[]
): Promise<{ success: boolean; verification: SymbolicVerificationResult }> {
  const res = await fetch('/api/neurosymbolic/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithmId, candidateCode, invariants }),
  });
  if (!res.ok) {
    throw new Error('Verification failed');
  }
  return res.json();
}
