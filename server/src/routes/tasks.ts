/**
 * tasks.ts — API routes for task management.
 *
 * Endpoints:
 *   GET    /api/tasks      — List all tasks sorted by priority (highest first)
 *   POST   /api/tasks      — Create a task from natural language input
 *   PATCH  /api/tasks/:id  — Update a task (e.g., change status)
 *   DELETE /api/tasks/:id  — Delete a task
 *
 * The POST flow (the core loop):
 *   1. User sends raw text (e.g., "Submit assignment by tomorrow 11pm")
 *   2. Gemini parses it into structured fields (title, category, deadline, effort)
 *   3. The deterministic ranker computes a priority score (0–100)
 *   4. Gemini generates a 1–2 sentence reasoning string (with templated fallback)
 *   5. The task is saved and returned with all computed fields
 */

import { Router } from 'express';
import { v4 } from 'uuid';
import { JsonStore } from '../store/json-store.js';
import { parseTaskFromText, generateTaskReasoning } from '../services/gemini.js';
import { computePriorityScore, generateFallbackReasoning } from '../services/task-ranker.js';
import type { Task } from '../types/index.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const router = Router();

// Create a store for tasks — uses 'id' as the primary key
const taskStore = new JsonStore<Task>('tasks.json', 'id');

// ── GET /tasks — List all tasks ─────────────────────────────────────────────

router.get('/tasks', async (_req, res, next) => {
  try {
    const tasks = await taskStore.readAll();
    
    // Feature 1: Mission Control Prioritization via Batch Gemini Prompt
    const tasksToScore = tasks.filter(t => typeof t.priority_score === 'undefined' || t.priority_score === null || !(t as any).ai_scored);
    
    if (tasksToScore.length > 0) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const prompt = `Analyze this array of tasks. Assign a priorityScore from 0-100 to each based on urgency (deadline proximity) and impact (effort). Return ONLY a valid JSON array of objects with id and priorityScore.
Tasks: ${JSON.stringify(tasksToScore.map(t => ({ id: t.id, title: t.title, deadline: t.deadline, effort: t.estimated_effort_minutes })))}
Return ONLY a valid JSON array. Do not include markdown blocks.`;
        
        const result = await model.generateContent(prompt);
        const jsonString = result.response.text();
        const cleaned = jsonString.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
        
        const scores = JSON.parse(cleaned) as { id: string, priorityScore: number }[];
        const scoreMap = new Map(scores.map(s => [s.id, s.priorityScore]));
        
        for (const task of tasksToScore) {
          const newScore = scoreMap.get(task.id);
          if (newScore !== undefined) {
            task.priority_score = newScore;
            (task as any).ai_scored = true;
            await taskStore.update(task.id, { priority_score: newScore, ai_scored: true } as any);
          } else {
            (task as any).ai_scored = true;
            await taskStore.update(task.id, { ai_scored: true } as any);
          }
        }
      } catch (err) {
        console.error('Failed batch prioritize tasks via Ollama, falling back to 50:', err);
        // Fallback: assign a default priorityScore of 50
        for (const task of tasksToScore) {
          task.priority_score = 50;
          (task as any).ai_scored = true;
          await taskStore.update(task.id, { priority_score: 50, ai_scored: true } as any);
        }
      }
    }

    // Always sort by priority_score descending (highest priority first).
    const sorted = tasks.sort((a, b) => {
      if (b.priority_score !== a.priority_score) {
        return b.priority_score - a.priority_score;
      }
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    res.json(sorted);
  } catch (err) {
    next(err);
  }
});

// ── POST /tasks/:id/deconstruct — The Domino Deconstructor ──────────────────

router.post('/tasks/:id/deconstruct', async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskStore.findById(id);
    
    if (!task) {
      res.status(404).json({ error: `Task ${id} not found.` });
      return;
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `Take the task '${task.title}' which requires ${task.estimated_effort_minutes} minutes. Break it into exactly 3 sequential, actionable sub-tasks. The first sub-task must be the 'Lead Domino' (easiest starting step). Return ONLY a JSON array with objects containing title and effort. Return ONLY a valid JSON array. Do not include markdown blocks.`;
    
    const result = await model.generateContent(prompt);
    const jsonString = result.response.text();
    const cleaned = jsonString.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    
    const subTasksData = JSON.parse(cleaned) as { title: string, effort: number }[];
    
    if (!Array.isArray(subTasksData) || subTasksData.length !== 3) {
      throw new Error('Ollama did not return exactly 3 sub-tasks.');
    }

    // Create 3 new tasks
    for (const st of subTasksData) {
      const newTask: Task = {
        id: v4(),
        title: st.title,
        raw_input: st.title,
        category: task.category,
        deadline: task.deadline,
        estimated_effort_minutes: st.effort,
        priority_score: 0,
        priority_reasoning: 'Generated via Domino Deconstructor',
        status: 'pending',
        ai_action_log: [{ timestamp: new Date().toISOString(), action: 'deconstructed', details: `Derived from parent task: ${task.title}` }],
        calendar_event_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { computePriorityScore } = await import('../services/task-ranker.js');
      newTask.priority_score = computePriorityScore(newTask);
      await taskStore.add(newTask);
    }

    // Delete parent task
    await taskStore.delete(task.id);
    
    res.json({ success: true, message: 'Deconstructed into 3 sub-tasks' });
  } catch (err) {
    next(err);
  }
});

