import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import type { Proposal } from '../types';
import { useCalendar } from '../hooks/useCalendar';

interface ProposalCardProps {
  taskId: string;
  proposal: Proposal;
  onApplied: () => void;
  onDismissed: () => void;
}

export function ProposalCard({ taskId, proposal, onApplied, onDismissed }: ProposalCardProps) {
  const { applyProposal } = useCalendar();
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyProposal(taskId, proposal);
      onApplied();
    } catch (err) {
      console.error(err);
      setApplying(false);
    }
  };

  const formatTime = (isoString: string) => { return new Date(isoString).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
      className="mt-6 mb-2 magic-glow rounded-[20px]"
    >
      <GlassCard className="p-6 border-indigo-500/30 bg-indigo-900/20 shadow-2xl overflow-hidden relative">
        {/* Subtle background gradient radial */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
              <span className="text-lg">✨</span>
            </div>
            <h4 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-amber-200 to-indigo-300 animate-pulse">
              AI Scheduling Proposal
            </h4>
          </div>
          
          {/* Visually stunning reasoning trail blockquote */}
          <div className="relative pl-6 py-2 mb-6">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-amber-400 to-indigo-500" />
            <p className="text-base text-slate-100 font-medium leading-relaxed italic tracking-wide">
              &quot;{proposal.justification}&quot;
            </p>
          </div>
          
          {/* Time shift visualization */}
          <div className="flex items-center justify-between gap-4 bg-black/30 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/5 shadow-inner">
            <div className="flex-1 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">Original</span>
              <div className="line-through text-slate-400 text-sm font-medium decoration-red-500/50">
                <div className="whitespace-nowrap">{formatTime(proposal.original_start)}</div>
                <div className="text-slate-500 text-xs">to</div>
                <div className="whitespace-nowrap">{formatTime(proposal.original_end)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0">
              <span className="text-indigo-400 text-sm">➔</span>
            </div>
            
            <div className="flex-1 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase tracking-wider text-amber-500/80 mb-1 font-bold">Proposed</span>
              <div className="text-amber-300 text-sm font-bold shadow-amber-500/20 drop-shadow-md">
                <div className="whitespace-nowrap">{formatTime(proposal.new_start)}</div>
                <div className="text-amber-500/70 text-xs">to</div>
                <div className="whitespace-nowrap">{formatTime(proposal.new_end)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onDismissed}
              disabled={applying}
              className="px-5 py-2.5 bg-white/5 text-slate-300 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Dismiss
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/50 rounded-xl text-sm font-bold hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-transform transition-colors transition-opacity transform-gpu will-change-transform disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {applying ? 'Applying...' : 'Apply Reschedule'}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
