import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import StatusBadge from '../components/ui/StatusBadge';
import InlineError from '../components/ui/InlineError';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/SkeletonLoader';
import { Clock, RefreshCw, Plus, ChevronRight, X } from 'lucide-react';

const INPUT = 'w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[#1e6641] focus:outline-none bg-white';
const LABEL = 'block text-xs font-semibold text-gray-700 mb-1';

export default function Queue() {
  const [queue,    setQueue]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [patients,   setPatients]   = useState<any[]>([]);
  const [doctors,    setDoctors]    = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selPatient,   setSelPatient]   = useState('');
  const [selDoctor,    setSelDoctor]    = useState('');
  const [selFacility,  setSelFacility]  = useState('');
  const [priority,     setPriority]     = useState('0');
  const [fieldErrors,  setFieldErrors]  = useState<Record<string, string>>({});
  const [modalError,   setModalError]   = useState('');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const r = await api.get('/queue');
      setQueue(r.data);
      setError('');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not load the queue. Try refreshing.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchQueue();
    api.get('/patients/search?q=').then(r => setPatients(r.data)).catch(() => {});
    api.get('/auth/doctors').then(r => setDoctors(r.data)).catch(() => {});
    api.get('/facilities').then(r => setFacilities(r.data.data || r.data || [])).catch(() => {});
  }, []);

  const addToQueue = async () => {
    setModalError('');
    const errors: Record<string, string> = {};
    if (!selPatient) errors.selPatient = 'Please select a patient.';
    if (!selFacility) errors.selFacility = 'Please select a clinic or facility.';
    
    const prioNum = parseInt(priority, 10);
    if (isNaN(prioNum) || prioNum < 0 || prioNum > 10) {
      errors.priority = 'Priority must be a number between 0 and 10.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/queue', {
        patientId: selPatient,
        doctorId: selDoctor || undefined,
        facilityId: selFacility,
        priority: prioNum
      });
      setShowForm(false);
      setSelPatient('');
      setSelDoctor('');
      setSelFacility('');
      setPriority('0');
      setFieldErrors({});
      await fetchQueue();
    } catch (e: any) {
      setModalError(e.response?.data?.error || e.response?.data?.message || 'Could not add patient to queue.');
    } finally { setSubmitting(false); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/queue/${id}/status`, { status: newStatus });
      fetchQueue();
    } catch { setError('Could not update this patient. Please try again.'); }
  };

  const waiting       = queue.filter(e => e.status === 'WAITING').length;
  const inConsult     = queue.filter(e => e.status === 'IN_CONSULTATION').length;

  return (
    <PageShell
      title="Patients Waiting"
      subtitle={queue.length > 0 ? `${waiting} waiting · ${inConsult} in consultation` : 'No patients in queue right now'}
      action={
        <div className="flex gap-2">
          <button onClick={fetchQueue} className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-[#1e6641] hover:bg-[#165032] text-white transition-colors">
            <Plus size={14} /> Add patient
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <InlineError message={error} onDismiss={() => setError('')} />

        {loading ? (
          <SkeletonList rows={5} />
        ) : queue.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState
              icon={Clock}
              title="No patients waiting"
              description="Referrals from health workers will appear here in real time."
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span className="hidden sm:block">#</span>
              <span>Patient</span>
              <span className="hidden sm:block">Priority</span>
              <span>Status</span>
              <span />
            </div>
            <ul className="divide-y divide-gray-50">
              {queue.map((entry, idx) => (
                <li key={entry.id} className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <span className="hidden sm:block text-sm font-semibold text-gray-400">{idx + 1}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#e4efe7] text-[#1e6641] flex items-center justify-center font-semibold text-sm shrink-0">
                      {(entry.appointment?.patient?.name || 'P').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{entry.appointment?.patient?.name || 'Unknown patient'}</div>
                      <div className="text-xs text-gray-400">
                        Arrived {new Date(entry.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    {entry.priority > 0
                      ? <StatusBadge status="URGENT" />
                      : <span className="text-xs text-gray-400">Routine</span>
                    }
                  </div>
                  <StatusBadge status={entry.status} />
                  <div className="flex items-center gap-2">
                    {entry.appointment?.patient?.id && (
                      <Link to={`/patients/${entry.appointment.patient.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-[#1e6641] hover:bg-[#e4efe7] transition-colors">
                        <ChevronRight size={16} />
                      </Link>
                    )}
                    {entry.status === 'WAITING' && (
                      <button onClick={() => updateStatus(entry.id, 'IN_CONSULTATION')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1e6641] hover:bg-[#165032] text-white transition-colors whitespace-nowrap">
                        Start
                      </button>
                    )}
                    {entry.status === 'IN_CONSULTATION' && (
                      <button onClick={() => updateStatus(entry.id, 'COMPLETED')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors whitespace-nowrap">
                        Complete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add to queue modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Add patient to today's queue</h3>
                <button onClick={() => { setShowForm(false); setFieldErrors({}); setModalError(''); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                    {modalError}
                  </div>
                )}
                <div>
                  <label className={LABEL}>Patient *</label>
                  <select
                    className={`${INPUT} ${fieldErrors.selPatient ? 'border-red-400 focus:ring-red-400' : ''}`}
                    value={selPatient}
                    onChange={e => {
                      setSelPatient(e.target.value);
                      if (fieldErrors.selPatient) setFieldErrors(prev => ({ ...prev, selPatient: '' }));
                    }}
                  >
                    <option value="">Select patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {fieldErrors.selPatient && <p className="text-xs text-red-500 mt-1">{fieldErrors.selPatient}</p>}
                </div>
                <div>
                  <label className={LABEL}>Clinic *</label>
                  <select
                    className={`${INPUT} ${fieldErrors.selFacility ? 'border-red-400 focus:ring-red-400' : ''}`}
                    value={selFacility}
                    onChange={e => {
                      setSelFacility(e.target.value);
                      if (fieldErrors.selFacility) setFieldErrors(prev => ({ ...prev, selFacility: '' }));
                    }}
                  >
                    <option value="">Select clinic</option>
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  {fieldErrors.selFacility && <p className="text-xs text-red-500 mt-1">{fieldErrors.selFacility}</p>}
                </div>
                <div>
                  <label className={LABEL}>Doctor <span className="font-normal text-gray-400">(optional)</span></label>
                  <select className={INPUT} value={selDoctor} onChange={e => setSelDoctor(e.target.value)}>
                    <option value="">Any available</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.name || `Doctor ${d.id.slice(0,6)}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Urgency</label>
                  <select
                    className={`${INPUT} ${fieldErrors.priority ? 'border-red-400 focus:ring-red-400' : ''}`}
                    value={priority}
                    onChange={e => {
                      setPriority(e.target.value);
                      if (fieldErrors.priority) setFieldErrors(prev => ({ ...prev, priority: '' }));
                    }}
                  >
                    <option value="0">Routine</option>
                    <option value="1">Urgent</option>
                  </select>
                  {fieldErrors.priority && <p className="text-xs text-red-500 mt-1">{fieldErrors.priority}</p>}
                </div>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowForm(false); setFieldErrors({}); setModalError(''); }}>Cancel</Button>
                <Button onClick={addToQueue} disabled={submitting} className="bg-[#1e6641] hover:bg-[#165032] text-white">
                  {submitting ? 'Adding…' : 'Add to queue'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
