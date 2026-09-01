import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function Patients() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Patients</h2>
        <Button>Register Patient (Mock)</Button>
      </div>

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
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.id.split('-')[0]}</td>
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
