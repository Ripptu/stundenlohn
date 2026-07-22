import { useAppStore } from '../store';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';
import { cn } from '../utils';

export function AnalyticsTab() {
  const { projects, sessions, settings } = useAppStore();
  
  // Calculate metrics
  const completedProjects = projects.filter(p => p.status === 'Completed' || p.status === 'Archived');
  
  // Best hourly rate
  let bestHourlyRate = 0;
  let bestProjectName = '-';
  
  // Client LTV
  const clientLTV: Record<string, { totalEarned: number, totalHours: number }> = {};
  
  projects.forEach(p => {
    const pSessions = sessions.filter(s => s.projectId === p.id);
    const totalMs = pSessions.reduce((acc, s) => acc + s.duration, 0);
    const totalHours = totalMs / (1000 * 60 * 60);
    
    if (totalHours > 0) {
      const netIncome = p.fixedPrice - p.externalCosts;
      const hourly = netIncome / totalHours;
      
      if (hourly > bestHourlyRate) {
        bestHourlyRate = hourly;
        bestProjectName = p.name;
      }
      
      if (!clientLTV[p.client]) {
        clientLTV[p.client] = { totalEarned: 0, totalHours: 0 };
      }
      clientLTV[p.client].totalEarned += netIncome;
      clientLTV[p.client].totalHours += totalHours;
    }
  });

  const sortedClients = Object.entries(clientLTV)
    .sort((a, b) => b[1].totalEarned - a[1].totalEarned)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 text-white">Analytics & Metrics</h1>
          <p className="text-sm text-[#8E8E93]">Deep dive into your freelance performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E1E22] border border-[#33333C] rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-[#FF5522]/20 flex items-center justify-center mb-4 text-[#FF5522]">
            <Trophy className="w-5 h-5" />
          </div>
          <p className="text-sm text-[#8E8E93] mb-1">Highscore Hourly Rate</p>
          <div className="text-3xl font-bold text-white mb-1">€{bestHourlyRate.toFixed(0)}</div>
          <p className="text-xs text-[#4ADE80]">{bestProjectName}</p>
        </div>

        <div className="bg-[#1E1E22] border border-[#33333C] rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-500">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-sm text-[#8E8E93] mb-1">Net Payout Factor</p>
          <div className="text-3xl font-bold text-white mb-1">{100 - settings.taxDeduction}%</div>
          <p className="text-xs text-[#8E8E93]">After {settings.taxDeduction}% taxes/deductions</p>
        </div>
      </div>

      <div className="bg-[#1E1E22] border border-[#33333C] rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#8E8E93]" />
          Top Clients (Lifetime Value)
        </h2>
        
        {sortedClients.length === 0 ? (
          <p className="text-[#8E8E93] text-sm">No client data available yet.</p>
        ) : (
          <div className="space-y-4">
            {sortedClients.map(([clientName, data], index) => {
              const clientHourly = data.totalEarned / data.totalHours;
              return (
                <div key={clientName} className="flex items-center justify-between p-4 rounded-xl border border-[#33333C] bg-[#121212]">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#25252B] flex items-center justify-center text-xs font-bold text-[#8E8E93]">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{clientName}</h4>
                      <p className="text-xs text-[#8E8E93]">{data.totalHours.toFixed(1)} hours logged</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white tracking-wide">€{data.totalEarned.toFixed(0)}</div>
                    <div className={cn(
                      "text-xs font-medium",
                      clientHourly >= settings.targetHourlyRate ? "text-[#4ADE80]" : "text-[#FF5522]"
                    )}>
                      Avg: €{clientHourly.toFixed(0)}/h
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
