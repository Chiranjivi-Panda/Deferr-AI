import { Router } from 'express';
import { JsonStore } from '../store/json-store.js';
import type { Task } from '../types/index.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const router = Router();
const taskStore = new JsonStore<Task>('tasks.json', 'id');

// ── GET /insights/dna — Determine Deadline DNA tag ──────────────────────────

router.get('/insights/dna', async (_req, res, next) => {
  try {
    const mockHistory = [
      { task: "Interview Prep", estimated_minutes: 60, actual_minutes: 0, status: "missed_deadline" },
      { task: "Report Draft", estimated_minutes: 30, actual_minutes: 120, status: "completed_late" },
      { task: "Email Inbox Zero", estimated_minutes: 15, actual_minutes: 45, status: "completed_on_time" }
    ];
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const prompt = `Analyze this user's task history: ${JSON.stringify(mockHistory)}. Identify 2 procrastination patterns. Return ONLY valid JSON in this exact format: { "patterns": [ { "name": "string", "description": "string", "preemptive_action": "string" } ] }. Do not include markdown formatting.`;
      
      const result = await model.generateContent(prompt);
      const jsonString = result.response.text();
      const cleaned = jsonString.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      
      res.json({ patterns: parsed.patterns || [] });
    } catch (err) {
      console.error('Failed to get DNA from Ollama:', err);
      res.json({ 
        patterns: [
          { name: "Optimistic Estimator", description: "You consistently underestimate the time required for deep work.", preemptive_action: "Automatically padding future estimates by 50%." }
        ] 
      });
    }
  } catch (err) {
    next(err);
  }
});

// ── GET /insights/fingerprint — Procrastination Fingerprint ─────────────────
router.get('/insights/fingerprint', async (_req, res, next) => {
  try {
    const tasks = await taskStore.readAll();
    const now = Date.now();
    
    const overdueTasks = tasks.filter(t => t.status !== 'completed' && new Date(t.deadline).getTime() < now);

    if (overdueTasks.length > 1) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const taskList = overdueTasks.map(t => `- ${t.title} (${t.estimated_effort_minutes} mins)`).join('\n');
        const prompt = `The user is avoiding these tasks:\n${taskList}\n\nIn one short sentence, playfully diagnose their procrastination habit and tell them to start the easiest one. Return ONLY a valid JSON object with a single key "message". Do not include markdown formatting.`;
        
        const result = await model.generateContent(prompt);
        const jsonString = result.response.text();
        const cleaned = jsonString.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        
        res.json({ message: parsed.message || 'Time to stop scrolling and start doing.' });
      } catch (err) {
        console.error('Failed to get fingerprint from Ollama:', err);
        res.json({ message: `You have ${overdueTasks.length} overdue tasks piling up. Tackle the easiest one first!` });
      }
    } else {
      res.json({ message: null });
    }
  } catch (err) {
    next(err);
  }
});
// ── POST /insights/mirror — Temporal Mirror ──────────────────────────────────
router.post('/insights/mirror', async (_req, res, next) => {
  try {
    const tasks = await taskStore.readAll();
    const now = Date.now();
    const fortyEightHours = now + 48 * 60 * 60 * 1000;
    
    const upcomingTasks = tasks
      .filter(t => t.status !== 'completed' && new Date(t.deadline).getTime() <= fortyEightHours)
      .map(t => t.title);

    if (upcomingTasks.length === 0) {
      res.json({ message: "Wow, a totally clear schedule for the next two days. Are you dead or just incredibly optimized?" });
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Look at these upcoming tasks: ${JSON.stringify(upcomingTasks)}. Write a wry, slightly sarcastic first-person 2-sentence projection of what the user's life will look like in 48 hours if they don't start right now. Return standard plain text (not JSON).`;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      res.json({ message: responseText.trim() });
    } catch (err) {
      console.error('Failed to get mirror from Ollama:', err);
      res.json({ message: "In 48 hours, you'll be drowning in a sea of regret and unfinished business. Start now or accept your fate." });
    }
  } catch (err) {
    next(err);
  }
});

// ── GET /insights/chronotype ───────────────────────────────────────────────
router.get('/insights/chronotype', async (_req, res, next) => {
  try {
    const mockTimes = ["23:00", "01:15", "02:30", "14:00"];
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `A user completed tasks at these times: ${JSON.stringify(mockTimes)}. In one punchy sentence, tell them what their peak productivity window is and give it a cool name (like 'The Midnight Oil' or 'The Dawn Patrol'). Do not use json formatting.`;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      res.json({ message: responseText.trim() });
    } catch (err) {
      console.error('Failed to get chronotype from Ollama:', err);
      res.json({ message: "You are a creature of 'The Midnight Oil', burning brightest when the world is asleep." });
    }
  } catch (err) {
    next(err);
  }
});

// ── POST /insights/say-no ──────────────────────────────────────────────────
router.post('/insights/say-no', async (req, res, next) => {
  try {
    const { highImpactTime, lowImpactTime } = req.body;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `The user is spending ${lowImpactTime} minutes on low-priority tasks and only ${highImpactTime} minutes on high-priority tasks. Give them a 1-sentence, tough-love reality check advising them to drop the busywork. Do not use json formatting.`;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      res.json({ message: responseText.trim() });
    } catch (err) {
      console.error('Failed to get say-no from Ollama:', err);
      res.json({ message: "Stop confusing being busy with being productive; drop the low-impact work immediately." });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
