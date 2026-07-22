import { ReactNode } from 'react';
import {
  Zap, Search, LayoutGrid, BarChart2,
  Settings, LogOut, Clock
} from 'lucide-react';
import { cn } from '../utils';

interface SidebarProps {
  activeTab: 'dashboard' | 'analytics' | 'settings';
  onTabChange: (tab: 'dashboard' | 'analytics' | 'settings') => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-[#33333C] bg-[#121212] h-full flex flex-col p-4 flex-shrink-0 hidden md:flex">
      <div className="flex items-center gap-2 px-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF5522] to-[#FF3300] flex items-center justify-center shadow-lg shadow-[#FF5522]/20">
          <Zap className="w-5 h-5 text-white fill-current" />
        </div>
        <span className="text-xl font-bold tracking-tight">Fintrixity</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar pb-4">
        <div>
          <div className="space-y-1">
            <NavItem 
              icon={<LayoutGrid />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => onTabChange('dashboard')} 
            />
            <NavItem 
              icon={<BarChart2 />} 
              label="Analytics" 
              active={activeTab === 'analytics'} 
              onClick={() => onTabChange('analytics')} 
            />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1 mb-6">
        <NavItem 
          icon={<Settings />} 
          label="Settings" 
          active={activeTab === 'settings'} 
          onClick={() => onTabChange('settings')} 
        />
        <NavItem icon={<LogOut />} label="Log out" className="text-[#8E8E93] hover:text-white" />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, badge, className, onClick }: { icon: ReactNode, label: string, active?: boolean, badge?: string, className?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group",
      active ? "bg-[#1E1E22] text-white shadow-sm shadow-black/20" : "text-[#8E8E93] hover:bg-[#1E1E22]/50 hover:text-white",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-5 h-5 flex items-center justify-center transition-colors",
          active ? "text-white" : "text-[#8E8E93] group-hover:text-white"
        )}>
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </button>
  );
}
