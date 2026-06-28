/**
 * index.ts — Main entry point for the Last-Minute Lifesaver server.
 *
 * This file wires everything together:
 *   1. Loads configuration (which triggers dotenv to read the .env file)
 *   2. Creates the Express app with middleware
 *   3. Mounts all route handlers
 *   4. Seeds the mock calendar with sample data
 *   5. Starts listening for HTTP requests
 *
 * IMPORTANT: The config import MUST come first so that dotenv loads
 * environment variables before any other module reads process.env.
 */

// ── Step 1: Import config FIRST (loads .env) ────────────────────────────────
import { SERVER_PORT, CLIENT_ORIGIN } from './config.js';

if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

// ── Step 2: Import Express and middleware ────────────────────────────────────
import express from 'express';
import cors from 'cors';

// ── Step 3: Import route handlers ───────────────────────────────────────────
import healthRouter from './routes/health.js';
import calendarRouter from './routes/calendar.js';
import tasksRouter from './routes/tasks.js';
import insightsRouter from './routes/insights.js';

// ── Step 4: Import error handler ────────────────────────────────────────────
import { errorHandler } from './middleware/error-handler.js';

// ── Step 5: Import seed function ────────────────────────────────────────────
import { seedCalendarEvents } from './store/seed.js';

// ── Create the Express application ──────────────────────────────────────────
const app = express();

// ── Configure Middleware ────────────────────────────────────────────────────

/**
 * CORS (Cross-Origin Resource Sharing):
 * The frontend (Vite on port 5173) and the backend (Express on port 3001)
 * run on different ports, which browsers treat as different "origins".
 * Without CORS, the browser would block the frontend's API requests.
 * We allow requests from CLIENT_ORIGIN (set in config/env).
 */
app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

/**
 * JSON body parser:
 * Automatically parses incoming request bodies with Content-Type: application/json
 * and makes the parsed data available as `req.body`.
 */
app.use(express.json());

// ── Mount Routes ────────────────────────────────────────────────────────────

/**
 * All API routes are mounted under the /api prefix.
 * This keeps API routes separate from any static file serving.
 *
 * Final routes:
 *   GET /api/health          — server health check
 *   GET /api/test-gemini     — test Gemini AI connection
 *   GET /api/calendar/events — list calendar events
 */
app.use('/api', healthRouter);
app.use('/api', calendarRouter);
app.use('/api', tasksRouter);
app.use('/api', insightsRouter);

// ── Error Handler (must be AFTER all routes) ────────────────────────────────
/**
 * Express processes middleware in order. The error handler must be last
 * so it catches errors from ALL routes above it.
 */
app.use(errorHandler);

// ── Start the Server ────────────────────────────────────────────────────────

/**
 * Async wrapper so we can await the seed function before listening.
 * Top-level await is supported in ES modules, but wrapping in an async
 * function is more explicit and gives us a place to handle startup errors.
 */
async function start(): Promise<void> {
  try {
    // Seed the mock calendar with sample events (skips if already seeded).
    await seedCalendarEvents();
    console.log('📅 Mock calendar seeded with sample events');

    // Start listening for HTTP requests.
    app.listen(SERVER_PORT, () => {
      console.log(`🚀 Server running at http://localhost:${SERVER_PORT}`);
      console.log(`   API base: http://localhost:${SERVER_PORT}/api`);

      console.log('✨ Deferr AI Engine: Gemini 1.5 Flash Active');
    });
  } catch (err) {
    console.error('💥 Failed to start server:', err);
    process.exit(1);
  }
}

// Kick off the server.
start();
