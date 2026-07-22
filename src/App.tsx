/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ActiveTimer } from './components/ActiveTimer';
import { ProjectsGrid } from './components/ProjectsGrid';
import { AnalyticsTab } from './components/AnalyticsTab';
import { AppProvider, useAppStore } from './store';

function SettingsTab() {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1 text-white">Settings</h1>
        <p className="text-sm text-[#8E8E93]">Configure your goals and calculations.</p>
      </div>

      <div className="bg-[#1E1E22] border border-[#33333C] rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Target Hourly Rate (€)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="20" max="250" step="5"
              value={settings.targetHourlyRate} 
              onChange={e => updateSettings({ targetHourlyRate: Number(e.target.value) })}
              className="w-full accent-[#FF5522]"
            />
            <span className="font-bold text-xl min-w-[3ch]">€{settings.targetHourlyRate}</span>
          </div>
          <p className="text-xs text-[#8E8E93] mt-2">Used for coloring and benchmarks.</p>
        </div>

        <div className="border-t border-[#33333C] pt-6">
          <label className="block text-sm font-medium text-white mb-2">Net Payout Factor / Taxes (%)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" max="70" step="1"
              value={settings.taxDeduction} 
              onChange={e => updateSettings({ taxDeduction: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <span className="font-bold text-xl min-w-[3ch]">{settings.taxDeduction}%</span>
          </div>
          <p className="text-xs text-[#8E8E93] mt-2">Deducted from your gross hourly rate for net calculations.</p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');

  return (
    <div className="flex h-screen bg-[#121212] text-white font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 no-scrollbar">
          {activeTab === 'dashboard' && (
            <>
              <ActiveTimer />
              <ProjectsGrid />
            </>
          )}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

