import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/Button';
import AiTriageCard from '../components/triage/AiTriageCard';

export default function PatientProfile() {
  const { id } = useParams();

  const VALID_TRANSITIONS: Record<string, string[]> = {
    'CREATED': ['SUBMITTED', 'CANCELLED'],
    'SUBMITTED': ['ACCEPTED', 'REJECTED'],
    'ACCEPTED': ['SCHEDULED'],
    'SCHEDULED': ['PATIENT_ARRIVED', 'CANCELLED'],
    'PATIENT_ARRIVED': ['IN_CONSULTATION'],
    'IN_CONSULTATION': ['DIAGNOSTICS_PENDING', 'TREATMENT', 'COUNTER_REFERRED'],
    'DIAGNOSTICS_PENDING': ['TREATMENT', 'COUNTER_REFERRED'],
    'TREATMENT': ['COUNTER_REFERRED'],
    'COUNTER_REFERRED': ['FOLLOW_UP_REQUIRED', 'COMPLETED'],
    'FOLLOW_UP_REQUIRED': ['COMPLETED']
  };

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Assessment Form State
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

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

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const handleAddAssessment = async () => {
    if (!symptomInput.trim() || !patient?.encounters?.[0]?.id) return;
    setSubmittingAssessment(true);
    try {
      await api.post('/assessments', {
        patientId: patient.id,
        encounterId: patient.encounters[0].id,
        symptoms: [{ name: symptomInput, duration: '1 day', severity: 'MODERATE' }],
        vitals: [],
        provenance: 'WORKER_RECORDED'
      });
      setSymptomInput('');
      setShowAssessmentForm(false);
      // Refresh timeline to see the new assessment & triage
      await fetchProfile();
    } catch (err) {
      console.error('Failed to submit assessment', err);
      alert('Failed to submit assessment. Make sure an encounter exists.');
    } finally {
      setSubmittingAssessment(false);
    }
  };

  const handleReferralTransition = async (referralId: string, newStatus: string) => {
    try {
      await api.put(`/referrals/${referralId}/status`, { newStatus, notes: 'Updated via Patient Profile UI' });
      await fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to update referral status');
    }
  };

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
                  <p className="font-medium">{enc.type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">{new Date(enc.start).toLocaleString()} • Status: {enc.status}</p>

                  {enc.assessments && enc.assessments.length > 0 && (
                    <div className="mt-4 flex flex-col gap-4">
                      {enc.assessments.map((ass: any) => (
                        <div key={ass.id} className="bg-gray-50 p-4 rounded-xl shadow-sm">
                          <p className="font-semibold text-gray-700 mb-2">Assessment Details</p>
                          <p className="text-gray-600 text-sm mb-3">Symptoms: {ass.symptoms?.map((s: any) => s.name).join(', ') || 'None recorded'}</p>

                          {ass.aiRecommendations && ass.aiRecommendations.length > 0 && (
                            <div className="mt-2">
                              {ass.aiRecommendations.map((ai: any) => (
                                <AiTriageCard
                                  key={ai.id}
                                  score={ai.confidence || 0}
                                  urgencyLevel={ai.urgencyCategory as any}
                                  explanation={ai.reasons?.[0] || 'No reason provided'}
                                  provenanceModel="AyuSync Triage Fallback"
                                  confidence={ai.confidence || 0}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mb-4">No encounters recorded yet.</p>
          )}

          {/* Quick Assessment Action */}
          {patient.encounters && patient.encounters.length > 0 && (
            <div className="mt-6 border-t pt-4">
              {!showAssessmentForm ? (
                <Button onClick={() => setShowAssessmentForm(true)} variant="outline">
                  + Add Assessment to Latest Encounter
                </Button>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl border space-y-4">
                  <h4 className="font-semibold">New Assessment</h4>
                  <input
                    type="text"
                    placeholder="Enter main symptom (e.g. High Fever)"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    className="w-full border p-2 rounded-md"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddAssessment} disabled={submittingAssessment || !symptomInput.trim()}>
                      {submittingAssessment ? 'Saving...' : 'Save Assessment'}
                    </Button>
                    <Button onClick={() => setShowAssessmentForm(false)} variant="outline">Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {patient.referrals && patient.referrals.length > 0 && (
         <div className="border-t pt-8 mt-8">
           <h3 className="text-lg font-bold text-gray-800 mb-4">Referrals</h3>
           <div className="grid gap-4 md:grid-cols-2">
             {patient.referrals.map((ref: any) => {
               const possibleTransitions = VALID_TRANSITIONS[ref.status] || [];
               return (
                 <div key={ref.id} className="border p-4 rounded-xl shadow-sm bg-white">
                   <p className="font-medium text-blue-600 mb-2 border-b pb-1">
                     <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mr-2">{ref.status}</span>
                   </p>
                   <p className="text-sm text-gray-600 mt-2">
                     <span className="font-semibold text-gray-700">From:</span> {ref.origin?.name || ref.originId}
                   </p>
                   <p className="text-sm text-gray-600">
                     <span className="font-semibold text-gray-700">To:</span> {ref.destination?.name || ref.destinationId}
                   </p>
                   <p className="text-sm text-gray-600 mt-1">
                     <span className="font-semibold text-gray-700">Reason:</span> {ref.reason || 'N/A'}
                   </p>
                   <p className="text-xs text-gray-400 mt-2">Created: {new Date(ref.createdAt).toLocaleDateString()}</p>

                   {possibleTransitions.length > 0 && (
                     <div className="mt-4 pt-3 border-t flex flex-wrap gap-2">
                       {possibleTransitions.map(t => (
                         <Button key={t} size="sm" variant="outline" onClick={() => handleReferralTransition(ref.id, t)}>
                           Mark {t}
                         </Button>
                       ))}
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
         </div>
      )}
    </div>
  );
}
