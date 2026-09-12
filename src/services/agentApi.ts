import { MissionResult, SystemStatus } from '../types';

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
