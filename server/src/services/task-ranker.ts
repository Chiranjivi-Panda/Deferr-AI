/**
 * task-ranker.ts — Deterministic priority scoring for tasks.
 *
 * IMPORTANT: This module is the ONLY place that decides task order.
 * Gemini AI is NEVER used to determine the score or sort order —
 * it only generates a human-readable explanation AFTER scoring.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  FORMULA                                                       │
 * │  score = 0.5 × urgency + 0.4 × importance − 0.1 × effort     │
 * │                                                                 │
 * │  urgency (0–100):                                              │
 * │    100 × (1 − clamp(0, 1, hoursRemaining / 168))              │
 * │    → 0 hours left = 100, 168+ hours left = 0                  │
 * │                                                                 │
 * │  importance (0–100):                                           │
 * │    Category weight from config:                                │
 * │    bill=90, interview=90, assignment=85,                       │
 * │    meeting=60, personal=40, other=50                           │
 * │                                                                 │
 * │  effort (0–100):                                               │
 * │    100 × clamp(0, 1, estimated_effort_minutes / 480)          │
 * │    → Higher effort = slight score penalty                      │
 * └─────────────────────────────────────────────────────────────────┘
 */

import type { Task } from '../types/index.js';
import {
  URGENCY_WEIGHT,
  IMPORTANCE_WEIGHT,
  EFFORT_WEIGHT,
  CATEGORY_IMPORTANCE,
  URGENCY_HORIZON_HOURS,
  MAX_EFFORT_MINUTES,
} from '../config.js';

// ── Helper ──────────────────────────────────────────────────────────────────

/** Clamp a number between min and max (inclusive). */
function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

// ── Scoring Components ──────────────────────────────────────────────────────

/**
 * Compute urgency (0–100) based on how soon the deadline is.
 * Closer deadlines = higher urgency.
 * Past-due tasks get maximum urgency (100).
 */
export function computeUrgency(deadlineISO: string): number {
  const now = Date.now();
  const deadline = new Date(deadlineISO).getTime();
  const hoursRemaining = (deadline - now) / (1000 * 60 * 60);

  // If past due, urgency is maxed out
  if (hoursRemaining <= 0) return 100;

  // Linear ramp: 0h → 100, URGENCY_HORIZON_HOURS+ → 0
  return 100 * (1 - clamp(0, 1, hoursRemaining / URGENCY_HORIZON_HOURS));
}

/**
 * Look up category importance (0–100).
 * Unknown categories default to 50.
 */
export function computeImportance(category: string): number {
  return CATEGORY_IMPORTANCE[category] ?? 50;
}

/**
 * Compute normalized effort penalty (0–100).
 * Longer tasks get a slightly higher penalty.
 */
export function computeEffortPenalty(effortMinutes: number): number {
  return 100 * clamp(0, 1, effortMinutes / MAX_EFFORT_MINUTES);
}

// ── Main Scoring Function ───────────────────────────────────────────────────

/**
 * Compute the deterministic priority score for a task.
 * Returns a number 0–100 (higher = more urgent/important).
 *
 * This function is PURE: same inputs always produce the same output
 * (except for the time component, which naturally changes as deadlines
 * approach). This ensures stable ordering across runs at any given moment.
 */
export function computePriorityScore(task: Task): number {
  const urgency = computeUrgency(task.deadline);
  const importance = computeImportance(task.category);
  const effortPenalty = computeEffortPenalty(task.estimated_effort_minutes);

  const baseScore =
    URGENCY_WEIGHT * urgency +
    IMPORTANCE_WEIGHT * importance -
    EFFORT_WEIGHT * effortPenalty;

  // Compute Time Pressure exactly as requested
  const now = Date.now();
  const deadline = new Date(task.deadline).getTime();
  const minutesRemaining = (deadline - now) / (1000 * 60);
  
  let time_pressure_ratio = 0;
  if (minutesRemaining <= 0) {
    time_pressure_ratio = Infinity; // Past due
  } else {
    time_pressure_ratio = task.estimated_effort_minutes / minutesRemaining;
  }

  let finalScore = baseScore;
  if (time_pressure_ratio >= 0.8) {
    finalScore = Math.max(95, baseScore);
  } else if (time_pressure_ratio >= 0.5) {
    finalScore = Math.max(85, baseScore);
  } else {
    finalScore = baseScore + (time_pressure_ratio * 50);
  }

  // Clamp the final score to 0–100 and round to 1 decimal
  return Math.round(clamp(0, 100, finalScore) * 10) / 10;
}

// ── Fallback Reasoning ──────────────────────────────────────────────────────

/**
 * Generate a templated reasoning string when the Gemini API is unavailable.
 *
 * This ensures the app NEVER breaks — even without AI, every task gets
 * a concrete explanation of its ranking. The wording is first-person
 * and specific, matching the style the AI would use.
 */
export function generateFallbackReasoning(task: Task, rank: number): string {
  const now = Date.now();
  const deadline = new Date(task.deadline).getTime();
  const hoursRemaining = Math.max(0, (deadline - now) / (1000 * 60 * 60));

  // Format hours remaining in a human-readable way
  let timeStr: string;
  if (hoursRemaining < 1) {
    const mins = Math.round(hoursRemaining * 60);
    timeStr = `${mins} minute${mins !== 1 ? 's' : ''}`;
  } else if (hoursRemaining < 24) {
    const hrs = Math.round(hoursRemaining * 10) / 10;
    timeStr = `${hrs} hour${hrs !== 1 ? 's' : ''}`;
  } else {
    const days = Math.round(hoursRemaining / 24 * 10) / 10;
    timeStr = `${days} day${days !== 1 ? 's' : ''}`;
  }

  // Determine importance level label
  const importance = computeImportance(task.category);
  const importanceLabel =
    importance >= 85 ? 'high' : importance >= 60 ? 'medium' : 'lower';

  // Build the reasoning string
  const parts: string[] = [];

  if (hoursRemaining <= 0) {
    parts.push(`I ranked this #${rank} because it's overdue`);
  } else {
    parts.push(`I ranked this #${rank} because it's due in ${timeStr}`);
  }

  parts.push(
    `and it's a ${importanceLabel}-priority ${task.category} task` +
    ` requiring about ${task.estimated_effort_minutes} minutes of effort.`
  );

  return parts.join(' ');
}
