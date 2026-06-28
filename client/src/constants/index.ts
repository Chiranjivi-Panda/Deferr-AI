// ==========================================================================
// Application constants
// ==========================================================================
// Centralized configuration values used across the client.
// Keeping these in one place makes it easy to update colors, labels,
// or API paths without hunting through component files.
// ==========================================================================

/**
 * API_BASE — The base URL prefix for all API calls.
 * This is a relative path ("/api") because Vite's dev server proxy
 * automatically forwards requests starting with "/api" to the Express
 * backend at http://localhost:3001. In production, the server serves
 * the built client, so the relative path still works.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * CATEGORY_COLORS — Tailwind CSS class sets for each task category.
 * Each category has three color tokens:
 *   - bg:     background class (for badges, tags, chips)
 *   - text:   foreground text class
 *   - border: border class (for outlines and dividers)
 *
 * These use Tailwind's built-in color palette with opacity modifiers
 * (e.g., bg-amber-500/10 = amber-500 at 10% opacity).
 */
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  bill: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    border: 'border-amber-500/20',
  },
  interview: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-300',
    border: 'border-violet-500/20',
  },
  assignment: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    border: 'border-blue-500/20',
  },
  meeting: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-300',
    border: 'border-cyan-500/20',
  },
  personal: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    border: 'border-emerald-500/20',
  },
  other: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    border: 'border-slate-500/20',
  },
};

/**
 * CATEGORY_LABELS — Human-readable names for each task category.
 * Displayed in dropdowns, badges, and headings instead of raw enum values.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  bill: 'Bill / Payment',
  interview: 'Interview',
  assignment: 'Assignment',
  meeting: 'Meeting',
  personal: 'Personal',
  other: 'Other',
};

/**
 * STATUS_LABELS — Human-readable names for each task status.
 * Used in status badges, filters, and task cards.
 */
export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
};