// ── POST /tasks — Create a new task ─────────────────────────────────────────

router.post('/tasks', async (req, res, next) => {
  try {
    const { raw_input } = req.body;

    // Validate input
    if (!raw_input || typeof raw_input !== 'string' || !raw_input.trim()) {
      res.status(400).json({ error: 'raw_input is required and must be a non-empty string.' });
      return;
    }

    const trimmedInput = raw_input.trim();
    const now = new Date().toISOString();

    // ── Step 1: Parse natural language → structured data ──────────────────
    // Ollama extracts title, category, deadline, and estimated effort.
    console.log(`🔍 Parsing task: "${trimmedInput}"`);
    const parsed = await parseTaskFromText(trimmedInput);
    console.log(`✅ Parsed:`, parsed);

    // Academic Auto-Tagging (Personalization)
    if (/assignment|report|lab|cse|exam/i.test(parsed.title)) {
      parsed.title = `${parsed.title} [Roll: 24cs2013]`;
    }

    // ── Step 2: Create the task object ────────────────────────────────────
    const task: Task = {
      id: v4(),
      title: parsed.title,
      raw_input: trimmedInput,
      category: parsed.category as Task['category'],
      deadline: parsed.deadline,
      estimated_effort_minutes: parsed.estimated_effort_minutes,
      priority_score: 0,         // Computed in Step 3
      priority_reasoning: '',    // Generated in Step 5
      status: 'pending',
      ai_action_log: [
        {
          timestamp: now,
          action: 'task_created',
          details: `Parsed from: "${trimmedInput}"`,
        },
      ],
      calendar_event_id: null,
      created_at: now,
      updated_at: now,
    };

    // ── Step 3: Compute deterministic priority score ──────────────────────
    // This is pure math — Ollama has no influence on the score.
    task.priority_score = computePriorityScore(task);

    // ── Step 4: Save the task ────────────────────────────────────────────
    await taskStore.add(task);

    // ── Step 5: Determine rank and generate reasoning ────────────────────
    // We need to know the task's rank among ALL tasks to write the reasoning.
    const allTasks = await taskStore.readAll();
    const sorted = allTasks.sort((a, b) => {
      if (b.priority_score !== a.priority_score) {
        return b.priority_score - a.priority_score;
      }
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
    const rank = sorted.findIndex((t) => t.id === task.id) + 1;

    // Try AI reasoning first, fall back to template if Ollama is unavailable.
    // The app MUST never break because of an AI failure.
    try {
      task.priority_reasoning = await generateTaskReasoning(task, rank);
      console.log(`🤖 AI reasoning: "${task.priority_reasoning}"`);
    } catch (err) {
      console.warn('⚠️  Ollama reasoning failed, using fallback template:', (err as Error).message);
      task.priority_reasoning = generateFallbackReasoning(task, rank);
    }

    // ── Step 6: Update the task with reasoning ───────────────────────────
    await taskStore.update(task.id, {
      priority_reasoning: task.priority_reasoning,
    });

    console.log(`📋 Task created: #${rank} "${task.title}" (score: ${task.priority_score})`);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// ── POST /tasks/rebalance — The Tactical Rebalance ─────────────────────────

router.post('/tasks/rebalance', async (_req, res, next) => {
  try {
    const tasks = await taskStore.readAll();
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.status !== 'completed' && new Date(t.deadline).getTime() < now.getTime());
    
    if (overdueTasks.length === 0) {
      res.json({ success: true, message: 'No overdue tasks to rebalance.' });
      return;
    }

    // Sort overdue by priority descending
    overdueTasks.sort((a, b) => b.priority_score - a.priority_score);

    // Distribute via Ollama
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const taskData = overdueTasks.map(t => ({ id: t.id, title: t.title }));
      const prompt = `Look at these overdue tasks: ${JSON.stringify(taskData)}. Distribute them across the next 3 days starting from today. Return ONLY a valid JSON array of objects mapping id to a new due_date string (YYYY-MM-DD). Do not use markdown blocks.`;
      
      const result = await model.generateContent(prompt);
      const jsonString = result.response.text();
      const cleaned = jsonString.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned) as { id: string, due_date: string }[];
      
      for (const update of parsed) {
        const task = overdueTasks.find(t => t.id === update.id);
        if (task) {
          const newDeadline = new Date(update.due_date);
          newDeadline.setHours(23, 59, 0, 0);
          task.deadline = newDeadline.toISOString();
          task.ai_action_log.push({
            timestamp: now.toISOString(),
            action: 'tactical_rebalance',
            details: `Rebalanced to new deadline: ${task.deadline} via Ollama`
          });
          task.updated_at = now.toISOString();
          await taskStore.update(task.id, task);
        }
      }
    } catch (err) {
      console.error('Failed tactical rebalance via Ollama, falling back to math:', err);
      // Distribute evenly over next 3 days (fallback)
      let dayOffset = 1;
      for (const task of overdueTasks) {
        const newDeadline = new Date(now);
        newDeadline.setDate(newDeadline.getDate() + dayOffset);
        newDeadline.setHours(23, 59, 0, 0); // End of that day
        
        task.deadline = newDeadline.toISOString();
        task.ai_action_log.push({
          timestamp: now.toISOString(),
          action: 'tactical_rebalance',
          details: `Rebalanced to new deadline: ${task.deadline}`
        });
        task.updated_at = now.toISOString();
        
        await taskStore.update(task.id, task);
        
        dayOffset++;
        if (dayOffset > 3) dayOffset = 1;
      }
    }

    res.json({ success: true, message: `Rebalanced ${overdueTasks.length} tasks.` });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /tasks/:id — Update a task ────────────────────────────────────────

router.patch('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow changing computed fields directly
    delete updates.id;
    delete updates.priority_score;
    delete updates.created_at;

    // Set updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const updated = await taskStore.update(id, updates);
    if (!updated) {
      res.status(404).json({ error: `Task ${id} not found.` });
      return;
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /tasks/:id — Delete a task ───────────────────────────────────────

router.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await taskStore.delete(id);

    if (!deleted) {
      res.status(404).json({ error: `Task ${id} not found.` });
      return;
    }

    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── POST /tasks/:id/propose — Generate a reschedule proposal ─────────────────

router.post('/tasks/:id/propose', async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskStore.findById(id);
    
    if (!task) {
      res.status(404).json({ error: `Task ${id} not found.` });
      return;
    }

    const { checkTaskAtRisk, generateProposal } = await import('../services/proposal-engine.js');
    
    const atRisk = await checkTaskAtRisk(task);
    if (!atRisk) {
      res.json({ atRisk: false, proposal: null });
      return;
    }

    const proposal = await generateProposal(task);
    res.json({ atRisk: true, proposal });
  } catch (err) {
    next(err);
  }
});

// ── POST /tasks/:id/apply — Apply a reschedule proposal ──────────────────────

router.post('/tasks/:id/apply', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { proposal } = req.body;
    
    if (!proposal || !proposal.event_id || !proposal.new_start || !proposal.new_end) {
      res.status(400).json({ error: 'Valid proposal object is required in the body.' });
      return;
    }

    const task = await taskStore.findById(id);
    if (!task) {
      res.status(404).json({ error: `Task ${id} not found.` });
      return;
    }

    const { getCalendarAdapter } = await import('../calendar/calendar-adapter.js');
    const adapter = getCalendarAdapter();
    
    // Move the event
    await adapter.moveEvent(proposal.event_id, proposal.new_start, proposal.new_end);
    
    // Log the action on the task
    const now = new Date().toISOString();
    task.ai_action_log.push({
      timestamp: now,
      action: 'event_moved',
      details: `Moved calendar event to make room: ${proposal.justification}`
    });
    task.status = 'action_taken';
    task.updated_at = now;
    
    const updated = await taskStore.update(id, task);
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── POST /tasks/negotiate/exit — Deep Work Trapdoor ────────────────────────
router.post('/tasks/negotiate/exit', async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Task title is required.' });
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `The user is trying to quit the task '${title}' early. Generate a 2-sentence contextual guilt-trip telling them the consequences of failing this deadline.`;
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleaned = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      res.json({ message: cleaned });
    } catch (err) {
      console.warn('⚠️ Ollama negotiation failed, using fallback:', err);
      res.json({ message: `Quitting now means you'll have to face the music later. Are you sure you want to abandon "${title}"?` });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
