/**
 * types/index.ts — Central type definitions for the Last-Minute Lifesaver.
 *
 * All shared interfaces and type aliases live here so every module imports
 * from a single source of truth.  This prevents circular dependencies and
 * keeps the codebase easy to navigate.
 */

// ═══════════════════════════════════════════════════════════════════════════
//  Task types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A Task is the core entity — something the user needs to do before a deadline.
 * It goes through a lifecycle:  pending → in_progress → action_taken → completed
 *                                               ↘ missed
 */
export interface Task {
  /** Unique identifier (UUID v4). */
  id: string;

  /** Short human-readable title, e.g. "Pay electricity bill". */
  title: string;

  /** The original free-text the user typed, before AI processing. */
  raw_input: string;

  /** AI-classified category used for importance scoring. */
  category: TaskCategory;

  /** When the task must be done by, stored as an ISO 8601 string. */
  deadline: string;

  /** How long (in minutes) the AI estimates this task will take. */
  estimated_effort_minutes: number;

  /**
   * Deterministic priority score from 0 (low) to 100 (critical).
   * Computed from urgency, category importance, and effort.
   * See config.ts for the weight constants.
   */
  priority_score: number;

  /** A short sentence explaining *why* the task got its priority score. */
  priority_reasoning: string;

  /** Current lifecycle status of the task. */
  status: TaskStatus;

  /** Chronological log of every AI action taken for this task. */
  ai_action_log: ActionLogEntry[];

  /**
   * If the task has been scheduled on the calendar, this holds the
   * calendar event ID.  null means "not yet scheduled".
   */
  calendar_event_id: string | null;

  /** When the task was first created (ISO 8601). */
  created_at: string;

  /** When the task was last modified (ISO 8601). */
  updated_at: string;
}

/**
 * The six possible categories a task can fall into.
 * The AI classifier picks one of these based on the user's raw input.
 */
export type TaskCategory =
  | 'bill'
  | 'assignment'
  | 'meeting'
  | 'interview'
  | 'personal'
  | 'other';

/**
 * Task lifecycle statuses:
 * - pending       → just created, nothing done yet
 * - in_progress   → AI is actively working on it
 * - action_taken  → AI has taken at least one action (e.g. drafted an email)
 * - completed     → user confirmed the task is done
 * - missed        → deadline passed without completion
 */
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'action_taken'
  | 'completed'
  | 'missed';

/**
 * A single entry in a task's action log.
 * Records what the AI did and when, so the user has full transparency.
 */
export interface ActionLogEntry {
  /** ISO 8601 timestamp of when the action occurred. */
  timestamp: string;

  /** Short label for the action, e.g. "draft_email", "schedule_calendar". */
  action: string;

  /** Human-readable explanation of what was done. */
  details: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Calendar types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Represents a single event on the user's calendar.
 * Events can be real (from Google Calendar) or mock (from our JSON file).
 */
export interface CalendarEvent {
  /** Unique identifier for this event. */
  event_id: string;

  /** Display title of the event. */
  title: string;

  /** Event start time (ISO 8601). */
  start: string;

  /** Event end time (ISO 8601). */
  end: string;

  /**
   * Whether the AI is allowed to reschedule this event.
   * Doctor appointments → false (can't move).
   * Coffee chat → true (flexible).
   */
  movable: boolean;

  /**
   * If this event was created to block time for a specific task,
   * this links back to that task's ID. null for regular events.
   */
  linked_task_id: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Time Block (free calendar slot)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Represents a gap (free slot) in the calendar where the user
 * has no events. Used by the scheduler to find time for tasks.
 */
export interface TimeBlock {
  /** Start of the free slot (ISO 8601). */
  start: string;

  /** End of the free slot (ISO 8601). */
  end: string;

  /** Length of the free slot in minutes, pre-calculated for convenience. */
  duration_minutes: number;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Proposal (Phase 2 — calendar rescheduling)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A Proposal represents the AI's suggestion to move a movable calendar event
 * to free up time for a higher-priority task.
 *
 * Defined here in Phase 1 for type safety, but the logic that creates
 * proposals will be implemented in Phase 2.
 */
export interface Proposal {
  /** The task that needs time freed up. */
  task_id: string;

  /** The calendar event the AI wants to move. */
  event_id: string;

  /** Where the event currently starts (ISO 8601). */
  original_start: string;

  /** Where the event currently ends (ISO 8601). */
  original_end: string;

  /** Where the AI proposes moving the event's start (ISO 8601). */
  new_start: string;

  /** Where the AI proposes moving the event's end (ISO 8601). */
  new_end: string;

  /** Human-readable explanation of why this move makes sense. */
  justification: string;

  /** How many minutes of free time this move would create. */
  freed_minutes: number;
}
