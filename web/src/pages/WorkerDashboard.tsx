import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import PageShell from '../components/ui/PageShell';
import { SkeletonList } from '../components/ui/SkeletonLoader';
import InlineError from '../components/ui/InlineError';
import EmptyState from '../components/ui/EmptyState';
import {
  UserPlus, CheckSquare, ChevronRight, AlertTriangle,
  Wifi, WifiOff, RefreshCw, Users, Clock
} from 'lucide-react';

export default function WorkerDashboard() {
  const user = JSON.parse(localStorage.getItem('ayusync_user') || '{}');
  const [syncing, setSyncing]         = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [patients, setPatients]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user.name || 'Sunita Patil';

  useEffect(() => {
    api.get('/patients/search?q=')
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : (r.data.data || []);
        setPatients(list.slice(0, 5));
      })
      .catch(() => setError('Could not load patients. Check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setOfflineCount(0); }, 1200);
  };

  // Derived counts (demo values where API doesn't surface them yet)
  const overdueCount = 1;
  const tasksTotal   = 8;
  const tasksDone    = 5;
  const taskPct      = Math.round((tasksDone / tasksTotal) * 100);

  return (
    <PageShell
      title={`${greeting}, ${name.split(' ')[0]}.`}
      subtitle="Khandala Sub-Center, Pune District · Here's what needs your attention today."
      action={
        <div className="flex items-center gap-2">
          {/* Sync pill */}
          <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600">
            {offlineCount > 0
              ? <><WifiOff size={13} className="text-amber-500" />{offlineCount} pending sync</>
              : <><Wifi size={13} className="text-[#1e6641]" /><span className="text-[#1e6641]">Synced</span></>
            }
          </div>
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1e6641] hover:bg-[#165032] text-white transition-colors disabled:opacity-60"
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync'}
          </button>
        </div>
      }
    >
      <InlineError message={error} onDismiss={() => setError('')} />

      <div className="space-y-5">
        {/* ── Urgent alert (shown only when there's something urgent) ── */}
        {overdueCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-red-800">Pooja Sharma needs a home visit today</div>
                <div className="text-xs text-red-600 mt-0.5">
                  High blood pressure (152/98 mmHg) · Counter-referral from Dr. Sharma received
                </div>
              </div>
            </div>
            <Link
              to="/followups"
              className="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors text-center"
            >
              Record visit
            </Link>
          </div>
        )}

        {/* ── Today's progress + Quick stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Daily checklist progress */}
          <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Today's checklist</div>
                <div className="text-2xl font-bold text-gray-900 mt-0.5">{tasksDone} <span className="text-base font-normal text-gray-400">of {tasksTotal} tasks done</span></div>
              </div>
              <Link to="/followups" className="text-xs font-semibold text-[#1e6641] hover:underline flex items-center gap-1">
                See all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1e6641] rounded-full transition-all duration-500"
                style={{ width: `${taskPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] text-gray-400">
              <span>{taskPct}% complete</span>
              <span>{tasksTotal - tasksDone} remaining</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-3">
            <Link
              to="/intake"
              className="flex items-center gap-3 bg-[#1e6641] hover:bg-[#165032] text-white rounded-2xl p-4 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <UserPlus size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold">Add new patient</div>
                <div className="text-[11px] text-white/70">Record + refer</div>
              </div>
            </Link>
            <Link
              to="/followups"
              className="flex items-center gap-3 bg-white hover:bg-[#e4efe7] border border-gray-100 text-gray-800 rounded-2xl p-4 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#e4efe7] text-[#1e6641] flex items-center justify-center">
                <CheckSquare size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold">Today's follow-ups</div>
                <div className="text-[11px] text-gray-500">{tasksTotal - tasksDone} tasks left</div>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Recent patients ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Users size={16} className="text-gray-400" />
              Recent patients
            </div>
            <Link to="/patients" className="text-xs font-semibold text-[#1e6641] hover:underline flex items-center gap-1">
              See all <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <SkeletonList rows={4} />
          ) : patients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No patients yet"
              description='Tap "New Patient" to register your first community member.'
            />
          ) : (
            <ul className="divide-y divide-gray-50">
              {patients.map((p: any) => (
                <li key={p.id}>
                  <Link
                    to={`/patients/${p.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#e4efe7] text-[#1e6641] flex items-center justify-center font-semibold text-sm shrink-0">
                      {p.name?.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{p.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span>{p.age ? `${p.age} yrs` : '--'}</span>
                        <span>·</span>
                        <span>{p.gender || 'Female'}</span>
                        {p.village && <><span>·</span><span className="truncate">{p.village}</span></>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                        <Clock size={11} />Last seen recently
                      </span>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageShell>
  );
}
