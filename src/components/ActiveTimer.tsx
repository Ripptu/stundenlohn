import { useEffect, useState } from 'react';
import { Play, Square, Pause, Hash, TrendingDown, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../utils';

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function ActiveTimer() {
  const { activeSessionId, sessions, projects, settings, stopSession, startSession } = useAppStore();
  const [elapsed, setElapsed] = useState(0);
  
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeProject = activeSession ? projects.find(p => p.id === activeSession.projectId) : undefined;
  
  const recentProject = projects.length > 0 ? projects[projects.length - 1] : null;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession) {
      interval = setInterval(() => {
        setElapsed(Date.now() - activeSession.startTime);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) {
    if (projects.length === 0) return null;
    
    return (
      <div className="bg-[#1E1E22] border border-[#33333C] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold mb-1">Ready to work?</h2>
          <p className="text-sm text-[#8E8E93]">Continue working on your recent projects.</p>
        </div>
        
        {recentProject && (
          <button 
            onClick={() => startSession(recentProject.id)}
            className="bg-gradient-to-r from-[#FF5522] to-[#FF3300] hover:opacity-90 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-3 transition-all shadow-lg shadow-[#FF5522]/20"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Continue <strong>{recentProject.name}</strong></span>
          </button>
        )}
      </div>
    );
  }

  // Calculate stats for the active session
  const prevSessions = sessions.filter(s => s.projectId === activeProject?.id && s.id !== activeSessionId);
  const prevTotalMs = prevSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalMs = prevTotalMs + elapsed;
  const totalHours = totalMs / (1000 * 60 * 60);

  const netIncome = activeProject ? (activeProject.fixedPrice - activeProject.externalCosts) : 0;
  
  // Current effective hourly wage based on total time spent so far
  const currentHourlyWage = totalHours > 0 ? netIncome / totalHours : 0;
  const isGoodHourly = currentHourlyWage >= settings.targetHourlyRate;

  // Live Earnings ticker (based on target hourly rate as a psychological motivator)
  const sessionEarned = (elapsed / (1000 * 60 * 60)) * settings.targetHourlyRate;

  return (
    <div className="bg-[#1E1E22] border border-[#FF5522]/50 shadow-[0_0_30px_rgba(255,85,34,0.1)] rounded-2xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5522] opacity-10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left side: Info */}
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5522] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5522]">Active Session</span>
          </div>
          <h2 className="text-2xl font-bold truncate max-w-full">{activeProject?.name}</h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-[#8E8E93]">
            <span className="flex items-center gap-1.5"><Hash className="w-4 h-4" /> {activeSession.category}</span>
            <span className="w-1 h-1 rounded-full bg-[#33333C]" />
            <span>{activeProject?.client}</span>
          </div>
        </div>

        {/* Center: Timer & Earnings */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-5xl md:text-6xl font-black tracking-tighter text-white tabular-nums drop-shadow-md">
            {formatTime(elapsed)}
          </div>
          
          <div className="flex items-center gap-6 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider mb-1">Live Earnings</span>
              <span className="text-lg font-bold text-[#4ADE80] tabular-nums tracking-tight">€{sessionEarned.toFixed(2)}</span>
            </div>
            <div className="w-px h-8 bg-[#33333C]" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider mb-1">Current Hourly</span>
              <span className={cn(
                "text-lg font-bold tabular-nums tracking-tight flex items-center gap-1",
                isGoodHourly ? "text-[#4ADE80]" : "text-[#FF5522]"
              )}>
                €{currentHourlyWage.toFixed(2)}
                {isGoodHourly ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Controls */}
        <div className="flex items-center justify-end gap-3 flex-1">
          <button className="w-12 h-12 rounded-xl bg-[#25252B] border border-[#33333C] hover:border-[#8E8E93] hover:text-white text-[#8E8E93] flex items-center justify-center transition-all">
            <Pause className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={() => stopSession()}
            className="h-12 px-6 rounded-xl bg-white text-black font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop & Save
          </button>
        </div>
      </div>
    </div>
  );
}
