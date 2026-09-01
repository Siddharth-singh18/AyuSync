import React from 'react';
import { Button } from '../components/ui/Button';

export default function CareGaps() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Population Care Gaps</h2>
        <Button>Export Report</Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        <div className="bg-destructive/10 p-4 border-b border-destructive/20 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-destructive flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive"></span>
              Missed Follow-ups (Critical)
            </h3>
            <p className="text-sm text-destructive/80">Patients who failed to complete specialist counter-referral tasks</p>
          </div>
          <div className="text-2xl font-black text-destructive">12</div>
        </div>
        
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Assigned ASHA</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 font-medium">Sita Devi</td>
                <td className="px-4 py-3 text-destructive font-semibold">2 Days Ago</td>
                <td className="px-4 py-3 text-muted-foreground">Worker 04 (Mokama)</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline">Remind Worker</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 rounded-xl border bg-card text-card-foreground shadow p-6">
        <h3 className="font-bold mb-2 text-yellow-600">Chronic Neglect Warning</h3>
        <p className="text-sm text-muted-foreground mb-4">
          45 patients with active Hypertension have not had a recorded BP check in the last 6 months.
        </p>
        <Button variant="secondary">Generate Campaign Task List</Button>
      </div>
    </div>
  );
}
