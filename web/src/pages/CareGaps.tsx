import { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import PageShell from '../components/ui/PageShell';
import EmptyState from '../components/ui/EmptyState';

interface Task {
  id: string; patientName: string; age: number;
  taskTitle: string; category: 'MOTHER_BABY' | 'ONGOING' | 'INFECTION' | 'GENERAL';
  dueDate: string; isOverdue: boolean; completed: boolean; notes: string;
}

const CATEGORY_LABEL: Record<Task['category'], string> = {
  MOTHER_BABY: 'Mother & Baby', ONGOING: 'Ongoing condition',
  INFECTION: 'Infection check', GENERAL: 'General',
};
const CATEGORY_COLOR: Record<Task['category'], string> = {
  MOTHER_BABY: 'bg-pink-100 text-pink-700',
  ONGOING:     'bg-amber-100 text-amber-700',
  INFECTION:   'bg-blue-100 text-blue-700',
  GENERAL:     'bg-gray-100 text-gray-600',
};

const INITIAL_TASKS: Task[] = [
  { id: '1', patientName: 'Pooja Sharma',     age: 26, taskTitle: 'Check blood pressure at home visit', category: 'MOTHER_BABY', dueDate: 'Today',     isOverdue: false, completed: false, notes: 'History of high BP in pregnancy · Instructions from Dr. Sharma' },
  { id: '2', patientName: 'Ramesh Kumar',     age: 58, taskTitle: 'Confirm diabetes medicine was taken', category: 'ONGOING',  dueDate: '2 days ago', isOverdue: true,  completed: false, notes: 'Check if Metformin is available at sub-center'              },
  { id: '3', patientName: 'Sita Devi',        age: 42, taskTitle: 'Blood pressure follow-up',           category: 'ONGOING',  dueDate: 'Today',     isOverdue: false, completed: true,  notes: 'BP: 128/84 · Medicine confirmed'                          },
  { id: '4', patientName: 'Aarav Patel',      age: 1,  taskTitle: 'Vaccination check — Pentavalent 3', category: 'INFECTION', dueDate: 'Tomorrow',  isOverdue: false, completed: false, notes: 'Immunization drive at Mokama HWC'                          },
  { id: '5', patientName: 'Meena Kumari',     age: 34, taskTitle: 'Post-discharge check-in',           category: 'GENERAL',  dueDate: 'Today',     isOverdue: false, completed: true,  notes: 'Returned from Mokama CHC after treatment'                  },
];

type Filter = 'ALL' | 'PENDING' | 'OVERDUE' | 'DONE';

export default function CareGaps() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [tasks, setTasks]   = useState<Task[]>(INITIAL_TASKS);

  const toggle = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const pending   = tasks.filter(t => !t.completed);
  const overdue   = tasks.filter(t => t.isOverdue && !t.completed);
  const done      = tasks.filter(t => t.completed);
  const pct       = Math.round((done.length / tasks.length) * 100);

  const visible = tasks.filter(t => {
    if (filter === 'PENDING') return !t.completed;
    if (filter === 'OVERDUE') return t.isOverdue && !t.completed;
    if (filter === 'DONE')    return t.completed;
    return true;
  });

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: 'ALL',     label: 'All',     count: tasks.length   },
    { key: 'PENDING', label: 'To do',   count: pending.length },
    { key: 'OVERDUE', label: 'Overdue', count: overdue.length },
    { key: 'DONE',    label: 'Done',    count: done.length    },
  ];

  return (
    <PageShell
      title="Today's Follow-ups"
      subtitle={`${pending.length} tasks remaining · ${pct}% of today's work done`}
    >
      <div className="space-y-5">
        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-semibold text-gray-900">{done.length} of {tasks.length} complete</span>
            <span className="text-gray-400 text-xs">{pct}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1e6641] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          {pct === 100 && (
            <div className="flex items-center gap-1.5 text-[#1e6641] text-sm font-medium mt-2">
              <CheckCircle2 size={15} /> All caught up for today!
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === f.key
                  ? f.key === 'OVERDUE'
                    ? 'bg-red-600 text-white'
                    : 'bg-[#1e6641] text-white'
                  : f.key === 'OVERDUE' && overdue.length > 0
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label} {f.count > 0 && <span className="ml-1 opacity-70">{f.count}</span>}
            </button>
          ))}
        </div>

        {/* Task list */}
        {visible.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Nothing here" description="All clear — no tasks match this filter." />
        ) : (
          <div className="space-y-2">
            {visible.map(task => (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border transition-all p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                  task.completed ? 'border-gray-100 opacity-60'
                  : task.isOverdue ? 'border-red-200'
                  : 'border-gray-100 hover:border-[#1e6641]/30'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Status icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    task.completed ? 'bg-[#e4efe7] text-[#1e6641]'
                    : task.isOverdue ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                    {task.completed
                      ? <CheckCircle2 size={18} />
                      : task.isOverdue ? <AlertTriangle size={18} />
                      : <Clock size={18} />
                    }
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.taskTitle}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLOR[task.category]}`}>
                        {CATEGORY_LABEL[task.category]}
                      </span>
                      {task.isOverdue && !task.completed && (
                        <span className="text-[11px] font-semibold text-red-600">{task.dueDate}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium text-gray-800">{task.patientName}</span>
                      {task.age < 2 ? ' (Infant)' : `, ${task.age} yrs`}
                    </div>
                    {task.notes && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{task.notes}</div>
                    )}
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs text-gray-500">{task.completed ? 'Done' : 'Mark done'}</span>
                  <button
                    onClick={() => toggle(task.id)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${task.completed ? 'bg-[#1e6641]' : 'bg-gray-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${task.completed ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
