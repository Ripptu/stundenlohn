import { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Settings, Bell, Menu, Play, Euro } from 'lucide-react';
import { useAppStore } from '../store';

export function TopBar() {
  const { projects, sessions, startSession } = useAppStore();

  // Quick Start logic: last worked on project
  const recentProject = projects.length > 0 ? projects[projects.length - 1] : null;

  // Calculate this month's earnings
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthEarnings = 0;
  projects.forEach(p => {
    const pSessions = sessions.filter(s => {
      if (s.projectId !== p.id) return false;
      const sDate = new Date(s.startTime);
      return sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear;
    });

    const totalMs = pSessions.reduce((acc, s) => acc + s.duration, 0);
    const totalHours = totalMs / (1000 * 60 * 60);
    if (totalHours > 0) {
      const netIncome = p.fixedPrice - p.externalCosts;
      const hourly = p.estimatedHours > 0 ? netIncome / p.estimatedHours : 0;
      monthEarnings += totalHours * hourly; // Apportioned earnings based on time worked
    }
  });

  return (
    <header className="h-16 border-b border-[#33333C] bg-[#121212]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-md text-[#8E8E93] hover:bg-[#1E1E22] hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-1">
          <button className="p-1.5 rounded-md hover:bg-[#1E1E22] text-[#8E8E93] transition-colors bg-[#1E1E22]/50">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-[#1E1E22] text-[#8E8E93] transition-colors bg-[#1E1E22]/50">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {recentProject && (
          <button 
            onClick={() => startSession(recentProject.id)}
            className="hidden sm:flex bg-[#1E1E22] border border-[#FF5522]/30 hover:border-[#FF5522] text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-all items-center gap-2 group"
          >
            <Play className="w-3.5 h-3.5 text-[#FF5522] fill-current group-hover:scale-110 transition-transform" />
            <span className="text-[#8E8E93]">Continue:</span> {recentProject.name}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-3 mr-2 bg-[#1E1E22] border border-[#33333C] rounded-lg px-3 py-1.5">
          <Euro className="w-4 h-4 text-[#8E8E93]" />
          <div className="flex flex-col">
            <span className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-wider leading-none">This Month</span>
            <span className="text-sm font-bold text-white leading-tight">€{monthEarnings.toFixed(0)}</span>
          </div>
        </div>

        <IconButton icon={<Bell className="w-4 h-4" />} />
        
        <div className="h-8 w-px bg-[#33333C] mx-1 hidden sm:block" />
        
        <button className="w-8 h-8 rounded-full bg-[#1E1E22] overflow-hidden border border-[#33333C] relative cursor-pointer hover:border-[#8E8E93] transition-colors shrink-0">
          <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#1E1E22]" />
        </button>
      </div>
    </header>
  );
}

function IconButton({ icon, badge }: { icon: ReactNode, badge?: boolean }) {
  return (
    <button className="p-2 rounded-full border border-[#33333C] bg-[#1E1E22] text-[#8E8E93] hover:text-white hover:border-[#8E8E93] transition-all relative">
      {icon}
      {badge && (
        <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF5522] rounded-full border-2 border-[#1E1E22]" />
      )}
    </button>
  );
}
