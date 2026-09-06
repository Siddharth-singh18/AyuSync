import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import PageShell from '../components/ui/PageShell';
import InlineError from '../components/ui/InlineError';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/SkeletonLoader';
import { Button } from '../components/ui/Button';
import { Search, Users, ChevronRight, X, Plus } from 'lucide-react';

const INPUT = 'w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[#1e6641] focus:outline-none bg-white';
const LABEL = 'block text-xs font-semibold text-gray-700 mb-1';

export default function Patients() {
  const [search,      setSearch]      = useState('');
  const [patients,    setPatients]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [regLoading,  setRegLoading]  = useState(false);
  const [form, setForm] = useState({ name: '', gender: '', age: '', phone: '', village: '', abhaId: '' });

  const fetchPatients = async (q = search) => {
    try { setLoading(true); setError('');
      const r = await api.get(`/patients/search?q=${q}`);
      setPatients(r.data);
    } catch { setError('Could not load patients. Make sure the server is running.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPatients(''); }, []);

  const handleRegister = async () => {
    if (!form.name || !form.gender) { setError('Name and gender are required.'); return; }
    setRegLoading(true);
    try {
      await api.post('/patients', { ...form, age: form.age ? parseInt(form.age) : undefined });
      setShowForm(false); setForm({ name: '', gender: '', age: '', phone: '', village: '', abhaId: '' });
      fetchPatients('');
    } catch (e: any) { setError(e.response?.data?.message || e.response?.data?.error || 'Could not register patient.'); }
    finally { setRegLoading(false); }
  };

  const user = JSON.parse(localStorage.getItem('ayusync_user') || '{}');
  const isWorker = user.role === 'WORKER';

  return (
    <PageShell
      title={isWorker ? 'My Patients' : 'All Patients'}
      subtitle={loading ? '' : `${patients.length} patient${patients.length !== 1 ? 's' : ''} found`}
      action={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-[#1e6641] hover:bg-[#165032] text-white transition-colors">
          <Plus size={14} /> Register patient
        </button>
      }
    >
      <div className="space-y-4">
        <InlineError message={error} onDismiss={() => setError('')} />

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or health ID…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e6641] focus:outline-none bg-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchPatients()}
          />
          {search && (
            <button onClick={() => { setSearch(''); fetchPatients(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Patient list */}
        {loading ? (
          <SkeletonList rows={6} />
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState
              icon={Users}
              title={search ? 'No results found' : 'No patients registered yet'}
              description={search ? `Try a different name or phone number.` : 'Register your first patient to get started.'}
              action={!search ? (
                <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-[#1e6641] text-white hover:bg-[#165032] transition-colors">
                  <Plus size={14} /> Register patient
                </button>
              ) : undefined}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Desktop table header */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>Patient</span>
              <span>Age & gender</span>
              <span>Village</span>
              <span />
            </div>
            <ul className="divide-y divide-gray-50">
              {patients.map(p => (
                <li key={p.id}>
                  <Link
                    to={`/patients/${p.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#e4efe7] text-[#1e6641] flex items-center justify-center font-semibold text-sm shrink-0">
                      {p.name?.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                        <span>{p.age ? `${p.age} yrs` : '--'}</span>
                        <span>·</span>
                        <span>{p.gender || '--'}</span>
                        {(p.village || p.address) && <><span>·</span><span>{p.village || p.address}</span></>}
                        {p.abhaId && <><span>·</span><span className="font-mono text-gray-400 text-[11px]">ID: {p.abhaId.slice(0, 14)}</span></>}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Register modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Register new patient</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={LABEL}>Full name *</label>
                  <input type="text" className={INPUT} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Pooja Sharma" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Gender *</label>
                    <select className={INPUT} value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      <option value="">Select</option>
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Age</label>
                    <input type="number" className={INPUT} value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="28" />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Phone number</label>
                  <input type="text" className={INPUT} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+919876543210" />
                </div>
                <div>
                  <label className={LABEL}>Village / Ward</label>
                  <input type="text" className={INPUT} value={form.village} onChange={e => setForm({...form, village: e.target.value})} placeholder="Mokama Ward 4" />
                </div>
                <div>
                  <label className={LABEL}>ABHA / Health ID <span className="font-normal text-gray-400">(optional)</span></label>
                  <input type="text" className={INPUT} value={form.abhaId} onChange={e => setForm({...form, abhaId: e.target.value})} placeholder="91-8844-3321-0012" />
                </div>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleRegister} disabled={regLoading} className="bg-[#1e6641] hover:bg-[#165032] text-white">
                  {regLoading ? 'Saving…' : 'Save patient'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
