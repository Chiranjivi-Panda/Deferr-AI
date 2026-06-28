import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { apiPost } from '../lib/api';

interface DeepWorkOverlayProps {
  task: Task;
  onClose: () => void;
  onComplete: () => Promise<void>;
}

export function DeepWorkOverlay({ task, onClose, onComplete }: DeepWorkOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(task.estimated_effort_minutes * 60);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [guiltTrip, setGuiltTrip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0 || isNegotiating) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isNegotiating]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const handleExitClick = async () => {
    setIsNegotiating(true);
    setIsLoading(true);
    try {
      const res = await apiPost<{ message: string }>('/tasks/negotiate/exit', { title: task.title });
      setGuiltTrip(res.message);
    } catch (err) {
      console.error(err);
      setGuiltTrip("Quitting now means you'll have to face the music later. Are you sure you want to abandon this?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteClick = async () => {
    setIsCompleting(true);
    await onComplete();
    setIsCompleting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-white"
      >
        {!isNegotiating && (
          <button
            onClick={handleExitClick}
            className="absolute top-6 right-8 text-slate-500 hover:text-white text-sm tracking-widest uppercase transition-colors"
          >
            Exit Deep Work
          </button>
        )}
        
        <div className="max-w-3xl w-full text-center space-y-8 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30 uppercase tracking-widest font-semibold">
              Deep Work Mode
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100"
          >
            {task.title}
          </motion.h1>

          {!isNegotiating ? (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-8xl md:text-[12rem] font-bold tracking-tighter tabular-nums text-white my-12 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
                {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleCompleteClick}
                disabled={isCompleting}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xl transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)]"
              >
                {isCompleting ? 'Completing...' : 'Mark as Complete'}
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 max-w-xl mx-auto p-8 rounded-2xl bg-red-950/40 border border-red-500/30 backdrop-blur-xl"
            >
              <h2 className="text-2xl font-bold text-red-400 mb-4">Leaving so soon?</h2>
              {isLoading ? (
                <div className="text-slate-400 italic">Consulting AI...</div>
              ) : (
                <>
                  <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                    "{guiltTrip}"
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setIsNegotiating(false)}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                    >
                      Return to Task
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 border border-red-500/50 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors"
                    >
                      I accept the consequences
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
