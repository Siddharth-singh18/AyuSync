

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Dashboard Cards */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium text-gray-500 mb-2">Patients in Queue</h3>
          <div className="text-3xl font-bold text-gray-900">N/A</div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium text-gray-500 mb-2">Active Assessments</h3>
          <div className="text-3xl font-bold text-blue-600">N/A</div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium text-gray-500 mb-2">Pending Referrals</h3>
          <div className="text-3xl font-bold text-orange-600">N/A</div>
        </div>
      </div>
      
      <div className="mt-8 p-8 border border-dashed border-gray-300 rounded-xl text-center bg-gray-50">
        <p className="text-gray-500">Advanced Dashboard Metrics are not yet implemented in Phase 4.</p>
      </div>
    </div>
  );
}
