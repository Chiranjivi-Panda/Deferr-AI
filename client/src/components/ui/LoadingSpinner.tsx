import { motion } from 'framer-motion';

/**
 * LoadingSpinner — A centered loading indicator with an optional message.
 *
 * Uses Framer Motion to continuously rotate a circular border element,
 * creating a smooth spinning effect. The border is mostly slate-600
 * (dark) with a single indigo-400 segment (border-t) so it looks like
 * a classic spinner.
 *
 * Props:
 *   - message: Text shown below the spinner (default: "Loading...")
 *   - size:    Controls the spinner diameter — 'sm', 'md', or 'lg'
 */
interface LoadingSpinnerProps {
  /** Optional text displayed below the spinner */
  message?: string;
  /** Spinner diameter: sm (20px), md (32px), or lg (48px) */
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
}: LoadingSpinnerProps) {
  // Map size prop to Tailwind width/height classes
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={`flex flex-col items-center justify-center ${message ? 'py-12' : 'py-2'} gap-4`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <motion.div
          className={`absolute ${sizeMap[size]} rounded-full border border-indigo-500/20`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Middle spinning arc */}
        <motion.div
          className={`${sizeMap[size]} rounded-full border-2 border-transparent border-t-indigo-400 border-l-indigo-400/50`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner solid dot (for lg/md sizes) */}
        {size !== 'sm' && (
          <motion.div
            className="absolute w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Optional message with a subtle pulse animation */}
      {message && (
        <p className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-slate-500 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
