/**
 * Layout — App shell with navigation and aurora background.
 *
 * Wraps all pages with a consistent header, animated page transitions,
 * and the aurora background. Uses react-router-dom for navigation links.
 */

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [urgencyMode, setUrgencyMode] = useState<'auto' | 'nominal' | 'alert' | 'critical'>('auto');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showMatrix, setShowMatrix] = useState(false);

  const handleUrgencyToggle = () => {
    const modes: ('auto' | 'nominal' | 'alert' | 'critical')[] = ['auto', 'nominal', 'alert', 'critical'];
    const nextMode = modes[(modes.indexOf(urgencyMode) + 1) % modes.length];
    setUrgencyMode(nextMode);
    window.dispatchEvent(new CustomEvent('urgency-override', { detail: nextMode }));
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleMatrixToggle = () => {
    const nextState = !showMatrix;
    setShowMatrix(nextState);
    window.dispatchEvent(new CustomEvent('matrix-toggle', { detail: nextState }));
  };

  return (
    <div className="min-h-screen relative">
      {/* Aurora animated background (CSS defined in index.css) */}
      <div className="aurora-bg" />

      {/* ── Navigation bar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#0D0D0F]/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="w-full max-w-5xl mx-auto flex items-center px-4 sm:px-6 lg:px-8 py-3">
          {/* ── Logo Container (Fixed Anchor) ──────────────────────── */}
          <div className="flex items-center gap-3 flex-shrink-0 pr-4 sm:pr-6 border-r border-gray-800/50">
            {/* Logo / App name */}
            <Link to="/" className="flex items-center gap-2.5 group whitespace-nowrap">
              <div className="drop-shadow-[0_0_12px_rgba(99,102,241,0.4)] flex-shrink-0">
                <svg viewBox="0 0 100 100" id="deferr-brand-24cs2013" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="deferr-inline-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5C62EC" />
                      <stop offset="100%" stopColor="#2D2B99" />
                    </linearGradient>
                  </defs>
                  <rect width="100" height="100" rx="28" fill="url(#deferr-inline-grad)" />
                  <path d="M24 50 H42" stroke="#F4F4F5" strokeWidth="7" strokeLinecap="butt" fill="none" />
                  <path d="M49 50 H55" stroke="#F4F4F5" strokeWidth="7" strokeLinecap="butt" fill="none" />
                  <path d="M62 50 H76" stroke="#F4F4F5" strokeWidth="7" strokeLinecap="butt" fill="none" />
                  <path d="M67 39 L76 50 L67 61" stroke="#F4F4F5" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <span className="hidden sm:inline text-xl sm:text-2xl tracking-tight text-transparent bg-clip-text animate-text-shimmer bg-[linear-gradient(to_right,#6366F1,#A855F7,#EC4899,#6366F1,#A855F7)] bg-[length:200%_auto]">
                <span className="font-bold">Deferr</span> <span className="font-medium">AI</span>
              </span>
            </Link>
          </div>

          {/* ── Scrollable Controls Container ──────────────────────── */}
          <div className="flex-1 flex items-center overflow-x-auto hide-scrollbar pl-4 gap-6">
            {/* Nav links */}
            <div className="flex flex-row items-center gap-3">
              <NavLink to="/" label={<><span className="sm:hidden">🏠</span><span className="hidden sm:inline">Dashboard</span></>} active={location.pathname === '/'} />
              <NavLink to="/plan" label={<><span className="sm:hidden">📅</span><span className="hidden sm:inline">Plan Upcoming</span></>} active={location.pathname === '/plan'} />
              <NavLink to="/add" label={<><span className="sm:hidden">➕</span><span className="hidden sm:inline">+ Add Task</span></>} active={location.pathname === '/add'} isAccent />
            </div>

            <div className="hidden lg:block w-px h-6 bg-white/10 mx-2"></div> {/* Divider */}

            {/* ── Right Group (Controls + Sync) ────────────────────────── */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
              <button
                onClick={handleMatrixToggle}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors whitespace-nowrap ${
                  showMatrix 
                    ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="sm:hidden">📊</span><span className="hidden sm:inline">📊 Toggle Matrix</span>
              </button>
              
              <button
                onClick={handleUrgencyToggle}
                className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                <span className="sm:hidden">⚡</span><span className="hidden sm:inline">⚡ Mode: {urgencyMode}</span>
              </button>
              
              <button
                onClick={handleThemeToggle}
                className="w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              
              <button
                onClick={async () => {
                  try {
                    const { apiGet } = await import('../lib/api');
                    const tasks = await apiGet<import('../types').Task[]>('/tasks');
                    const upcoming = tasks.filter(t => t.status !== 'completed');
                    if (upcoming.length === 0) {
                      alert('No upcoming tasks to sync.');
                      return;
                    }
                    
                    const ics = await import('ics');
                    const events: import('ics').EventAttributes[] = upcoming.map(t => {
                      const d = new Date(t.deadline);
                      return {
                        title: t.title,
                        description: `Category: ${t.category}\nScore: ${Math.round(t.priority_score)}`,
                        start: [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()],
                        duration: { minutes: t.estimated_effort_minutes }
                      };
                    });
                    
                    const { error, value } = ics.createEvents(events);
                    if (error || !value) {
                      throw error || new Error('Unknown ICS error');
                    }
                    
                    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'lifesaver-tasks.ics';
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error(err);
                    alert('Failed to generate calendar file.');
                  }
                }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 transition-colors whitespace-nowrap"
              >
                <span className="sm:hidden">📅</span><span className="hidden sm:inline">Sync to Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Page content ──────────────────────────────────────────── */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

// ── Internal nav link component ──────────────────────────────────────────────

function NavLink({
  to,
  label,
  active,
  isAccent,
}: {
  to: string;
  label: React.ReactNode;
  active: boolean;
  isAccent?: boolean;
}) {
  const baseClasses = 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap';

  const activeClasses = isAccent
    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
    : 'bg-white/8 text-white border border-white/10';

  const inactiveClasses = isAccent
    ? 'text-indigo-300 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-400/20'
    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent';

  return (
    <Link to={to} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
      {label}
    </Link>
  );
}
