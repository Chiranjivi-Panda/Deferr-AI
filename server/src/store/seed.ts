/**
 * seed.ts — Seeds the mock calendar with realistic events.
 *
 * On first run (when the calendar-events.json file is empty), this module
 * generates 10 sample calendar events spread across the next 48 hours.
 * On subsequent runs it skips seeding so your data isn't overwritten.
 *
 * This gives the app realistic data to work with during development
 * without needing a real Google Calendar connection.
 */

import { v4 } from 'uuid';
import { JsonStore } from './json-store.js';
import type { CalendarEvent } from '../types/index.js';

// ── Helper ──────────────────────────────────────────────────────────────────

/**
 * Returns an ISO 8601 string for `h` hours from the next full hour.
 *
 * "Next full hour" means we round UP to the nearest :00.
 * Example: if it's 2:37 PM, the next full hour is 3:00 PM.
 * Then hoursFromNow(5) → 8:00 PM.
 *
 * This makes the seed data look clean (events start on the hour).
 */
function hoursFromNow(h: number): string {
  const now = new Date();

  // Create a new Date at the next full hour:
  //   - Set minutes, seconds, milliseconds to 0
  //   - Add 1 to the current hour
  const nextFullHour = new Date(now);
  nextFullHour.setMinutes(0, 0, 0); // zero out minutes, seconds, ms
  nextFullHour.setHours(nextFullHour.getHours() + 1); // bump to next hour

  // Add the requested offset in milliseconds.
  // h hours × 60 min/hour × 60 sec/min × 1000 ms/sec
  const target = new Date(nextFullHour.getTime() + h * 60 * 60 * 1000);

  return target.toISOString();
}

/**
 * Convenience: returns an ISO string for `minutes` after a given ISO start.
 * Used to compute event end times from a start time + duration.
 */
function addMinutes(isoStart: string, minutes: number): string {
  const date = new Date(isoStart);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

// ── Seed Function ───────────────────────────────────────────────────────────

/**
 * Seeds the calendar-events.json file with 10 sample events.
 * Skips silently if events already exist (idempotent).
 */
export async function seedCalendarEvents(): Promise<void> {
  const store = new JsonStore<CalendarEvent>('calendar-events.json', 'event_id');

  // Check if events already exist — don't overwrite user's data.
  const existing = await store.readAll();
  if (existing.length > 0) {
    return; // Already seeded, nothing to do.
  }

  // ── Define the 10 seed events ───────────────────────────────────────────
  // Each event has:
  //   • An offset (hours from now) for its start time
  //   • A duration in minutes
  //   • Whether it's movable (can the AI reschedule it?)
  //   • No linked task (these are pre-existing calendar events)

  const seedData: Array<{
    title: string;
    offsetHours: number;
    durationMinutes: number;
    movable: boolean;
  }> = [
    { title: 'Team Standup',          offsetHours: 1,  durationMinutes: 30,  movable: false },
    { title: 'Lunch with Alex',       offsetHours: 3,  durationMinutes: 60,  movable: true },
    { title: 'Project Review',        offsetHours: 5,  durationMinutes: 60,  movable: false },
    { title: 'Gym Session',           offsetHours: 7,  durationMinutes: 90,  movable: true },
    { title: 'Coffee Chat with Sam',  offsetHours: 10, durationMinutes: 45,  movable: true },
    { title: 'Study Group',           offsetHours: 14, durationMinutes: 120, movable: true },
    { title: 'Doctor Appointment',    offsetHours: 20, durationMinutes: 60,  movable: false },
    { title: 'Side Project Work',     offsetHours: 24, durationMinutes: 120, movable: true },
    { title: 'Weekly Planning',       offsetHours: 30, durationMinutes: 60,  movable: true },
    { title: 'Movie Night',           offsetHours: 36, durationMinutes: 150, movable: true },
  ];

  // Transform the seed data into full CalendarEvent objects.
  const events: CalendarEvent[] = seedData.map((seed) => {
    const start = hoursFromNow(seed.offsetHours);
    return {
      event_id: v4(),
      title: seed.title,
      start,
      end: addMinutes(start, seed.durationMinutes),
      movable: seed.movable,
      linked_task_id: null, // These aren't linked to any task yet
    };
  });

  // Inject the guaranteed conflict event exactly relative to now
  const exactNow = new Date();
  const meetingStart = new Date(exactNow.getTime() - 60 * 60 * 1000).toISOString(); // 1 hour ago
  const meetingEnd = new Date(exactNow.getTime() + 3 * 60 * 60 * 1000).toISOString(); // 3 hours from now
  
  events.unshift({
    event_id: v4(),
    title: 'Long Strategy Meeting',
    start: meetingStart,
    end: meetingEnd,
    movable: true,
    linked_task_id: null,
  });

  // Write all events to the JSON file in one go.
  await store.writeAll(events);
}
