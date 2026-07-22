import React, { useState, FormEvent } from 'react';
import { Plus, MoreVertical, Play, Clock, Euro, ArrowUpRight, ArrowDownRight, Archive } from 'lucide-react';
import { useAppStore, Project } from '../store';
import { cn } from '../utils';

export function ProjectsGrid() {
  const { projects, sessions, startSession, deleteProject, addProject } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    category: '',
    fixedPrice: 0,
    externalCosts: 0,
    status: 'Active' as const,
    estimatedHours: 0,
    painFactor: 3
  });

  const activeProjects = projects.filter(p => p.status === 'Active');
  
  const handleAddProject = (e: FormEvent) => {
    e.preventDefault();
    if (newProject.name && newProject.client) {
      addProject(newProject);
      setIsAdding(false);
      setNewProject({
        name: '',
        client: '',
        category: '',
        fixedPrice: 0,
        externalCosts: 0,
        status: 'Active',
        estimatedHours: 0,
        painFactor: 3
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Active Projects</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-white/10"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddProject} className="bg-[#1E1E22] border border-[#FF5522]/30 rounded-2xl p-5 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" placeholder="Project Name" required
            value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})}
            className="bg-[#121212] border border-[#33333C] rounded-lg px-3 py-2 focus:border-[#FF5522] outline-none text-white text-sm"
          />
          <input 
            type="text" placeholder="Client Name" required
            value={newProject.client} onChange={e => setNewProject({...newProject, client: e.target.value})}
            className="bg-[#121212] border border-[#33333C] rounded-lg px-3 py-2 focus:border-[#FF5522] outline-none text-white text-sm"
          />
          <div className="flex gap-2">
            <input 
              type="number" placeholder="Fixed Price (€)" required
              value={newProject.fixedPrice || ''} onChange={e => setNewProject({...newProject, fixedPrice: Number(e.target.value)})}
              className="bg-[#121212] border border-[#33333C] rounded-lg px-3 py-2 focus:border-[#FF5522] outline-none text-white text-sm w-1/2"
            />
            <input 
              type="number" placeholder="Estimated Hrs" required
              value={newProject.estimatedHours || ''} onChange={e => setNewProject({...newProject, estimatedHours: Number(e.target.value)})}
              className="bg-[#121212] border border-[#33333C] rounded-lg px-3 py-2 focus:border-[#FF5522] outline-none text-white text-sm w-1/2"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-[#8E8E93] hover:text-white">Cancel</button>
            <button type="submit" className="bg-[#FF5522] hover:bg-[#FF3300] text-white px-4 py-2 rounded-lg text-sm font-medium">Save Project</button>
          </div>
        </form>
      )}

      {activeProjects.length === 0 && !isAdding ? (
        <div className="text-center py-12 bg-[#1E1E22] rounded-2xl border border-[#33333C] border-dashed">
          <p className="text-[#8E8E93]">No active projects. Add one to start tracking!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activeProjects.map(project => {
            return (
              <ProjectCardContainer key={project.id} project={project} />
            )
          })}
        </div>
      )}
    </div>
  );
}

const ProjectCardContainer: React.FC<{ project: Project }> = ({ project }) => {
  const { sessions, startSession, settings } = useAppStore();
  
  const projectSessions = sessions.filter(s => s.projectId === project.id);
  const totalMs = projectSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalHours = totalMs / (1000 * 60 * 60);
  const netIncome = project.fixedPrice - project.externalCosts;
  const effectiveHourly = totalHours > 0 ? netIncome / totalHours : 0;
  
  // If no estimated hours are provided, we estimate based on their target hourly rate!
  const targetDerivedHours = settings.targetHourlyRate > 0 ? netIncome / settings.targetHourlyRate : 0;
  const expectedHours = project.estimatedHours > 0 ? project.estimatedHours : targetDerivedHours;
  
  const progress = expectedHours > 0 ? Math.min((totalHours / expectedHours) * 100, 100) : 0;

  return (
    <ProjectCard 
      project={project}
      totalHours={totalHours}
      effectiveHourly={effectiveHourly}
      progress={progress}
      expectedHours={expectedHours}
      onStart={() => startSession(project.id)}
    />
  );
}

const ProjectCard: React.FC<{ project: Project, totalHours: number, effectiveHourly: number, progress: number, expectedHours: number, onStart: () => void }> = ({ project, totalHours, effectiveHourly, progress, expectedHours, onStart }) => {
  const { updateProject, settings } = useAppStore();
  const isGoodHourly = effectiveHourly >= settings.targetHourlyRate; 
  
  return (
    <div className="bg-[#1E1E22] border border-[#33333C] rounded-2xl p-5 hover:border-[#4a4a55] transition-all group flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-white group-hover:text-[#FF5522] transition-colors">{project.name}</h3>
          <p className="text-xs text-[#8E8E93]">{project.client}</p>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => updateProject(project.id, { status: 'Archived' })}
            title="Archive Project"
            className="text-[#8E8E93] hover:text-[#FF5522] p-1 rounded hover:bg-[#25252B] transition-colors"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button className="text-[#8E8E93] hover:text-white p-1 rounded hover:bg-[#25252B]">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 flex-1">
        <div>
          <div className="text-[#8E8E93] text-xs font-medium flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3" /> Time Logged
          </div>
          <div className="font-semibold text-white">
            {totalHours.toFixed(1)} <span className="text-xs text-[#8E8E93] font-normal">/ {project.estimatedHours > 0 ? project.estimatedHours : `~${expectedHours.toFixed(0)}`}h</span>
          </div>
        </div>
        <div>
          <div className="text-[#8E8E93] text-xs font-medium flex items-center gap-1 mb-1">
            <Euro className="w-3 h-3" /> Eff. Rate
          </div>
          <div className={cn(
            "font-semibold flex items-center gap-1",
            effectiveHourly > 0 ? (isGoodHourly ? "text-[#4ADE80]" : "text-[#FF5522]") : "text-white"
          )}>
            €{effectiveHourly.toFixed(0)}
            {effectiveHourly > 0 && (
              isGoodHourly ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-auto">
        <div className="flex items-center justify-between text-xs text-[#8E8E93]">
          <span>Pain Factor</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className={star <= project.painFactor ? 'text-yellow-500' : 'text-[#33333C]'}>★</span>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] font-medium text-[#8E8E93] mb-1.5">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#121212] rounded-full h-1.5 border border-[#33333C]">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress > 100 ? "bg-red-500" : "bg-[#FF5522]"
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <button 
          onClick={onStart}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#FF5522] border border-white/10 hover:border-[#FF5522] text-white text-sm font-medium flex items-center justify-center gap-2 transition-all group-hover:shadow-[0_0_20px_rgba(255,85,34,0.2)]"
        >
          <Play className="w-4 h-4 fill-current opacity-70 group-hover:opacity-100" />
          Start Timer
        </button>
      </div>
    </div>
  );
}
