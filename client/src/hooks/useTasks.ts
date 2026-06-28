/**
 * useTasks — Custom hook for task CRUD operations.
 *
 * Fetches tasks on mount and provides functions to add, update, and delete.
 * Tasks are always returned sorted by priority_score (the server handles sorting).
 *
 * Usage:
 *   const { tasks, loading, error, addTask, refetch } = useTasks();
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch all tasks from the server (sorted by priority). */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Task[]>('/tasks');
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tasks on mount
  useEffect(() => {
    let isMounted = true;
    const loadTasks = async () => {
      try {
        const data = await apiGet<Task[]>('/tasks');
        if (isMounted) {
          setTasks(data);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Fetch error');
          setLoading(false);
        }
        console.error("Fetch error", error);
      }
    };
    loadTasks();
    return () => { isMounted = false; };
  }, []);

  /** Add a new task from raw natural-language input. */
  const addTask = async (rawInput: string): Promise<Task> => {
    const newTask = await apiPost<Task>('/tasks', { raw_input: rawInput });
    // Re-fetch all tasks to get updated rankings
    await fetchTasks();
    return newTask;
  };

  /** Update a task (e.g., change status). */
  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    const updated = await apiPatch<Task>(`/tasks/${id}`, updates);
    await fetchTasks();
    return updated;
  };

  /** Delete a task. */
  const deleteTask = async (id: string): Promise<void> => {
    await apiDelete(`/tasks/${id}`);
    await fetchTasks();
  };

  return { tasks, loading, error, addTask, updateTask, deleteTask, refetch: fetchTasks };
}
