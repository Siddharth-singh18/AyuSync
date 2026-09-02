import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalPatients: 'N/A',
    activeAssessments: 'N/A',
    pendingReferrals: 'N/A',
    patientsInQueue: 'N/A'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium text-gray-500 mb-2">Total Patients</h3>
          <div className="text-3xl font-bold text-gray-900">{loading ? '...' : metrics.totalPatients}</div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium text-gray-500 mb-2">Patients in Queue</h3>
          <div className="text-3xl font-bold text-gray-900">{loading ? '...' : metrics.patientsInQueue}</div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium text-gray-500 mb-2">Active Assessments</h3>
          <div className="text-3xl font-bold text-blue-600">{loading ? '...' : metrics.activeAssessments}</div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium text-gray-500 mb-2">Pending Referrals</h3>
          <div className="text-3xl font-bold text-orange-600">{loading ? '...' : metrics.pendingReferrals}</div>
        </div>
      </div>

      <div className="mt-8 p-8 border border-dashed border-gray-300 rounded-xl text-center bg-gray-50">
        <h3 className="text-lg font-bold text-gray-700 mb-2">AyuSync Operational Command Center</h3>
        <p className="text-gray-500">Live telemedicine operations are running on a PostgreSQL-backed deterministic simulation environment.</p>
      </div>
    </div>
  );
}
