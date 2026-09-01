import React from 'react';
import { Button } from '../ui/Button';

export default function SyncCenter() {
  // Mock state for conflict resolution UI
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-destructive"></span>
          Sync Center
        </h3>
        <span className="text-sm font-medium text-destructive">1 Conflict Detected</span>
      </div>
      
      <div className="mt-4 p-4 border border-destructive/20 rounded-md bg-destructive/5">
        <p className="font-medium text-sm">Patient Demographic Conflict</p>
        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
          <div>
            <p className="text-muted-foreground">Server Version (Updated 10m ago):</p>
            <p>Village: Patna</p>
          </div>
          <div>
            <p className="text-muted-foreground">Local Version (Updated just now):</p>
            <p>Village: Mokama</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline">Keep Server</Button>
          <Button size="sm">Push Local</Button>
        </div>
      </div>
    </div>
  );
}
