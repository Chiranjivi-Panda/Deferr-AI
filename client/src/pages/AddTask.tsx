/**
 * AddTask — Page for adding a new task via natural language.
 *
 * Wraps the AddTaskForm component and handles navigation back to
 * the dashboard on successful submission.
 */

import { useNavigate } from 'react-router-dom';
import { AddTaskForm } from '../components/AddTaskForm';
import { useTasks } from '../hooks/useTasks';

export function AddTask() {
  const { addTask } = useTasks();
  const navigate = useNavigate();

  const handleSubmit = async (rawInput: string) => {
    await addTask(rawInput);
    navigate('/'); // Go to dashboard to see the new task ranked
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Add Task
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Describe your task naturally — the AI will parse the deadline, category,
          and effort.
        </p>
      </div>

      {/* Task input form */}
      <div className="max-w-2xl">
        <AddTaskForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
