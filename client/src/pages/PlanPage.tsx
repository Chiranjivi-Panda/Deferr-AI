import { motion } from 'framer-motion';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/TaskCard';

export function PlanPage() {
  const { tasks, refetch } = useTasks();

  const now = new Date();
  // Set to end of today for easy comparison
  now.setHours(23, 59, 59, 999);

  const upcomingTasks = tasks.filter(t => {
    const d = new Date(t.deadline);
    return d.getTime() > now.getTime() && t.status !== 'completed';
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Plan Upcoming</h1>
          <p className="text-sm text-slate-400 mt-1">Your future tasks and deadlines</p>
        </div>
      </div>

      <div className="space-y-4">
        {upcomingTasks.length === 0 ? (
          <div className="text-slate-400 text-center py-12">No upcoming tasks.</div>
        ) : (
          upcomingTasks.map((task, index) => (
            <TaskCard key={task.id} task={task} rank={index + 1} delay={index * 0.05} onRefresh={refetch} />
          ))
        )}
      </div>
    </div>
  );
}
