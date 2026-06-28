import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import type { CalendarEvent } from '../types';

interface CalendarTimelineProps {
  events: CalendarEvent[];
}

export function CalendarTimeline({ events }: CalendarTimelineProps) {
  // Simple layout: list events sorted by start time
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {sorted.map((event, index) => {
        const isMovable = event.movable;
        return (
          <motion.div
            key={event.event_id}
            layout="position"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, type: 'spring', bounce: 0.2 }}
          >
            <GlassCard className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between border-l-4 ${isMovable ? 'border-l-indigo-400' : 'border-l-slate-600'}`}>
              <div>
                <h4 className="text-white font-medium">{event.title}</h4>
                <div className="text-sm text-slate-400 mt-1">
                  {formatDate(event.start)} • {formatTime(event.start)} - {formatTime(event.end)}
                </div>
              </div>
              <div className="mt-2 sm:mt-0">
                {isMovable ? (
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">Movable</span>
                ) : (
                  <span className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded border border-white/10">Fixed</span>
                )}
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
      {events.length === 0 && (
        <div className="text-center text-slate-500 py-8">
          No calendar events in the next 48 hours.
        </div>
      )}
    </div>
  );
}
