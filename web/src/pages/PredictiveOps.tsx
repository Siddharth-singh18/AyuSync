
import { Button } from '../components/ui/Button';

export default function PredictiveOps() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Predictive Operations (Supply Chain)</h2>
        <Button variant="outline">Run Forecasting Model</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Predictive Alert Card */}
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
          <h3 className="font-bold text-orange-800 text-lg mb-2">High Risk: Inventory Shortage</h3>
          <p className="text-sm text-orange-900/80 mb-4 font-medium">Paracetamol 500mg & Broad-spectrum Antibiotics</p>
          
          <div className="bg-white/60 rounded p-4 text-sm mb-4 border border-orange-100">
            <p className="font-semibold text-gray-700 mb-1">AI Context:</p>
            <p className="text-gray-600">
              Detected a 140% spike (84 cases) in acute fever-related triages routed to District Hospital A over the last 7 days. Current inventory will deplete in approx 3 days.
            </p>
          </div>

          <div className="flex gap-3">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">Approve Auto-Restock</Button>
            <Button size="sm" variant="outline" className="border-orange-200 text-orange-800 hover:bg-orange-100">Ignore Alert</Button>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
           <h3 className="font-bold text-lg mb-4">Regional Triage Trends (7 Days)</h3>
           <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Respiratory (Cough/Breathlessness)</span>
                  <span className="text-muted-foreground">+12%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[45%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-orange-600">Fever / Infection</span>
                  <span className="text-orange-600 font-bold">+140%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[85%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Trauma / Injury</span>
                  <span className="text-muted-foreground">-5%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[20%]"></div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
