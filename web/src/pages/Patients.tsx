import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function Patients() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Registration Form State
  const [showRegForm, setShowRegForm] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    gender: '',
    age: '',
    phone: '',
    village: '',
    abhaId: ''
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError('');
      // In a real app we'd pass search params, for now just fetch timeline/list 
      // Note: Backend doesn't have a simple GET /patients list endpoint implemented in the scaffold except /search. 
      // We'll hit /api/patients/search?q=search
      const response = await api.get(`/patients/search?q=${search}`);
      setPatients(response.data);
    } catch (err: any) {
      setError('Failed to fetch patients. Ensure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = () => {
    fetchPatients();
  };

  const handleRegister = async () => {
    if (!regForm.name || !regForm.gender) {
      alert('Name and Gender are required.');
      return;
    }

    setRegLoading(true);
    try {
      const payload = {
        ...regForm,
        age: regForm.age ? parseInt(regForm.age) : undefined
      };
      await api.post('/patients', payload);
      setShowRegForm(false);
      setRegForm({ name: '', gender: '', age: '', phone: '', village: '', abhaId: '' });
      fetchPatients();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to register patient');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Patients</h2>
        <Button onClick={() => setShowRegForm(true)}>Register Patient</Button>
      </div>

      {showRegForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Register New Patient</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" className="w-full border p-2 rounded-md" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select className="w-full border p-2 rounded-md" value={regForm.gender} onChange={e => setRegForm({...regForm, gender: e.target.value})}>
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" className="w-full border p-2 rounded-md" value={regForm.age} onChange={e => setRegForm({...regForm, age: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" className="w-full border p-2 rounded-md" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                <input type="text" className="w-full border p-2 rounded-md" value={regForm.village} onChange={e => setRegForm({...regForm, village: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ABHA ID (Optional)</label>
                <input type="text" className="w-full border p-2 rounded-md" value={regForm.abhaId} onChange={e => setRegForm({...regForm, abhaId: e.target.value})} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRegForm(false)}>Cancel</Button>
              <Button onClick={handleRegister} disabled={regLoading}>{regLoading ? 'Registering...' : 'Register'}</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <input 
          type="text" 
          placeholder="Search by name..." 
          className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="outline" onClick={handleSearch}>Search</Button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Patient ID</th>
              <th className="px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 font-medium text-gray-500">Age/Gender</th>
              <th className="px-6 py-3 font-medium text-gray-500">Village</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading patients...</td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No patients found. Create one to get started.</td>
              </tr>
            ) : (
              patients.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.id.substring(0,8)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600">{p.age || '--'} / {p.gender || '--'}</td>
                  <td className="px-6 py-4 text-gray-600">{p.village || '--'}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/patients/${p.id}`}>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
