import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent, Proposal } from '../types';
import { apiGet, apiPost } from '../lib/api';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<CalendarEvent[]>('/calendar/events');
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const proposeReschedule = async (taskId: string) => {
    return apiPost<{ atRisk: boolean; proposal: Proposal | null }>(`/tasks/${taskId}/propose`);
  };

  const applyProposal = async (taskId: string, proposal: Proposal) => {
    const updatedTask = await apiPost(`/tasks/${taskId}/apply`, { proposal });
    await fetchEvents(); // Refetch calendar to see the moved event
    return updatedTask;
  };

  return { events, loading, error, proposeReschedule, applyProposal, refetch: fetchEvents };
}
