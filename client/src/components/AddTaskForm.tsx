/**
 * AddTaskForm — Natural language input for adding tasks.
 *
 * The user types a task description (e.g., "Submit assignment by tomorrow 11pm")
 * and the AI parses it into structured data. Shows loading state while
 * Gemini processes, error messages on failure, and example prompts to help
 * users understand what to type.
 *
 * Voice input placeholder wired in Phase 3.
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';

interface AddTaskFormProps {
  onSubmit: (rawInput: string) => Promise<void>;
}

export function AddTaskForm({ onSubmit }: AddTaskFormProps) {
  const [input, setInput] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListen = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setInput(prev => (prev + ' ' + transcript).trim());
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      let finalInput = input.trim();
      if (selectedDate) {
        finalInput += ` [Due: ${selectedDate}]`;
      }
      await onSubmit(finalInput);
      setInput('');
      setSelectedDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <GlassCard className="p-6">
        {/* Input area */}
        <div className="mb-5">
          <label
            htmlFor="task-input"
            className="block text-sm font-medium text-slate-300 mb-3"
          >
            Describe your task with a deadline
          </label>
          <div className="relative">
            <textarea
              id="task-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g., "Submit my CS assignment by tomorrow 11pm" or "Pay electricity bill before Friday"'
              disabled={submitting}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/40 focus:ring-1 focus:ring-indigo-400/20 resize-none transition-all disabled:opacity-50 pr-12"
            />
            <button
              type="button"
              onClick={toggleListen}
              className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 pulse-red border border-red-500/30' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
              title="Voice Capture"
            >
              🎤
            </button>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Select Date (Optional)
            </label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={submitting}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-400/40 transition-colors"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/20 text-sm text-red-300"
          >
            {error}
          </motion.div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!input.trim() || submitting}
          className="relative w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
        >
          {/* Button animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/80 via-violet-500/80 to-indigo-500/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent transition-colors duration-300" />
          <div className="absolute inset-0 border border-indigo-400/30 rounded-xl" />
          
          <span className="relative z-10 flex items-center justify-center gap-2 text-indigo-100 drop-shadow-sm group-hover:text-white transition-colors">
            {submitting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Parsing with AI...
              </>
            ) : (
              'Add Task ✨'
            )}
          </span>
        </button>

        {/* Hint text */}
        <p className="mt-4 text-xs text-slate-500 text-center">
          💡 Just describe your task naturally. The AI will extract the deadline,
          category, and effort estimate.
        </p>

        {/* Example prompts — helps users understand what to type */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'Submit math homework by tomorrow 9am',
            'Pay rent before end of month',
            'Prepare for job interview on Friday 2pm',
            'Buy groceries this evening',
          ].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setInput(example)}
              disabled={submitting}
              className="text-left text-xs text-slate-500 hover:text-slate-300 px-3 py-2 rounded-lg hover:bg-white/4 transition-colors disabled:opacity-50"
            >
              &quot;{example}&quot;
            </button>
          ))}
        </div>
      </GlassCard>
    </form>
  );
}
