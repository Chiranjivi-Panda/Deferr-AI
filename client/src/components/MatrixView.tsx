import type { Task } from '../types';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';

interface MatrixViewProps {
  tasks: Task[];
}

export function MatrixView({ tasks }: MatrixViewProps) {
  const now = Date.now();
  
  // High urgency = due within 24 hours (or overdue)
  const isHighUrgency = (deadline: string) => {
    const d = new Date(deadline).getTime();
    return (d - now) < (24 * 60 * 60 * 1000);
  };
  
  const q1 = tasks.filter(t => isHighUrgency(t.deadline) && t.priority_score > 60);
  const q2 = tasks.filter(t => !isHighUrgency(t.deadline) && t.priority_score > 60);
  const q3 = tasks.filter(t => isHighUrgency(t.deadline) && t.priority_score <= 60);
  const q4 = tasks.filter(t => !isHighUrgency(t.deadline) && t.priority_score <= 60);

  const Quadrant = ({ title, tasks, bgClass, description }: { title: string, tasks: Task[], bgClass: string, description: string }) => (
    <div className={`p-4 rounded-xl border border-white/5 flex flex-col h-full ${bgClass}`}>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-white tracking-widest">{title}</h3>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{description}</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {tasks.map(t => (
          <GlassCard key={t.id} hoverable className="p-3">
            <div className="text-sm font-semibold text-slate-200 truncate">{t.title}</div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[11px] font-medium text-slate-400">Score: {Math.round(t.priority_score)}</span>
              <span className="text-[11px] font-medium text-slate-500">{t.estimated_effort_minutes}m</span>
            </div>
          </GlassCard>
        ))}
        {tasks.length === 0 && <div className="text-xs text-slate-500 italic text-center py-4">No tasks in this quadrant</div>}
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[650px] w-full"
    >
      <Quadrant title="Q1: DO FIRST" description="High Urgency, High Priority" tasks={q1} bgClass="bg-red-950/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] border-red-500/10" />
      <Quadrant title="Q2: SCHEDULE" description="Low Urgency, High Priority" tasks={q2} bgClass="bg-blue-950/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)] border-blue-500/10" />
      <Quadrant title="Q3: DELEGATE" description="High Urgency, Low Priority" tasks={q3} bgClass="bg-amber-950/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)] border-amber-500/10" />
      <Quadrant title="Q4: ELIMINATE" description="Low Urgency, Low Priority" tasks={q4} bgClass="bg-slate-900/40 shadow-[inset_0_0_20px_rgba(148,163,184,0.05)] border-slate-500/10" />
    </motion.div>
  );
}
