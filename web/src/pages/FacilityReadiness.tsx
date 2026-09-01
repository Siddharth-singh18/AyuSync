import React from 'react';
import { Button } from '../components/ui/Button';

export default function FacilityReadiness() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Facility Readiness Intelligence</h2>
        <Button variant="outline">Refresh Telemetry</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Readiness Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 border-t-4 border-t-primary">
          <h3 className="font-semibold text-lg mb-2">District Hospital A</h3>
          <div className="text-3xl font-bold text-primary mb-4">92/100</div>
          <p className="text-sm text-muted-foreground mb-4">Overall Operational Readiness</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>ICU Beds</span> <span className="font-medium text-green-600">Available (4)</span></div>
            <div className="flex justify-between"><span>Oxygen Supply</span> <span className="font-medium text-green-600">Stable (85%)</span></div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span>Cardiologist on Duty</span> 
              <span className="font-medium">Dr. Sharma (Till 8PM)</span>
            </div>
          </div>
        </div>

        {/* Action Required Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 border-t-4 border-t-destructive">
          <h3 className="font-semibold text-lg mb-2">CHC Mokama</h3>
          <div className="text-3xl font-bold text-destructive mb-4">45/100</div>
          <p className="text-sm text-muted-foreground mb-4">Requires Immediate Attention</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Pharmacy</span> <span className="font-medium text-destructive">Low Stock (Paracetamol)</span></div>
            <div className="flex justify-between"><span>Wait Time</span> <span className="font-medium text-destructive">> 2 Hours</span></div>
            <div className="mt-4 pt-4 border-t text-xs">
              AI has temporarily stopped routine routing to this facility.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
