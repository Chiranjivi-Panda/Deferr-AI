import { useCalendar } from '../hooks/useCalendar';
import { CalendarTimeline } from '../components/CalendarTimeline';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';

export function CalendarView() {
  const { events, loading, error, refetch } = useCalendar();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Calendar (Next 48h)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Your schedule and movable blocks the AI can use to make time.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading calendar..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <CalendarTimeline events={events} />
      )}
    </div>
  );
}
