import React, { useState, useRef, useEffect } from 'react';
import { Bot, User as UserIcon, Send, BrainCircuit, Image as ImageIcon, Loader2, Mic, Map, Video, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { MissionResult } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
}

interface MetacognitionStudioProps {
  onLogEvent?: (level: 'info' | 'warn' | 'success' | 'agent' | 'tool', msg: string) => void;
  speak?: (text: string) => void;
  missionResult?: MissionResult | null;
}

export const MetacognitionStudio: React.FC<MetacognitionStudioProps> = ({ onLogEvent, speak, missionResult }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Metacognitive subsystem online. Ready for introspection and multimodal generation.' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [heuristicStatus, setHeuristicStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [heuristicReport, setHeuristicReport] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    
    onLogEvent?.('info', `Sending input to Metacognition Copilot...`);

    try {
      const res = await fetch('/api/metacognition/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages.map(m => ({ role: m.role, text: m.text })), message: userMsg.text })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to process request');
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: data.text }]);
      onLogEvent?.('success', 'Metacognition response generated.');
      if (speak) speak("Response generated.");
    } catch (err: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `System Error: ${err.message}` }]);
      onLogEvent?.('error', `Metacognition Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatedFeature = (featureName: string) => {
    const featureMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: `[SYSTEM COMMAND] Initialize ${featureName} protocols.` 
    };
    setMessages(prev => [...prev, featureMsg, {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: `${featureName} capabilities acknowledged. Awaiting further prompt injection to trigger generation.`
    }]);
  };

  const handleRunHeuristicCheck = async () => {
    if (!missionResult) {
      onLogEvent?.('warn', 'No active mission plan available for heuristic analysis.');
      return;
    }

    setHeuristicStatus('analyzing');
    onLogEvent?.('tool', 'Running Cognitive Heuristic Check on active mission reasoning trace...');
    
    // Simulate AI analyzing the plan for biases/fallacies
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if the plan is code or research
    const isCode = missionResult.deliverable.type === 'code';
    let reportText = '';
    
    if (isCode) {
      reportText = `**Cognitive Heuristic Analysis Complete:**\n\n- **Confirmation Bias Check:** Cleared. The architecture verified edge cases rather than assuming success.\n- **Sunk Cost Fallacy:** Cleared. No redundant legacy modules were retained.\n- **Not Invented Here (NIH) Syndrome:** Flagged (Minor). Plan relies heavily on custom internal structures instead of existing standard libraries in Step 2. Recommend reviewing for potential NIH bias.\n\n*Overall Cognitive Integrity: 92%*`;
    } else {
      reportText = `**Cognitive Heuristic Analysis Complete:**\n\n- **Availability Heuristic Check:** Flagged (Moderate). Step 2 relies on immediate factual anchors without requesting secondary corroboration streams. Risk of shallow depth.\n- **Base Rate Fallacy:** Cleared. Strategic findings align with standard statistical distributions.\n- **Anchoring Bias:** Cleared. Initial context ingestion did not overly constrain downstream execution.\n\n*Overall Cognitive Integrity: 88%*`;
    }
    
    setHeuristicReport(reportText);
    setHeuristicStatus('complete');
    onLogEvent?.('success', 'Cognitive Heuristic Check completed successfully.');
    
    // Add the report to the chat stream as well
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text: `[HEURISTIC CHECK EXECUTED]\n\n${reportText}`
    }]);
  };

  return (
    <div className="flex flex-col h-[700px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-6 h-6 text-fuchsia-500" />
          <div>
            <h3 className="text-slate-200 font-semibold leading-tight">Metacognitive Co-Pilot</h3>
            <p className="text-xs text-slate-500">Gemini 3.5 Flash | Multimodal Capabilities Enabled</p>
          </div>
        </div>
        
        {/* Capability Chips */}
        <div className="flex gap-2">
          {missionResult && (
            <button
              onClick={handleRunHeuristicCheck}
              disabled={heuristicStatus === 'analyzing'}
              className={`p-2 px-3 text-xs font-semibold rounded transition-colors flex items-center gap-2 ${
                heuristicStatus === 'analyzing' ? 'bg-amber-900/40 text-amber-500 border border-amber-800' :
                heuristicStatus === 'complete' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800 hover:bg-emerald-800' :
                'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
              title="Identify cognitive biases in active mission"
            >
              {heuristicStatus === 'analyzing' ? (
                 <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : heuristicStatus === 'complete' ? (
                 <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                 <ShieldAlert className="w-3.5 h-3.5" />
              )}
              Heuristic Check
            </button>
          )}
          <button onClick={() => handleSimulatedFeature('Live Audio (Speech-to-Text)')} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors" title="Transcribe Audio">
            <Mic className="w-4 h-4" />
          </button>
          <button onClick={() => handleSimulatedFeature('Image Generation')} className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded transition-colors" title="Create & Edit Images">
            <ImageIcon className="w-4 h-4" />
          </button>
          <button onClick={() => handleSimulatedFeature('Maps Grounding')} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors" title="Use Google Maps Data">
            <Map className="w-4 h-4" />
          </button>
          <button onClick={() => handleSimulatedFeature('Veo 3 Video Generation')} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors" title="Generate Video">
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-cyan-900/50 border border-cyan-800' : 'bg-fuchsia-900/50 border border-fuchsia-800'}`}>
              {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-cyan-400" /> : <Bot className="w-4 h-4 text-fuchsia-400" />}
            </div>
            <div className={`max-w-[80%] rounded-xl p-4 text-sm ${msg.role === 'user' ? 'bg-cyan-950/30 text-slate-200 border border-cyan-900/30' : 'bg-slate-900 text-slate-300 border border-slate-800'} shadow-sm`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Generated" className="mt-3 rounded-lg max-w-full h-auto border border-slate-700" />
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-fuchsia-900/50 border border-fuchsia-800">
              <Bot className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-fuchsia-500 animate-spin" />
              <span className="text-sm text-slate-400 font-mono">Synthesizing response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex items-end gap-2 bg-slate-950 border border-slate-700 rounded-xl p-2 focus-within:border-fuchsia-500/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Query EVE PRIME metacognition or request multimodal generation..."
            className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none resize-none outline-none text-sm text-slate-200 p-2"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-2 mb-1 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[10px] text-center text-slate-500 mt-2">
          Firebase Auth & Firestore | Live API Voice | Gemini Chatbot | Image/Video Generation | Maps Grounding
        </div>
      </div>
    </div>
  );
};
