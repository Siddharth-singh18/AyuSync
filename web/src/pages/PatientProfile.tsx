import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/Button';
import AssessmentView from './AssessmentView';

export default function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/patients/${id}/timeline`);
        setPatient(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load patient profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading patient profile...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 inline-block">{error}</div>
        <br />
        <Link to="/patients"><Button variant="outline">Back to Patients</Button></Link>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{patient.name}</h2>
          <p className="text-gray-500">ID: {patient.id} • {patient.age}yrs • {patient.gender}</p>
        </div>
        <Link to="/patients"><Button variant="outline">Back</Button></Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-xl border bg-white shadow-sm p-6 col-span-1">
          <h3 className="font-semibold text-lg mb-4 border-b pb-2">Details</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span className="text-gray-500">Phone:</span> <span>{patient.phone || 'N/A'}</span></li>
            <li className="flex justify-between"><span className="text-gray-500">Village:</span> <span>{patient.village || 'N/A'}</span></li>
            <li className="flex justify-between"><span className="text-gray-500">ABHA ID:</span> <span>{patient.abhaId || 'N/A'}</span></li>
            <li className="flex justify-between"><span className="text-gray-500">Registered:</span> <span>{new Date(patient.createdAt).toLocaleDateString()}</span></li>
          </ul>
        </div>
        
        <div className="rounded-xl border bg-white shadow-sm p-6 col-span-2">
          <h3 className="font-semibold text-lg mb-4 border-b pb-2">Timeline</h3>
          {patient.encounters && patient.encounters.length > 0 ? (
            <div className="space-y-4">
              {patient.encounters.map((enc: any) => (
                <div key={enc.id} className="border-l-2 border-blue-200 pl-4 py-1">
                  <p className="font-medium">{enc.type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">{new Date(enc.start).toLocaleString()} • Status: {enc.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No encounters recorded yet.</p>
          )}
        </div>
      </div>
      
      {/* If there's an active assessment, we could render the existing AssessmentView logic here. 
          For Phase 4, we're demonstrating the integration of the real data above. */}
      {patient.encounters && patient.encounters.length > 0 && (
         <div className="opacity-75 border-t pt-8">
           <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">Latest Assessment Details</h3>
           <AssessmentView />
         </div>
      )}
    </div>
  );
}
