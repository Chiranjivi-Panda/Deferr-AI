/**
 * calendar-adapter.ts — Calendar adapter interface & factory.
 *
 * THE ADAPTER PATTERN (for beginners):
 * ────────────────────────────────────
 * An "adapter" is a design pattern that lets your app work with different
 * backends through the SAME interface.  Think of it like a power adapter:
 * your laptop plug is the same, but the adapter converts it for different
 * wall sockets (US, EU, UK).
 *
 * Here, CalendarAdapter is the interface (the "plug shape").  We have two
 * implementations:
 *   1. MockCalendarAdapter  — reads/writes a local JSON file (for dev)
 *   2. GoogleCalendarAdapter — talks to Google Calendar API (for prod)
 *
 * The rest of the app only ever uses the CalendarAdapter interface.
 * It never knows (or cares) which implementation is behind it.
 * Switching from mock to Google is just changing one env variable.
 *
 * The factory function `getCalendarAdapter()` reads the config and returns
 * the right implementation.
 */

import type { CalendarEvent, TimeBlock } from '../types/index.js';
import { CALENDAR_PROVIDER } from '../config.js';
import { MockCalendarAdapter } from './mock-calendar.js';
import { GoogleCalendarAdapter } from './google-calendar.js';

// ── The Interface ───────────────────────────────────────────────────────────

/**
 * CalendarAdapter defines the contract that ANY calendar backend must fulfill.
 * Every method returns a Promise because calendar operations may involve
 * network calls (e.g. Google Calendar API) or file I/O (mock store).
 */
export interface CalendarAdapter {
  /**
   * Fetch all events that overlap with the [from, to] time window.
   * @param from — ISO 8601 start of the window
   * @param to   — ISO 8601 end of the window
   */
  getEvents(from: string, to: string): Promise<CalendarEvent[]>;

  /**
   * Fetch a single event by its unique ID.
   * Returns null if no event with that ID exists.
   */
  getEventById(eventId: string): Promise<CalendarEvent | null>;

  /**
   * Move (reschedule) an event to a new time slot.
   * @param eventId  — the event to move
   * @param newStart — new start time (ISO 8601)
   * @param newEnd   — new end time (ISO 8601)
   * @returns The updated event object
   */
  moveEvent(eventId: string, newStart: string, newEnd: string): Promise<CalendarEvent>;

  /**
   * Find free (unoccupied) time blocks within the given window.
   * Only returns blocks that are at least `minMinutes` long.
   * @param from       — start of search window (ISO 8601)
   * @param to         — end of search window (ISO 8601)
   * @param minMinutes — minimum block length in minutes
   */
  findFreeBlocks(from: string, to: string, minMinutes: number): Promise<TimeBlock[]>;
}

// ── The Factory ─────────────────────────────────────────────────────────────

/**
 * Returns the appropriate CalendarAdapter based on the CALENDAR_PROVIDER
 * environment variable.
 *
 * Usage:
 *   const calendar = getCalendarAdapter();
 *   const events = await calendar.getEvents(from, to);
 *
 * The caller never needs to know which adapter it got.
 */
export function getCalendarAdapter(): CalendarAdapter {
  switch (CALENDAR_PROVIDER) {
    case 'google':
      // Phase 4: Google Calendar integration.
      // This will throw until the GoogleCalendarAdapter is implemented.
      return new GoogleCalendarAdapter();

    case 'mock':
    default:
      // Default: use the file-based mock calendar.
      // Great for development — no API keys or OAuth needed.
      return new MockCalendarAdapter();
  }
}
