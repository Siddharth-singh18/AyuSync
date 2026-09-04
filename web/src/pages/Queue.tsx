import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function Queue() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [priority, setPriority] = useState('0');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/queue');
      setQueue(res.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Fetch dependencies
    api.get('/patients/search?q=').then(res => setPatients(res.data)).catch(console.error);
    api.get('/auth/doctors').then(res => setDoctors(res.data)).catch(console.error);
    api.get('/facilities').then(res => setFacilities(res.data)).catch(console.error);
  }, []);

  const handleAddPatient = async () => {
    if (!selectedPatient || !selectedFacility) {
      alert('Patient and Facility are required');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/queue', {
        patientId: selectedPatient,
        doctorId: selectedDoctor || undefined,
        facilityId: selectedFacility,
        priority: parseInt(priority)
      });
      setShowForm(false);
      setSelectedPatient('');
      setSelectedDoctor('');
      setSelectedFacility('');
      setPriority('0');
      await fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to add to queue');
    } finally {
      setSubmitLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/queue/${id}/status`, { status: newStatus });
      fetchQueue();
    } catch {
      alert('Failed to update queue status');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Active Queue</h2>
        <div className="flex gap-4">
          <Button variant="outline" onClick={fetchQueue}>Refresh</Button>
          <Button onClick={() => setShowForm(true)}>Add Patient</Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Patient to Queue</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                <select className="w-full border p-2 rounded-md" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id.slice(0,6)})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facility *</label>
                <select className="w-full border p-2 rounded-md" value={selectedFacility} onChange={e => setSelectedFacility(e.target.value)}>
                  <option value="">Select Facility</option>
                  {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor (Optional)</label>
                <select className="w-full border p-2 rounded-md" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
                  <option value="">Any Available</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.phone || 'Doctor'} (ID: {d.id.slice(0,6)})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="w-full border p-2 rounded-md" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="0">Normal</option>
                  <option value="1">High Priority</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleAddPatient} disabled={submitLoading}>{submitLoading ? 'Adding...' : 'Add to Queue'}</Button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

      {loading ? (
        <div className="text-gray-500 animate-pulse">Loading queue...</div>
      ) : queue.length === 0 ? (
        <div className="text-gray-500 bg-gray-50 p-8 rounded-xl text-center border">
          No patients currently in the queue.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Arrival Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {entry.appointment?.patient?.name || 'Unknown Patient'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      entry.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                      entry.status === 'IN_CONSULTATION' ? 'bg-blue-100 text-blue-800' :
                      entry.status === 'PRIORITY' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {entry.priority > 0 ? (
                      <span className="text-red-600 font-semibold">High ({entry.priority})</span>
                    ) : (
                      'Normal'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(entry.arrivalTime).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {entry.appointment?.patient?.id && (
                      <Link to={`/patients/${entry.appointment.patient.id}`}>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </Link>
                    )}
                    {entry.status === 'WAITING' && (
                      <Button size="sm" onClick={() => updateStatus(entry.id, 'IN_CONSULTATION')}>Start</Button>
                    )}
                    {entry.status === 'IN_CONSULTATION' && (
                      <Button size="sm" onClick={() => updateStatus(entry.id, 'COMPLETED')}>Complete</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
