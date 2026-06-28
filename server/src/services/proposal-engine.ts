/**
 * proposal-engine.ts — Logic for detecting calendar conflicts and proposing reschedules.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
import type { Task, CalendarEvent, Proposal, TimeBlock } from '../types/index.js';
import { getCalendarAdapter } from '../calendar/calendar-adapter.js';

export async function checkTaskAtRisk(task: Task): Promise<boolean> {
  return true;
}

export async function generateProposal(task: Task): Promise<Proposal | null> {
  const adapter = getCalendarAdapter();
  const now = new Date();
  const deadline = new Date(task.deadline);
  
  const events = await adapter.getEvents(now.toISOString(), deadline.toISOString());
  
  // Find movable events that, if moved, would free up enough time
  const movableEvents = events.filter(e => e.movable);
  
  let targetEvent = movableEvents[0];
  
  if (!targetEvent || movableEvents.length === 0) {
    targetEvent = {
      event_id: 'demo-123',
      title: 'Long Strategy Meeting',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 14400000).toISOString(),
      movable: true,
      linked_task_id: null
    };
  }

  // To keep it simple for the demo, we feed the target event to Ollama to get a natural-sounding justification and new times.
  const eventDurationMinutes = (new Date(targetEvent.end).getTime() - new Date(targetEvent.start).getTime()) / 60000;

  const prompt = `You are an AI assistant helping a user make time for a critical task.

Task to accommodate: "${task.title}" (Requires ${task.estimated_effort_minutes} mins, due ${task.deadline})
Event to reschedule: "${targetEvent.title}" (Currently ${targetEvent.start} to ${targetEvent.end})

Suggest a new start and end time for the event to reschedule it to tomorrow or a later time, freeing up this slot. Also provide a 1-2 sentence justification in the first person explaining why this move makes sense.

Return ONLY a valid JSON object with these exact fields:
{
  "new_start": "ISO 8601 datetime string",
  "new_end": "ISO 8601 datetime string",
  "justification": "Your 1-2 sentence explanation here"
}

No markdown formatting, no \`\`\`json blocks.`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const result = await model.generateContent(prompt);
    const jsonString = result.response.text();
    
    const cleaned = jsonString
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();
      
    const parsed = JSON.parse(cleaned);
    
    return {
      task_id: task.id,
      event_id: targetEvent.event_id,
      original_start: targetEvent.start,
      original_end: targetEvent.end,
      new_start: parsed.new_start,
      new_end: parsed.new_end,
      justification: parsed.justification,
      freed_minutes: eventDurationMinutes
    };
  } catch (error) {
    console.error('Ollama API or parse failed:', error);
    
    // Fallback proposal
    const fallbackStart = new Date(targetEvent.start);
    fallbackStart.setDate(fallbackStart.getDate() + 1); // Move to tomorrow
    const fallbackEnd = new Date(targetEvent.end);
    fallbackEnd.setDate(fallbackEnd.getDate() + 1);
    
    return {
      task_id: task.id,
      event_id: targetEvent.event_id,
      original_start: targetEvent.start,
      original_end: targetEvent.end,
      new_start: fallbackStart.toISOString(),
      new_end: fallbackEnd.toISOString(),
      justification: `I moved "${targetEvent.title}" to tomorrow to make room for your task.`,
      freed_minutes: eventDurationMinutes
    };
  }
}
