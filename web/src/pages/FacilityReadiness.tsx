import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/Button';

export default function FacilityReadiness() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/facilities');
      setFacilities(res.data);
      setError('');
    } catch {
      setError('Failed to load facilities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const updateAvailability = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'OPEN' ? 'OVERCAPACITY' : 'OPEN';
    setUpdating(id);
    try {
      await api.put(`/facilities/${id}/availability`, {
        status: newStatus,
        readinessScore: 80
      });
      await fetchFacilities();
    } catch {
      alert('Failed to update availability.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Facility Readiness Intelligence</h2>
        <Button variant="outline" onClick={fetchFacilities}>Refresh Telemetry</Button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

      {loading ? (
        <div className="text-gray-500 animate-pulse">Loading facilities...</div>
      ) : facilities.length === 0 ? (
        <div className="text-gray-500">No facilities found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {facilities.map((fac) => {
            const avail = fac.availability;
            const status = avail?.status || 'UNKNOWN';
            const isDanger = status === 'OVERCAPACITY' || status === 'CLOSED';

            return (
              <div key={fac.id} className={`rounded-xl border bg-card text-card-foreground shadow p-6 border-t-4 ${isDanger ? 'border-t-destructive' : 'border-t-primary'}`}>
                <h3 className="font-semibold text-lg mb-2">{fac.name}</h3>
                <div className={`text-3xl font-bold mb-4 ${isDanger ? 'text-destructive' : 'text-primary'}`}>
                  {status}
                </div>
                <p className="text-sm text-muted-foreground mb-4">Level {fac.level} {fac.type}</p>

                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between"><span>Readiness Score</span> <span className="font-medium">{avail?.readinessScore || 'N/A'}/100</span></div>
                  <div className="flex justify-between"><span>Address</span> <span className="font-medium">{fac.address || 'N/A'}</span></div>
                </div>

                <Button
                  variant={isDanger ? 'outline' : 'default'}
                  className="w-full"
                  onClick={() => updateAvailability(fac.id, status)}
                  disabled={updating === fac.id}
                >
                  {updating === fac.id ? 'Updating...' : `Toggle to ${status === 'OPEN' ? 'OVERCAPACITY' : 'OPEN'}`}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
