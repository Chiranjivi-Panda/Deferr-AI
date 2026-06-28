import { motion } from 'framer-motion';

/**
 * ErrorState — A user-friendly error display with an optional retry button.
 *
 * Shown when an API call fails or something unexpected goes wrong.
 * Provides a clear error message and, if an onRetry callback is supplied,
 * a "Try Again" button so the user can reattempt the failed action.
 *
 * Props:
 *   - title:   Heading text (default: "Something went wrong")
 *   - message: Detailed error description (required)
 *   - onRetry: Optional callback — if provided, a retry button is shown
 */
interface ErrorStateProps {
  /** Heading shown above the error message */
  title?: string;
  /** Detailed error description — shown in a muted color */
  message: string;
  /** If provided, renders a "Try Again" button that calls this function */
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-lg mx-auto"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-white/5 border border-red-500/20 shadow-lg backdrop-blur-md text-4xl"
        >
          ⚠️
        </motion.div>
      </div>

      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-red-500 mb-2">{title}</h3>

      <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-red-500/10 text-red-300 border border-red-500/30 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.15)]"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}
