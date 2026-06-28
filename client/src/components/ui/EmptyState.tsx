import { motion } from 'framer-motion';

/**
 * EmptyState — A friendly placeholder for when there's no data to display.
 *
 * Used in list views (tasks, logs, etc.) when the array is empty.
 * Shows an emoji icon, a bold title, and an optional description —
 * all animated in with a gentle slide-up via Framer Motion.
 *
 * Props:
 *   - icon:        An emoji string shown large above the title (default: '📭')
 *   - title:       Bold heading explaining the empty state
 *   - description: Optional secondary text with more context
 */
interface EmptyStateProps {
  /** Emoji displayed as the main visual (default: '📭') */
  icon?: string;
  /** Primary heading — tells the user what's missing */
  title: string;
  /** Optional helper text with additional guidance */
  description?: string;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-lg mx-auto"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md text-4xl"
        >
          {icon}
        </motion.div>
      </div>

      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400 mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
}
