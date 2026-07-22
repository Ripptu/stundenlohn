import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Session {
  id: string;
  projectId: string;
  startTime: number;
  endTime?: number;
  duration: number; // in milliseconds
  category: string;
  focusScore: number;
  caffeine: boolean;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  category: string;
  fixedPrice: number;
  externalCosts: number;
  status: 'Active' | 'Completed' | 'Archived';
  estimatedHours: number;
  painFactor: number;
}

export interface Settings {
  targetHourlyRate: number;
  taxDeduction: number; // percentage (0-100)
}

export interface AppState {
  projects: Project[];
  sessions: Session[];
  settings: Settings;
  activeSessionId: string | null;
}

const defaultState: AppState = {
  projects: [],
  sessions: [],
  settings: {
    targetHourlyRate: 85,
    taxDeduction: 40,
  },
  activeSessionId: null,
};

interface AppContextType extends AppState {
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  startSession: (projectId: string, category?: string) => void;
  stopSession: (focusScore?: number, caffeine?: boolean) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  playSound: (type: 'start' | 'stop' | 'milestone') => void;
  getActiveSession: () => Session | undefined;
  getActiveProject: () => Project | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fintrixity_freelance');
    return saved ? JSON.parse(saved) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem('fintrixity_freelance', JSON.stringify(state));
  }, [state]);

  const playSound = (type: 'start' | 'stop' | 'milestone') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'stop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else {
        // Milestone sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.log('Audio disabled or not supported');
    }
  };

  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = { ...projectData, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProject = (id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      sessions: prev.sessions.filter(s => s.projectId !== id)
    }));
  };

  const startSession = (projectId: string, category: string = '#code') => {
    if (state.activeSessionId) stopSession();
    
    const newSession: Session = {
      id: crypto.randomUUID(),
      projectId,
      startTime: Date.now(),
      duration: 0,
      category,
      focusScore: 3,
      caffeine: false
    };

    playSound('start');
    setState(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
      activeSessionId: newSession.id
    }));
  };

  const stopSession = (focusScore: number = 3, caffeine: boolean = false) => {
    playSound('stop');
    setState(prev => {
      const sessionIndex = prev.sessions.findIndex(s => s.id === prev.activeSessionId);
      if (sessionIndex === -1) return prev;

      const session = prev.sessions[sessionIndex];
      const endTime = Date.now();
      const updatedSession = {
        ...session,
        endTime,
        duration: endTime - session.startTime,
        focusScore,
        caffeine
      };

      const newSessions = [...prev.sessions];
      newSessions[sessionIndex] = updatedSession;

      return {
        ...prev,
        sessions: newSessions,
        activeSessionId: null
      };
    });
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  };

  const getActiveSession = () => state.sessions.find(s => s.id === state.activeSessionId);
  const getActiveProject = () => {
    const session = getActiveSession();
    return session ? state.projects.find(p => p.id === session.projectId) : undefined;
  };

  return (
    <AppContext.Provider value={{
      ...state,
      addProject,
      updateProject,
      deleteProject,
      startSession,
      stopSession,
      updateSettings,
      playSound,
      getActiveSession,
      getActiveProject
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
