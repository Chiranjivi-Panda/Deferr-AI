/**
 * Dashboard — The main screen showing all tasks sorted by priority.
 *
 * This is the "command center" view where users see what needs attention.
 * Tasks are displayed as glassmorphism cards with staggered entrance
 * animations. Includes loading, empty, and error states.
 */

import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/TaskCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { DeepWorkOverlay } from '../components/DeepWorkOverlay';
import { MatrixView } from '../components/MatrixView';
import { apiGet, apiPost } from '../lib/api';
import { useState, useEffect } from 'react';

export function Dashboard() {
  const { tasks, loading, error, refetch } = useTasks();

  const [dnaPatterns, setDnaPatterns] = useState<{name: string, description: string, preemptive_action: string}[]>([]);
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string>('');
  const [rebalancing, setRebalancing] = useState(false);
  const [archivePage, setArchivePage] = useState(1);
  const [impact] = useState({ minutesSaved: 150, tasksDeconstructed: 1, deadlinesProtected: 2 });
  const [urgencyState, setUrgencyState] = useState<'nominal' | 'alert' | 'critical'>('nominal');
  const [urgencyOverride, setUrgencyOverride] = useState<'auto' | 'nominal' | 'alert' | 'critical'>('auto');
  const [mostUrgentTaskId, setMostUrgentTaskId] = useState<string | null>(null);
  const [isAutoTriaging, setIsAutoTriaging] = useState(false);
  const [triaged, setTriaged] = useState(false);
  const [toast, setToast] = useState('');
  const [mirrorProjection, setMirrorProjection] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);
  const [chronotype, setChronotype] = useState<string>('');
  const [sayNoAudit, setSayNoAudit] = useState<string>('');

  useEffect(() => {
    const handleOverride = (e: CustomEvent) => setUrgencyOverride(e.detail);
    const handleMatrix = (e: CustomEvent) => setShowMatrix(e.detail);
    window.addEventListener('urgency-override', handleOverride as EventListener);
    window.addEventListener('matrix-toggle', handleMatrix as EventListener);
    return () => {
      window.removeEventListener('urgency-override', handleOverride as EventListener);
      window.removeEventListener('matrix-toggle', handleMatrix as EventListener);
    };
  }, []);

  useEffect(() => {
    const checkUrgency = () => {
      if (urgencyOverride !== 'auto') {
        setUrgencyState(urgencyOverride);
        // During manual override, we don't strictly need a mostUrgentTaskId, 
        // but keeping existing logic intact keeps it stable.
        return;
      }
      
      const incompleteTasks = tasks.filter(t => t.status !== 'completed');
      if (incompleteTasks.length === 0) {
        setUrgencyState('nominal');
        setMostUrgentTaskId(null);
        return;
      }
      
      const now = new Date().getTime();
      let minHours = Infinity;
      let urgentId: string | null = null;
      
      incompleteTasks.forEach(task => {
        const d = new Date(task.deadline).getTime();
        if (isNaN(d)) return;
        const hours = (d - now) / (1000 * 60 * 60);
        if (hours < minHours) {
          minHours = hours;
          urgentId = task.id;
        }
      });
      
      setMostUrgentTaskId(urgentId);

      if (minHours < 1) {
        setUrgencyState('critical');
      } else if (minHours < 4) {
        setUrgencyState('alert');
      } else {
        setUrgencyState('nominal');
      }
    };
    
    checkUrgency();
    const interval = setInterval(checkUrgency, 60000);
    return () => clearInterval(interval);
  }, [tasks, urgencyOverride]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setToast('Demo Environment Initialized. Built by the Fantastic Four.');
        
        try {
          const { apiPost, apiDelete } = await import('../lib/api');
          for (const task of tasks) {
            await apiDelete(`/tasks/${task.id}`);
          }
          const demoTasks = [
            "Train ViG-HTNet model for brain tumor detection",
            "Complete AlgoZenith DP module",
            "Submit RGIPT CSE IDD Project Proposal",
            "Prepare for takeUforward mock interview"
          ];
          for (const t of demoTasks) {
            await apiPost('/tasks', { raw_input: t });
          }
          refetch();
        } catch(err) { console.error(err); }
        
        setTimeout(() => setToast(''), 4000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tasks, refetch]);

  useEffect(() => {
    import('../lib/api').then(({ apiGet }) => {
      apiGet<{patterns: {name: string, description: string, preemptive_action: string}[]}>('/insights/dna')
        .then(res => setDnaPatterns(res.patterns || []))
        .catch(err => console.error(err));
        
      apiGet<{message: string | null}>('/insights/fingerprint')
        .then(res => {
          if (res.message) setFingerprint(res.message);
        })
        
      apiGet<{message: string}>('/insights/chronotype')
        .then(res => setChronotype(res.message))
        .catch(err => console.error(err));
        
      import('../lib/api').then(({ apiPost }) => {
        apiPost<{message: string}>('/insights/mirror')
          .then(res => setMirrorProjection(res.message))
          .catch(err => console.error(err));
      });
    });
  }, []);

  const handleRebalance = async () => {
    setRebalancing(true);
    try {
      const { apiPost } = await import('../lib/api');
      await apiPost('/tasks/rebalance');
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to rebalance.');
    } finally {
      setRebalancing(false);
    }
  };

  const totalPendingEffort = tasks
    .filter(t => t.status !== 'completed')
    .reduce((sum, t) => sum + t.estimated_effort_minutes, 0);
  const timeDebtScore = Math.round((totalPendingEffort / (480 * 7)) * 100);

  const handleCalendarExport = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Life Saver OS//EN\n";
    
    tasks.filter(t => t.status !== 'completed').forEach(task => {
      const start = new Date(task.deadline);
      if (isNaN(start.getTime())) return;
      
      const end = new Date(start.getTime() + (task.estimated_effort_minutes * 60000));
      
      const formatIcsDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:${task.id}\n`;
      icsContent += `DTSTAMP:${formatIcsDate(new Date())}\n`;
      icsContent += `DTSTART:${formatIcsDate(start)}\n`;
      icsContent += `DTEND:${formatIcsDate(end)}\n`;
      icsContent += `SUMMARY:${task.title}\n`;
      icsContent += `DESCRIPTION:Effort: ${task.estimated_effort_minutes} mins\\nPriority Score: ${task.priority_score}\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lifesaver-schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAutoTriage = () => {
    setIsAutoTriaging(true);
    setTimeout(() => {
      setTriaged(!triaged);
      setIsAutoTriaging(false);
    }, 2000);
  };

  // Grouping logic
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayTasks: import('../types').Task[] = [];
  const yesterdayTasks: import('../types').Task[] = [];
  const dayBeforeTasks: import('../types').Task[] = [];
  const archiveTasks: import('../types').Task[] = [];
  const overdueTasks: import('../types').Task[] = [];

  tasks.forEach(task => {
    if (task.status === 'completed') return;

    const d = new Date(task.deadline);
    // Safe check for invalid dates
    if (isNaN(d.getTime())) return;

    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((startOfToday.getTime() - dStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Also add to vault if overdue
    if (d.getTime() < now.getTime()) {
      overdueTasks.push(task);
    }

    if (triaged && task.priority_score < 40) {
      archiveTasks.push(task);
      return;
    }
    
    if (triaged && task.priority_score > 60) {
      todayTasks.push(task);
      return;
    }

    if (diffDays <= 0) {
      todayTasks.push(task);
    } else if (diffDays === 1) {
      yesterdayTasks.push(task);
    } else if (diffDays === 2) {
      dayBeforeTasks.push(task);
    } else {
      archiveTasks.push(task);
    }
  });

  if (triaged) {
    todayTasks.sort((a, b) => b.priority_score - a.priority_score);
  }

  // Today Progress
  const todayTotal = tasks.filter(t => {
    const d = new Date(t.deadline);
    if (isNaN(d.getTime())) return false;
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((startOfToday.getTime() - dStart.getTime()) / (1000 * 60 * 60 * 24)) <= 0;
  });
  const todayCompleted = todayTotal.filter(t => t.status === 'completed').length;
  const progressPerc = todayTotal.length > 0 ? Math.round((todayCompleted / todayTotal.length) * 100) : 100;
  const progressMsg = progressPerc >= 100 ? "You've conquered the day!" : `${progressPerc}% of your day is conquered. Keep the momentum!`;

  // Pagination for Archive (2 days per page basically, but we can just paginate items or days)
  // Let's paginate by item chunk (e.g. 5 tasks per page) for simplicity of layout
  const archiveItemsPerPage = 5;
  const paginatedArchive = archiveTasks.slice((archivePage - 1) * archiveItemsPerPage, archivePage * archiveItemsPerPage);
  const totalArchivePages = Math.ceil(archiveTasks.length / archiveItemsPerPage);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const cohortAverage = Math.floor(completedCount * 1.2) + 2;
  const isLeading = completedCount >= cohortAverage;

  const incompleteTasks = tasks.filter(t => t.status !== 'completed');
  const highImpactTime = incompleteTasks.filter(t => t.priority_score > 60).reduce((acc, t) => acc + t.estimated_effort_minutes, 0);
  const lowImpactTime = incompleteTasks.filter(t => t.priority_score <= 60).reduce((acc, t) => acc + t.estimated_effort_minutes, 0);
  const totalImpactTime = highImpactTime + lowImpactTime;
  const highImpactPercent = totalImpactTime > 0 ? (highImpactTime / totalImpactTime) * 100 : 0;

  useEffect(() => {
    if (lowImpactTime > highImpactTime && lowImpactTime > 0) {
      import('../lib/api').then(({ apiPost }) => {
        apiPost<{message: string}>('/insights/say-no', { highImpactTime, lowImpactTime })
          .then(res => setSayNoAudit(res.message))
          .catch(err => console.error(err));
      });
    } else {
      setSayNoAudit('');
    }
  }, [highImpactTime, lowImpactTime]);

  return (
    <div data-urgency={urgencyState} className="min-h-[calc(100vh-80px)] transition-colors duration-500 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-indigo-900/90 text-indigo-200 border border-indigo-500/50 rounded-full text-sm font-medium shadow-2xl backdrop-blur-md"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Impact Ledger ─────────────────────────────────────────── */}
      <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-sm font-medium text-slate-300">
        ⚡ AI Impact Session: Reclaimed {(impact.minutesSaved / 60).toFixed(1)}h · {impact.deadlinesProtected} deadlines protected
      </div>

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Mission Control
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {tasks.length > 0
              ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''} prioritized by urgency and importance`
              : 'Your AI-prioritized task overview'}
          </p>
          <div className="px-3 py-1 bg-red-900/30 text-red-400 text-sm rounded-full border border-red-500/50 inline-block mt-2">Time Debt: {timeDebtScore}%</div>
          
          {/* ── Cohort Benchmark ─────────────────────────────────────────── */}
          <div className="mt-4 w-64">
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1 uppercase tracking-widest">
              <span>RGIPT CSE Cohort Benchmark</span>
              <span>{completedCount} vs {cohortAverage}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-slate-500/50 rounded-full" 
                style={{ width: `${Math.min(100, (cohortAverage / Math.max(completedCount, cohortAverage)) * 100)}%` }} 
              />
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${isLeading ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} 
                style={{ width: `${Math.min(100, (completedCount / Math.max(completedCount, cohortAverage)) * 100)}%` }} 
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAutoTriage}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 ${
              isAutoTriaging 
                ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                : triaged
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            {isAutoTriaging ? 'Triaging...' : '🤖 Auto-Triage'}
          </button>
          <button 
            onClick={handleCalendarExport}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600/50 rounded-xl text-sm font-medium transition-colors"
          >
            📅 Sync to Calendar
          </button>
        </div>
      </div>

      {/* ── Pending Vault ────────────────────────────────────────── */}
      <div className="mb-8 p-4 rounded-xl bg-red-950/20 border border-red-500/30 h-[180px] overflow-y-auto custom-scrollbar w-full break-words">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-widest">Pending Tasks Vault</h2>
          <button 
            onClick={handleRebalance}
            disabled={rebalancing}
            className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-xs font-medium hover:bg-red-500/30 transition-colors"
          >
            {rebalancing ? 'Rebalancing...' : '⚡ Rebalance Schedule'}
          </button>
        </div>
        <div className="space-y-3 pr-2">
          {overdueTasks.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No pending tasks outstanding.</p>
          ) : (
            overdueTasks.map((t, i) => (
              <TaskCard key={t.id} task={t} rank={i + 1} onRefresh={refetch} isMostUrgent={t.id === mostUrgentTaskId} />
            ))
          )}
        </div>
      </div>

      {/* ── Your Patterns (DNA) ────────────────────────────────────────── */}
      {dnaPatterns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🧬</span> Your Patterns (DNA)
          </h2>
          <div className="flex flex-wrap gap-3">
            {dnaPatterns.map(pattern => (
              <div 
                key={pattern.name} 
                className="glass hoverable relative cursor-pointer group flex-1 min-w-[250px]"
                onClick={() => setExpandedPattern(expandedPattern === pattern.name ? null : pattern.name)}
              >
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-indigo-300">{pattern.name}</span>
                  <span className="text-xs text-slate-500">{expandedPattern === pattern.name ? '−' : '+'}</span>
                </div>
                <AnimatePresence>
                  {expandedPattern === pattern.name && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-3 pt-1 border-t border-white/5 overflow-hidden"
                    >
                      <p className="text-xs text-slate-400 mb-2 mt-2">{pattern.description}</p>
                      <div className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">
                        Action: {pattern.preemptive_action}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chronotype Insight Engine ────────────────────────────────────────── */}
      {chronotype && (
        <div className="mb-8 p-4 rounded-xl glass border-t border-white/10">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span>⏱️</span> Productivity Chronotype
          </h2>
          <p className="text-slate-200 text-sm italic">"{chronotype}"</p>
        </div>
      )}

      {/* ── Say No Audit (Effort vs Impact) ─────────────────────────────────── */}
      {totalImpactTime > 0 && (
        <div className="mb-8 p-4 rounded-xl glass border-t border-white/10">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>⚖️</span> Effort vs. Impact Audit
          </h2>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex mb-2">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${highImpactPercent}%` }} />
            <div className="bg-slate-500 h-full transition-all duration-500" style={{ width: `${100 - highImpactPercent}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-3">
            <span>High Impact ({highImpactTime}m)</span>
            <span>Low Impact ({lowImpactTime}m)</span>
          </div>
          {sayNoAudit && (
            <div className="text-amber-400 text-sm italic font-medium">"{sayNoAudit}"</div>
          )}
        </div>
      )}

      {/* ── Procrastination Fingerprint ────────────────────────────────────────── */}
      {fingerprint && (
        <div className="mb-8 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🧠</span>
            <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Behavioral Insight</h2>
          </div>
          <p className="text-sm text-slate-300 italic">{fingerprint}</p>
        </div>
      )}

      {/* ── Temporal Mirror ────────────────────────────────────────── */}
      {mirrorProjection && (
        <div className="mb-8 p-4 rounded-xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔮</span>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">48-Hour Projection</h2>
          </div>
          <p className="text-sm text-slate-400 italic leading-relaxed">"{mirrorProjection}"</p>
        </div>
      )}

      {/* ── Content area with loading/empty/error states ──────── */}
      {loading ? (
        <LoadingSpinner message="Loading your tasks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : tasks.filter(t => t.status !== 'completed').length === 0 ? (
        <EmptyState
          icon="📋"
          title="No tasks yet"
          description="Add your first deadline to see the AI prioritize and take action for you."
        />
      ) : (
      <div className="w-full max-w-5xl mx-auto space-y-8 px-4 sm:px-6">
        {/* ── Tasks Area ────────────────────────────────────────────────── */}
          
          {showMatrix ? (
            <section className={`transition-opacity duration-1000 ${isAutoTriaging ? 'opacity-20' : 'opacity-100'}`}>
              <h2 className="text-lg font-semibold text-white tracking-tight mb-4 flex items-center justify-between">
                EISENHOWER MATRIX
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">Active</span>
              </h2>
              <MatrixView tasks={incompleteTasks} />
            </section>
          ) : (
            <>
              <section className={`transition-opacity duration-1000 ${isAutoTriaging ? 'opacity-20' : 'opacity-100'}`}>
                <h2 className="text-lg font-semibold text-white tracking-tight mb-4">TODAY</h2>
                <div className="space-y-4">
                  <AnimatePresence>
                    {todayTasks.length === 0 && <div className="text-slate-500 text-sm italic">No tasks due today.</div>}
                    {todayTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} rank={index + 1} delay={index * 0.05} onRefresh={refetch} isMostUrgent={task.id === mostUrgentTaskId} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>

              {yesterdayTasks.length > 0 && (
                <section className={`transition-opacity duration-1000 ${isAutoTriaging ? 'opacity-20' : 'opacity-100'}`}>
                  <h2 className="text-lg font-semibold text-white tracking-tight mb-4">YESTERDAY</h2>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {yesterdayTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} rank={index + 1} delay={index * 0.05} onRefresh={refetch} isMostUrgent={task.id === mostUrgentTaskId} />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {dayBeforeTasks.length > 0 && (
                <section className={`transition-opacity duration-1000 ${isAutoTriaging ? 'opacity-20' : 'opacity-100'}`}>
                  <h2 className="text-lg font-semibold text-white tracking-tight mb-4">DAY BEFORE YESTERDAY</h2>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {dayBeforeTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} rank={index + 1} delay={index * 0.05} onRefresh={refetch} isMostUrgent={task.id === mostUrgentTaskId} />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}
            </>
          )}

          {archiveTasks.length > 0 && (
            <section className={`transition-opacity duration-1000 ${isAutoTriaging ? 'opacity-20' : 'opacity-100'}`}>
              <h2 className="text-lg font-semibold text-white tracking-tight mb-4">ARCHIVE</h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {paginatedArchive.map((task, index) => (
                    <TaskCard key={task.id} task={task} rank={index + 1} delay={index * 0.05} onRefresh={refetch} isMostUrgent={task.id === mostUrgentTaskId} />
                  ))}
                </AnimatePresence>
              </div>
              
              {totalArchivePages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button 
                    disabled={archivePage === 1}
                    onClick={() => setArchivePage(p => p - 1)}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded text-slate-400 text-xs hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500 py-1">Page {archivePage} of {totalArchivePages}</span>
                  <button 
                    disabled={archivePage === totalArchivePages}
                    onClick={() => setArchivePage(p => p + 1)}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded text-slate-400 text-xs hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          )}

        </div>
      )}
    </div>
  );
}
