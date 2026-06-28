/**
 * App — Root component with routing.
 *
 * Routes:
 *   /     → Dashboard (prioritized task list)
 *   /add  → Add Task (natural language input)
 *
 * The Layout component wraps all pages with the navigation bar
 * and aurora animated background.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddTask } from './pages/AddTask';
import { CalendarView } from './pages/CalendarView';
import { PlanPage } from './pages/PlanPage';

function App() {
  useEffect(() => {
    document.title = 'Deferr AI';
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddTask />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/plan" element={<PlanPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
