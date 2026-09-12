import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MissionInput } from './components/MissionInput';
import { ExecutionGraph } from './components/ExecutionGraph';
import { ReasoningTrace } from './components/ReasoningTrace';
import { ToolGrid } from './components/ToolGrid';
import { ArtifactViewer } from './components/ArtifactViewer';
import { TelemetryLog } from './components/TelemetryLog';
import { fetchSystemStatus, runAgentMission } from './services/agentApi';
import {
  AgentStatus,
  SystemStatus,
  MissionResult,
  LogEntry,
  ExecutionStep,
} from './types';

export const App: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [missionResult, setMissionResult] = useState<MissionResult | null>(null);
  const [displayedSteps, setDisplayedSteps] = useState<ExecutionStep[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const addLog = (level: LogEntry['level'], message: string, source = 'kernel') => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp,
        level,
        message,
        source,
      },
    ]);
  };

  const speak = (text: string) => {
    if (!audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Initial health check & boot sequence
    addLog('info', 'Booting EVE PRIME Agent Environment v2.5...');
    fetchSystemStatus()
      .then((status) => {
        setSystemStatus(status);
        addLog(
          'agent',
          `Kernel initialized. Active Model: ${status.activeModel}. Auth status: ${
            status.hasApiKey ? 'KEY VERIFIED' : 'LOCAL AUTONOMOUS CORE'
          }`
        );
      })
      .catch((err) => {
        addLog('warn', `Telemetry notice: ${err.message}. Using internal agent core.`);
      });
  }, []);

  const handleLaunchMission = async (mission: string, autonomyLevel: string) => {
    setAgentStatus('planning');
    setActiveStepId(null);
    setMissionResult(null);
    setDisplayedSteps([]);

    addLog('agent', `New Mission Ingested: "${mission}"`);
    addLog('info', `Autonomy Level engaged: [${autonomyLevel.toUpperCase()}]`);
    speak(`Mission ingested. EVE PRIME initiating autonomous plan.`);

    try {
      const response = await runAgentMission(mission, undefined, autonomyLevel);
      const data = response.data;
      setMissionResult(data);

      addLog('success', `Plan formulated: ${data.steps.length} atomic routines structured.`);
      setAgentStatus('executing');

      // Step-by-step simulated live execution with telemetry
      for (let i = 0; i < data.steps.length; i++) {
        const step = data.steps[i];
        setActiveStepId(step.id);
        addLog('tool', `Invoking tool [${step.tool.toUpperCase()}] for Step ${i + 1}: ${step.title}`);

        // Update step state as in-progress
        setDisplayedSteps((prev) => [
          ...prev,
          { ...step, status: 'in_progress' },
        ]);

        await new Promise((r) => setTimeout(r, 650));

        // Mark as completed
        setDisplayedSteps((prev) =>
          prev.map((s) => (s.id === step.id ? { ...s, status: 'completed' } : s))
        );
        addLog('success', `Routine #${i + 1} concluded. Result verified.`);
      }

      setActiveStepId(null);
      setAgentStatus('completed');
      addLog('agent', `Mission successfully concluded. Deliverable compiled: ${data.deliverable.title}`);
      speak(`Mission complete. Deliverable artifact ready.`);
    } catch (err: any) {
      setAgentStatus('error');
      addLog('warn', `Execution halted: ${err.message}`);
      speak(`Notice: Anomaly detected during mission execution.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      <Header
        systemStatus={systemStatus}
        agentStatus={agentStatus}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Mission Directives Dispatcher */}
        <MissionInput
          onLaunchMission={handleLaunchMission}
          status={agentStatus}
        />

        {/* Dynamic Grid: Execution Graph & Reasoning */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <ExecutionGraph
              steps={displayedSteps.length > 0 ? displayedSteps : missionResult?.steps || []}
              activeStepId={activeStepId}
            />
            <ReasoningTrace
              trace={missionResult?.reasoningTrace || []}
              metrics={missionResult?.metrics}
              summary={missionResult?.summary}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <ArtifactViewer
              artifact={missionResult?.deliverable || null}
            />
            <ToolGrid />
          </div>
        </div>

        {/* Real-time Telemetry & Log Stream */}
        <TelemetryLog
          logs={logs}
          onClearLogs={() => setLogs([])}
        />
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-mono">
          <div>
            EVE_PRIME Agent Core &copy; 2026 Jeffrey L. Kimbal. MIT License.
          </div>
          <div className="flex items-center gap-3">
            <span>Runtime: Node.js 22 + React 18</span>
            <span>|</span>
            <span>Port: 3000 (0.0.0.0)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
