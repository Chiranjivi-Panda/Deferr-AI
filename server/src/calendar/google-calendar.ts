/**
 * google-calendar.ts — Google Calendar adapter STUB (Phase 4).
 *
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  THIS IS A PLACEHOLDER — NOT YET IMPLEMENTED                       ║
 * ║                                                                     ║
 * ║  In Phase 4, this file will be fleshed out to:                     ║
 * ║    1. Use the Google Calendar API (googleapis npm package)          ║
 * ║    2. Authenticate via OAuth 2.0 (user grants calendar access)     ║
 * ║    3. Read, create, update, and delete real calendar events         ║
 * ║                                                                     ║
 * ║  To implement it, you would:                                       ║
 * ║    • Install: npm install googleapis                                ║
 * ║    • Set up OAuth credentials in Google Cloud Console               ║
 * ║    • Store refresh tokens securely (e.g. in .env or a database)    ║
 * ║    • Map Google Calendar event format ↔ our CalendarEvent type     ║
 * ║                                                                     ║
 * ║  Until then, use CALENDAR_PROVIDER=mock in your .env file.         ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

import type { CalendarAdapter } from './calendar-adapter.js';
import type { CalendarEvent, TimeBlock } from '../types/index.js';

/**
 * Stub implementation of CalendarAdapter for Google Calendar.
 * Every method throws an error to clearly indicate this isn't ready yet.
 */
export class GoogleCalendarAdapter implements CalendarAdapter {
  async getEvents(_from: string, _to: string): Promise<CalendarEvent[]> {
    throw new Error(
      'GoogleCalendarAdapter is not yet implemented. Set CALENDAR_PROVIDER=mock in .env.'
    );
  }

  async getEventById(_eventId: string): Promise<CalendarEvent | null> {
    throw new Error(
      'GoogleCalendarAdapter is not yet implemented. Set CALENDAR_PROVIDER=mock in .env.'
    );
  }

  async moveEvent(
    _eventId: string,
    _newStart: string,
    _newEnd: string
  ): Promise<CalendarEvent> {
    throw new Error(
      'GoogleCalendarAdapter is not yet implemented. Set CALENDAR_PROVIDER=mock in .env.'
    );
  }

  async findFreeBlocks(
    _from: string,
    _to: string,
    _minMinutes: number
  ): Promise<TimeBlock[]> {
    throw new Error(
      'GoogleCalendarAdapter is not yet implemented. Set CALENDAR_PROVIDER=mock in .env.'
    );
  }
}
