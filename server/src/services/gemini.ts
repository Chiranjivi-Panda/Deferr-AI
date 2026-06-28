/**
 * gemini.ts — Google Gemini AI service wrapper.
 *
 * This file replaces the local Ollama instance with a native Node
 * implementation calling the Google Gemini API.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Task } from '../types/index.js';

// Initialize the SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface TaskParsedData {
  title: string;
  category: string;
  deadline: string; // ISO string
  estimated_effort_minutes: number;
}

/**
 * Send a prompt to the Google Gemini API and get back the generated text.
 * @param prompt The string prompt to send.
 * @param formatAsJson If true, enforces JSON output via Gemini API configuration.
 */
export async function generateText(prompt: string, formatAsJson: boolean = false): Promise<string> {
  try {
    const modelOptions: any = { model: "gemini-1.5-flash" };
    if (formatAsJson) {
      modelOptions.generationConfig = { responseMimeType: "application/json" };
    }
    
    const model = genAI.getGenerativeModel(modelOptions);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: any) {
    throw new Error(`Gemini API error: ${err.message}`);
  }
}

/**
 * Parse natural-language task input into structured data using Gemini.
 * If Gemini returns malformed JSON, this function throws an error.
 */
export async function parseTaskFromText(rawInput: string): Promise<TaskParsedData> {
  const prompt = `
Extract task details from this raw input: "${rawInput}"
Current time is ${new Date().toISOString()}

Return a JSON object with these EXACT keys (no additional keys, no explanation):
- title (string): A short, clear task name.
- category (string): One of [bill, interview, meeting, assignment, personal, other]. Guess the best fit.
- deadline (string): An ISO 8601 date string. If not specified, default to 24 hours from now.
- estimated_effort_minutes (number): Best guess in minutes (15 to 480). Default 30 if unknown.
  `;

  let responseText = '';
  try {
    responseText = await generateText(prompt, true);
    // Strip markdown code fences if Gemini added them despite responseMimeType
    const cleaned = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      title: parsed.title || 'Untitled Task',
      category: parsed.category || 'other',
      deadline: parsed.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      estimated_effort_minutes: Number(parsed.estimated_effort_minutes) || 30,
    };
  } catch (err) {
    console.error('Failed to parse Gemini response as JSON:', responseText);
    throw err;
  }
}

/**
 * Generates a short 1-2 sentence reasoning explaining why a task has its given priority score.
 */
export async function generateTaskReasoning(task: Task, rank: number): Promise<string> {
  const prompt = `
Write exactly ONE short, punchy sentence (max 15 words) explaining why the task "${task.title}" received a priority score of ${task.priority_score}/100 and is ranked #${rank}.
If the score is high (>70), sound urgent. If low (<40), sound relaxed.
Do not use markdown, do not include the score in the sentence, just the reasoning.
  `;

  const text = await generateText(prompt, false);
  return text.trim();
}
