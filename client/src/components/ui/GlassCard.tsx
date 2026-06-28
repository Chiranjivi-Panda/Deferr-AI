import { motion, type HTMLMotionProps } from 'framer-motion';

/**
 * GlassCard — A reusable glassmorphism card with optional hover effect.
 *
 * Uses the `.glass` CSS class (defined in index.css) for the frosted-glass
 * look, plus Framer Motion for smooth entrance animations and hover effects.
 *
 * Props:
 *   - hoverable:  If true, the card gets a subtle brightness increase on
 *                 hover and a tiny scale-up via Framer Motion's whileHover.
 *   - className:  Additional Tailwind/CSS classes to merge in.
 *   - children:   Content rendered inside the card.
 *   - ...props:   All other motion.div props are forwarded, so the parent
 *                 can add custom initial/animate/exit/transition values.
 *
 * Why extend HTMLMotionProps<'div'>?
 *   This lets TypeScript know that GlassCard accepts every prop that a
 *   Framer Motion <motion.div> accepts (onClick, style, animate, etc.),
 *   making it a true drop-in replacement for <motion.div>.
 */
interface GlassCardProps extends HTMLMotionProps<'div'> {
  /** When true, the card brightens on hover and cursor becomes a pointer */
  hoverable?: boolean;
  /** React children rendered inside the card */
  children: React.ReactNode;
}

export function GlassCard({
  hoverable = false,
  className = '',
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      // Combine the base .glass class with the optional .glass-hover class
      // and any additional classes passed by the parent component.
      className={`glass transform-gpu will-change-transform ${hoverable ? 'glass-hover cursor-pointer' : ''} ${className}`}
      // When hoverable is true, gently scale up on hover for a tactile feel.
      // The spring physics (stiffness + damping) create a snappy, non-bouncy effect.
      whileHover={hoverable ? { scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      // Spread remaining props so the parent can customize animations
      {...props}
    >
      {children}
    </motion.div>
  );
}
