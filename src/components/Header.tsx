import React from 'react';
import {
  Cpu,
  ShieldCheck,
  Activity,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Dna,
  Box,
  LogIn,
  LogOut,
  User as UserIcon,
  HardDrive,
  BrainCircuit
} from 'lucide-react';
import { SystemStatus, AgentStatus } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  systemStatus: SystemStatus | null;
  agentStatus: AgentStatus;
  activeView: 'hypercube' | 'neurosymbolic' | 'missions' | 'workspace' | 'metacognition';
  onViewChange: (view: 'hypercube' | 'neurosymbolic' | 'missions' | 'workspace' | 'metacognition') => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  agentStatus,
  activeView,
  onViewChange,
  audioEnabled,
  onToggleAudio,
}) => {
  const { user, signInWithGoogle, signOut } = useAuth();

  const getStatusBadge = () => {
    switch (agentStatus) {
      case 'planning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            SYNTHESIZING
          </span>
        );
      case 'executing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            EVALUATING VM
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            PROOF VERIFIED
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            INVARIANT FAULT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            DUAL-SYSTEM ACTIVE
          </span>
        );
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-base sm:text-lg text-white font-mono">
                EVE_PRIME
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                v3.0 // NEUROSYMBOLIC
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Neurosymbolic Architecture & Self-Modifying Algorithms
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
          <button
            onClick={() => onViewChange('hypercube')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'hypercube'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>HYPERCUBE 4D</span>
          </button>

          <button
            onClick={() => onViewChange('neurosymbolic')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'neurosymbolic'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dna className="w-3.5 h-3.5 text-cyan-400" />
            <span>NEUROSYMBOLIC CORE</span>
          </button>

          <button
            onClick={() => onViewChange('missions')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'missions'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>MISSION ORCHESTRATION</span>
          </button>

          <button
            onClick={() => onViewChange('workspace')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'workspace'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>WORKSPACE</span>
          </button>

          <button
            onClick={() => onViewChange('metacognition')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'metacognition'
                ? 'bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>META COGNITION</span>
          </button>
        </nav>

        {/* Live System Specs & User Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{systemStatus?.activeModel || 'gemini-3.8-flash'}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{systemStatus?.hasApiKey ? 'KEY VERIFIED' : 'LOCAL ENGINE'}</span>
            </div>
          </div>

          {getStatusBadge()}

          {/* User Auth Profile / Sign In */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono">
              <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-300 text-[10px]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-full h-full rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-3 h-3" />
                )}
              </div>
              <span className="text-slate-300 hidden sm:inline max-w-[100px] truncate">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                onClick={signOut}
                title="Sign Out"
                className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-700 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Sign In with Google"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">SIGN IN</span>
            </button>
          )}

          {/* Audio Synthesizer toggle */}
          <button
            onClick={onToggleAudio}
            title={audioEnabled ? 'Voice Synthesis Active' : 'Voice Synthesis Muted'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition-colors cursor-pointer"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
