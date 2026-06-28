// ==========================================================================
// API Client — Simple fetch wrapper
// ==========================================================================
// This module provides two helper functions (apiGet, apiPost) that wrap
// the native fetch() API with:
//   1. Automatic JSON parsing
//   2. Consistent error handling
//   3. TypeScript generics for type-safe responses
//
// All endpoints are RELATIVE (e.g., '/health') — Vite's dev server proxy
// forwards them to the Express backend automatically. In production the
// server serves the client build, so relative paths still work.
// ==========================================================================

import { API_BASE } from '../constants';

/**
 * apiGet — Sends a GET request and returns the parsed JSON body.
 *
 * @template T - The expected shape of the response data
 * @param endpoint - The API path (e.g., '/health', '/tasks')
 * @returns The parsed response body, typed as T
 * @throws Error with the server's error message or a generic status message
 *
 * Usage:
 *   const data = await apiGet<{ status: string }>('/health');
 *   console.log(data.status); // "ok"
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);

  if (!res.ok) {
    // Try to extract an error message from the JSON body.
    // If the body isn't valid JSON (e.g., HTML error page), fall back to
    // the HTTP status text (e.g., "404 Not Found").
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * apiPost — Sends a POST request with an optional JSON body.
 *
 * @template T - The expected shape of the response data
 * @param endpoint - The API path (e.g., '/tasks', '/proposals/generate')
 * @param data - Optional request body (will be JSON-stringified)
 * @returns The parsed response body, typed as T
 * @throws Error with the server's error message or a generic status message
 *
 * Usage:
 *   const task = await apiPost<Task>('/tasks', { title: 'Pay rent', ... });
 */
export async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Only stringify if data is provided — avoids sending "undefined" as the body
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * apiPatch — Sends a PATCH request with an optional JSON body.
 * Used for partial updates (e.g., changing a task's status).
 */
export async function apiPatch<T>(endpoint: string, data?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * apiDelete — Sends a DELETE request.
 * Used for removing resources (e.g., deleting a task).
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

