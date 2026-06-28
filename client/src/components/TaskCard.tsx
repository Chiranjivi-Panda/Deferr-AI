/**
 * TaskCard — Displays a single prioritized task as a glassmorphism card.
 *
 * Shows: rank badge, title, category pill, deadline countdown,
 * effort estimate, AI reasoning quote, and priority score.
 *
 * Color coding:
 *   • Red = overdue
 *   • Amber = due within 6 hours (urgent)
 *   • Default = more time remaining
 *   • Score ≥70 = amber (hot), ≥40 = indigo, <40 = slate
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';
import type { Task, Proposal } from '../types';
import { useCalendar } from '../hooks/useCalendar';
import { ProposalCard } from './ProposalCard';
import { DeepWorkOverlay } from './DeepWorkOverlay';

interface TaskCardProps {
  task: Task;
  rank: number;
  /** Animation delay for staggered entrance (seconds) */
  delay?: number;
  onRefresh?: () => void;
  isMostUrgent?: boolean;
}

export function TaskCard({ task, rank, delay = 0, onRefresh, isMostUrgent = false }: TaskCardProps) {
  const colors = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.other;
  const categoryLabel = CATEGORY_LABELS[task.category] || task.category;
  const timeLeft = getTimeLeft(task.deadline);
  const isUrgent = timeLeft.hours < 6 && timeLeft.hours >= 0;
  const isOverdue = timeLeft.hours < 0;

  const { proposeReschedule } = useCalendar();
  const [findingTime, setFindingTime] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isDeconstructing, setIsDeconstructing] = useState(false);
  
  const [showDeepWork, setShowDeepWork] = useState(false);
  const [isCheckingOff, setIsCheckingOff] = useState(false);

  const handleFindTime = async () => {
    setFindingTime(true);
    try {
      const res = await proposeReschedule(task.id);
      if (res.atRisk && res.proposal) {
        setProposal(res.proposal);
      } else {
        alert("No conflict detected, or no movable events found.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to find time.");
    } finally {
      setFindingTime(false);
    }
  };

  const handleDeconstruct = async () => {
    setIsDeconstructing(true);
    try {
      const { apiPost } = await import('../lib/api');
      await apiPost(`/tasks/${task.id}/deconstruct`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to deconstruct task:', err);
      setIsDeconstructing(false);
    }
  };

  const handleComplete = async () => {
    setIsCheckingOff(true);
    setTimeout(async () => {
      try {
        const { apiPatch } = await import('../lib/api');
        await apiPatch(`/tasks/${task.id}`, { status: 'completed' });
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error('Failed to complete task:', err);
        setIsCheckingOff(false);
      }
    }, 500);
  };

  return (
    <>
      <motion.div
        layout="position"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: isCheckingOff ? 0 : 1, y: 0, scale: isCheckingOff ? 0.95 : 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, delay: isCheckingOff ? 0 : delay, type: 'spring', bounce: 0.2 }}
        className="w-full"
      >
        <GlassCard 
          hoverable 
          data-is-critical={task.priority_score >= 70 || timeLeft.hours < 1}
          data-is-most-urgent={isMostUrgent}
          className={`w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 p-3 sm:p-4 ${
            timeLeft.hours < 2 ? 'pulse-red' : timeLeft.hours < 24 ? 'pulse-amber' : ''
          } ${isCheckingOff ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] pointer-events-none' : ''}`}
        >
          
          {/* Checkbox */}
          <div className="flex-shrink-0 flex items-start pt-1.5 pr-2">
            <button 
              onClick={handleComplete}
              disabled={isCheckingOff}
              className="w-6 h-6 rounded-md border-2 border-slate-600 hover:border-indigo-400 hover:bg-indigo-500/10 flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Complete task"
            >
              <motion.div whileTap={{ scale: 0.8 }} className="w-full h-full rounded flex items-center justify-center">
                {/* SVG for checkmark could go here if checked, but on checked it immediately hides */}
              </motion.div>
            </button>
          </div>

          {/* ── Rank badge ────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex items-start pt-0.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                rank === 1
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/30'
                  : rank <= 3
                  ? 'bg-white/8 text-white border border-white/10'
                  : 'bg-white/4 text-slate-400 border border-white/5'
              }`}
            >
              #{rank}
            </div>
          </div>

          {/* ── Main content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0 w-full pr-0 sm:pr-4 break-words">
            {/* Title + category pill */}
            <div className="flex items-start gap-2 mb-2">
              <h3 className={`text-base font-semibold text-white truncate flex-1 transition-all duration-300 ${isCheckingOff ? 'line-through opacity-50' : ''}`}>
                {task.title}
              </h3>
              <span
                className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
              >
                {categoryLabel}
              </span>
            </div>

            {/* Deadline + effort row */}
            <div className="flex items-center gap-3 mb-3 text-sm">
              <span
                className={`flex items-center gap-1.5 ${
                  isOverdue
                    ? 'text-red-400'
                    : isUrgent
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                <span>{isOverdue ? '🔴' : isUrgent ? '🟠' : '⏰'}</span>
                {timeLeft.label}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                ~{task.estimated_effort_minutes}min effort
              </span>
            </div>

            {/* AI reasoning quote */}
            {task.priority_reasoning && (
              <p className="text-sm text-slate-400/90 leading-relaxed italic mb-3">
                &quot;{task.priority_reasoning}&quot;
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-2">
              {task.status !== 'action_taken' && !proposal && (
                <button
                  onClick={handleFindTime}
                  disabled={findingTime}
                  className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium hover:bg-indigo-500/30 transition-colors"
                >
                  {findingTime ? 'Analyzing Calendar...' : '✨ Find Time'}
                </button>
              )}
              
              {!proposal && (
                <button
                  onClick={handleDeconstruct}
                  disabled={isDeconstructing}
                  className="px-3 py-1.5 text-slate-400 border border-slate-700/50 hover:bg-slate-800/50 rounded-lg text-xs font-medium transition-colors"
                >
                  {isDeconstructing ? 'Deconstructing...' : '✨ Deconstruct'}
                </button>
              )}
              
              {!proposal && (
                <button
                  onClick={() => setShowDeepWork(true)}
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors"
                >
                  🎯 Commence
                </button>
              )}
            </div>

            {/* Proposal Card (if generated) */}
            {proposal && task.status !== 'action_taken' && (
              <div className="mt-3">
                <ProposalCard
                  taskId={task.id}
                  proposal={proposal}
                  onApplied={() => setProposal(null)}
                  onDismissed={() => setProposal(null)}
                />
              </div>
            )}
            
            {task.status === 'action_taken' && (
               <div className="mt-3 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg">
                  ✅ Calendar event moved to accommodate this task.
               </div>
            )}
          </div>

          {/* ── Score indicator ───────────────────────────────────── */}
          <div className="self-end sm:self-auto w-auto sm:w-16 flex-shrink-0 flex flex-col items-center justify-center gap-1">
            <div
              className={`text-xl font-bold ${
                task.priority_score >= 70
                  ? 'text-amber-400'
                  : task.priority_score >= 40
                  ? 'text-indigo-300'
                  : 'text-slate-400'
              }`}
            >
              {Math.round(task.priority_score)}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              score
            </div>
          </div>
        </GlassCard>
      </motion.div>
      
      {showDeepWork && <DeepWorkOverlay task={task} onClose={() => setShowDeepWork(false)} onComplete={handleComplete} />}
    </>
  );
}

// ── Helper: compute human-readable time remaining ────────────────────────────

function getTimeLeft(deadlineISO: string): { hours: number; label: string } {
  const now = Date.now();
  const deadline = new Date(deadlineISO).getTime();
  const diffMs = deadline - now;
  const hours = diffMs / (1000 * 60 * 60);

  if (hours < -24) {
    const days = Math.abs(Math.round(hours / 24));
    return { hours, label: `${days}d overdue` };
  }
  if (hours < 0) {
    const hrs = Math.abs(Math.round(hours));
    return { hours, label: `${hrs}h overdue` };
  }
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return { hours, label: `${mins}m left` };
  }
  if (hours < 24) {
    const hrs = Math.round(hours * 10) / 10;
    return { hours, label: `${hrs}h left` };
  }
  const days = Math.round((hours / 24) * 10) / 10;
  return { hours, label: `${days}d left` };
}
