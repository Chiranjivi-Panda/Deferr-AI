/**
 * config.ts — Central configuration for the Last-Minute Lifesaver server.
 *
 * This file MUST be imported first in the app entry point (index.ts) so that
 * dotenv loads the .env file before any other module reads process.env.
 *
 * The .env file lives in the project root (one level above server/), because
 * `npm run dev` executes from the server/ directory, so we resolve '../.env'.
 */

import dotenv from 'dotenv';
import path from 'node:path';

// ── Load environment variables ──────────────────────────────────────────────
// path.resolve(process.cwd(), '..', '.env') points to <project-root>/.env
// because npm scripts run from the server/ directory.
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

// ── Gemini API Configuration ──────────────────────────────────────────────────
// API Key is loaded securely from .env via process.env.GEMINI_API_KEY


// ── Server Configuration ────────────────────────────────────────────────────
/** Port the Express server listens on. Cloud Run uses PORT, local uses SERVER_PORT or defaults to 3001. */
export const SERVER_PORT: number = parseInt(process.env.PORT || process.env.SERVER_PORT || '3001', 10);
/**
 * The origin URL of the frontend client.
 * Used by the CORS middleware to allow cross-origin requests.
 * Defaults to Vite's dev server address.
 */
export const CLIENT_ORIGIN: string = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

/**
 * Which calendar backend to use.
 * 'mock'   — file-based fake calendar (default, great for development)
 * 'google' — real Google Calendar integration (Phase 4, not yet implemented)
 */
export const CALENDAR_PROVIDER: string = process.env.CALENDAR_PROVIDER || 'mock';

// ── File-based Data Storage Paths ───────────────────────────────────────────
/** Directory where JSON data files (tasks, calendar events) are stored. */
export const DATA_DIR: string = path.resolve(process.cwd(), 'data');

/** Full path to the tasks JSON file. */
export const TASKS_FILE: string = path.join(DATA_DIR, 'tasks.json');

/** Full path to the calendar events JSON file. */
export const CALENDAR_EVENTS_FILE: string = path.join(DATA_DIR, 'calendar-events.json');

// ── Priority Scoring Weights ────────────────────────────────────────────────
/**
 * The priority score formula is:
 *   score = (urgency * URGENCY_WEIGHT) + (importance * IMPORTANCE_WEIGHT) - (effort_penalty * EFFORT_WEIGHT)
 *
 * These weights control how much each factor contributes to the final 0-100 score.
 * They should sum to 1.0 for the positive factors (urgency + importance).
 * Effort is subtracted, so higher effort slightly lowers the score.
 */
export const URGENCY_WEIGHT = 0.5;
export const IMPORTANCE_WEIGHT = 0.4;
export const EFFORT_WEIGHT = 0.1;

// ── Category-based Importance ───────────────────────────────────────────────
/**
 * Each task category has a base importance value (0-100).
 * Bills and interviews are critical (90), assignments are high (85),
 * meetings are moderate (60), personal tasks are lower (40).
 */
export const CATEGORY_IMPORTANCE: Record<string, number> = {
  bill: 90,
  interview: 90,
  assignment: 85,
  meeting: 60,
  personal: 40,
  other: 50,
};

// ── Urgency & Effort Boundaries ─────────────────────────────────────────────
/**
 * How far into the future (in hours) we consider for urgency calculation.
 * Tasks due within this window get higher urgency; tasks further out get lower.
 * 168 hours = 7 days.
 */
export const URGENCY_HORIZON_HOURS = 168;

/**
 * The maximum expected effort for any single task, in minutes.
 * Used to normalize effort into a 0-1 range for scoring.
 * 480 minutes = 8 hours.
 */
export const MAX_EFFORT_MINUTES = 480;
