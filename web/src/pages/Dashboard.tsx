import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import PageShell from '../components/ui/PageShell';
import StatusBadge from '../components/ui/StatusBadge';
import { SkeletonList } from '../components/ui/SkeletonLoader';
import { Clock, Users, ChevronRight, Building2, Stethoscope, ArrowRight } from 'lucide-react';

const SEED_PATIENTS = [
  { initials: 'PS', name: 'Pooja Sharma',  detail: 'High blood pressure · Referred by Sunita Patil', urgency: 'URGENT'   },
  { initials: 'AG', name: 'Aniket Gaikwad', detail: 'Acute dehydration · Khandala PHC referral',  urgency: 'URGENT'    },
  { initials: 'RK', name: 'Ramesh Kulkarni', detail: 'Routine check-up · Stable vitals',          urgency: 'ROUTINE'   },
];

const URGENCY_AVATAR: Record<string, string> = {
  URGENT:   'bg-red-100 text-red-700',
  PRIORITY: 'bg-amber-100 text-amber-700',
  ROUTINE:  'bg-[#e4efe7] text-[#1e6641]',
};

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('ayusync_user') || '{}');
  const [metrics, setMetrics] = useState({ patientsInQueue: '4', pendingReferrals: '3' });
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user.name || 'Dr. Rajesh Deshmukh';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => {
        const d = r.data || {};
        setMetrics({
          patientsInQueue:  String(d.actual?.patientsInQueue ?? d.patientsInQueue ?? 4),
          pendingReferrals: String(d.actual?.pendingReferrals ?? d.pendingReferrals ?? 3),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell
      title={`${greeting}, ${name}.`}
      subtitle={`Baramati CHC, Pune District · ${today}`}
      action={
        <Link
          to="/queue"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e6641] hover:bg-[#165032] text-white text-sm font-semibold transition-colors"
        >
          <Stethoscope size={15} />
          Open consultation queue
        </Link>
      }
    >
      <div className="space-y-5">
        {/* ── Two key numbers ── */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/queue" className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#1e6641]/30 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Waiting right now</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? <span className="skeleton inline-block h-8 w-12 rounded" /> : metrics.patientsInQueue}
                </div>
                <div className="text-sm text-gray-500 mt-1">patients in queue</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-[#1e6641] group-hover:gap-2 transition-all">
              View queue <ArrowRight size={13} />
            </div>
          </Link>

          <Link to="/patients" className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#1e6641]/30 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Incoming referrals</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? <span className="skeleton inline-block h-8 w-12 rounded" /> : metrics.pendingReferrals}
                </div>
                <div className="text-sm text-gray-500 mt-1">from health workers</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#e4efe7] text-[#1e6641] flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-[#1e6641] group-hover:gap-2 transition-all">
              Review patients <ArrowRight size={13} />
            </div>
          </Link>
        </div>

        {/* ── Patients needing attention ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="text-sm font-semibold text-gray-900">Patients needing attention</div>
            <Link to="/queue" className="text-xs font-semibold text-[#1e6641] hover:underline flex items-center gap-1">
              See all <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <SkeletonList rows={3} />
          ) : (
            <ul className="divide-y divide-gray-50">
              {SEED_PATIENTS.map((p) => (
                <li key={p.name}>
                  <Link to="/queue" className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${URGENCY_AVATAR[p.urgency]}`}>
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                        <StatusBadge status={p.urgency} />
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{p.detail}</div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-[#e4efe7] text-[#1e6641] text-xs font-semibold hover:bg-[#1e6641] hover:text-white transition-colors">
                        Review
                      </span>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Facility quick status ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Building2 size={16} className="text-gray-400" />
              Clinic status
            </div>
            <Link to="/facilities" className="text-xs font-semibold text-[#1e6641] hover:underline flex items-center gap-1">
              Details <ChevronRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Beds available',  value: '18 of 24' },
              { label: 'Oxygen supply',   value: 'Full ✓'   },
              { label: 'Duty doctor',     value: 'Dr. Verma' },
              { label: 'Ambulance',       value: '2 on site' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <div className="text-gray-500">{item.label}</div>
                <div className="font-semibold text-gray-900 mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
