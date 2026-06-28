/**
 * calendar.ts — Calendar events route.
 *
 * Provides a GET /calendar/events endpoint that returns calendar events
 * within a time window.  Uses the calendar adapter (mock or Google)
 * so the route logic is backend-agnostic.
 */

import { Router } from 'express';
import { getCalendarAdapter } from '../calendar/calendar-adapter.js';

const calendarRouter = Router();

/**
 * GET /calendar/events
 *
 * Query parameters (both optional):
 *   • from — ISO 8601 start of the window (default: now)
 *   • to   — ISO 8601 end of the window (default: now + 48 hours)
 *
 * Returns: JSON array of CalendarEvent objects within the window.
 *
 * Examples:
 *   GET /api/calendar/events
 *   GET /api/calendar/events?from=2025-01-01T00:00:00Z&to=2025-01-02T00:00:00Z
 */
calendarRouter.get('/calendar/events', async (req, res, next) => {
  try {
    // Read query params. Express types them as `string | ParsedQs | ...`,
    // so we cast to string.  If not provided, we use sensible defaults.
    const now = new Date();

    // Default "from" = right now
    const from = (req.query.from as string) || now.toISOString();

    // Default "to" = 48 hours from now
    // 48h × 60min × 60sec × 1000ms = 172_800_000 milliseconds
    const defaultTo = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const to = (req.query.to as string) || defaultTo.toISOString();

    // Get the appropriate calendar adapter (mock or google) via the factory.
    const adapter = getCalendarAdapter();

    // Fetch events within the window.
    const events = await adapter.getEvents(from, to);

    res.json(events);
  } catch (err) {
    // Pass errors to the global error-handling middleware.
    // This is the Express convention: call next(err) instead of throwing.
    next(err);
  }
});

export default calendarRouter;
