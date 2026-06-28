/**
 * mock-calendar.ts — File-based calendar adapter for development.
 *
 * This adapter reads and writes calendar events to a local JSON file
 * instead of calling a real calendar API.  It implements the same
 * CalendarAdapter interface that GoogleCalendarAdapter will use,
 * so the rest of the app can't tell the difference.
 */

import type { CalendarAdapter } from './calendar-adapter.js';
import type { CalendarEvent, TimeBlock } from '../types/index.js';
import { JsonStore } from '../store/json-store.js';

export class MockCalendarAdapter implements CalendarAdapter {
  /**
   * Internal store for calendar events.
   * The second argument 'event_id' tells the store which field is the primary key.
   */
  private store = new JsonStore<CalendarEvent>('calendar-events.json', 'event_id');

  /**
   * Fetch events that overlap with the given time window [from, to].
   *
   * An event "overlaps" the window if its start is before the window ends
   * AND its end is after the window starts.  This catches:
   *   • Events fully inside the window
   *   • Events that started before but end during the window
   *   • Events that start during but end after the window
   *   • Events that span the entire window
   */
  async getEvents(from: string, to: string): Promise<CalendarEvent[]> {
    const all = await this.store.readAll();

    const windowStart = new Date(from).getTime();
    const windowEnd = new Date(to).getTime();

    // Filter to only events overlapping the [from, to] window.
    const overlapping = all.filter((event) => {
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();

      // Standard interval overlap check:
      // Two intervals [A, B] and [C, D] overlap iff A < D AND C < B
      return eventStart < windowEnd && eventEnd > windowStart;
    });

    // Sort by start time so events come back in chronological order.
    overlapping.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return overlapping;
  }

  /**
   * Fetch a single event by its event_id.
   * Returns null (not undefined) to match the CalendarAdapter interface.
   */
  async getEventById(eventId: string): Promise<CalendarEvent | null> {
    const found = await this.store.findById(eventId);
    // Convert undefined → null for a cleaner API contract.
    return found ?? null;
  }

  /**
   * Move an event to a new time slot.
   * Throws an error if the event doesn't exist — the caller should handle this.
   */
  async moveEvent(
    eventId: string,
    newStart: string,
    newEnd: string
  ): Promise<CalendarEvent> {
    const updated = await this.store.update(eventId, {
      start: newStart,
      end: newEnd,
    } as Partial<CalendarEvent>);

    if (!updated) {
      throw new Error(`Calendar event not found: ${eventId}`);
    }

    return updated;
  }

  /**
   * Find free (unoccupied) time blocks within the given window.
   *
   * Algorithm:
   * 1. Get all events in the window, sorted by start time.
   * 2. Walk through them chronologically.
   * 3. Any gap between the end of one event and the start of the next
   *    is a free block (if it's long enough).
   * 4. Also check the gap before the first event and after the last event.
   *
   * Visual example (window = 9am–5pm):
   *
   *   9am       10am   11am        1pm    2pm        5pm
   *   |---free---|=====|---free----|======|---free----|
   *              Event1            Event2
   *
   *   Free blocks: [9am-10am], [11am-1pm], [2pm-5pm]
   *
   * @param minMinutes — Only return blocks at least this many minutes long.
   */
  async findFreeBlocks(
    from: string,
    to: string,
    minMinutes: number
  ): Promise<TimeBlock[]> {
    // Get events sorted by start time (getEvents already sorts them).
    const events = await this.getEvents(from, to);

    const blocks: TimeBlock[] = [];
    const windowStart = new Date(from).getTime();
    const windowEnd = new Date(to).getTime();

    // `cursor` tracks where we are as we walk through the timeline.
    // Start at the beginning of the window.
    let cursor = windowStart;

    for (const event of events) {
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();

      // If there's a gap between the cursor and this event's start,
      // that gap is a free block.
      if (eventStart > cursor) {
        const gapMinutes = (eventStart - cursor) / (1000 * 60);

        if (gapMinutes >= minMinutes) {
          blocks.push({
            start: new Date(cursor).toISOString(),
            end: new Date(eventStart).toISOString(),
            duration_minutes: gapMinutes,
          });
        }
      }

      // Move the cursor to the end of this event (or keep it if cursor is already past).
      // Math.max handles the case where events overlap — we don't go backwards.
      cursor = Math.max(cursor, eventEnd);
    }

    // After the last event, check if there's a gap before the window ends.
    if (cursor < windowEnd) {
      const tailMinutes = (windowEnd - cursor) / (1000 * 60);

      if (tailMinutes >= minMinutes) {
        blocks.push({
          start: new Date(cursor).toISOString(),
          end: new Date(windowEnd).toISOString(),
          duration_minutes: tailMinutes,
        });
      }
    }

    return blocks;
  }
}
