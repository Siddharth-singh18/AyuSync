import { useState } from 'react';
import { Button } from '../components/ui/Button';

export default function Appointments() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Appointments</h2>
        <div className="flex gap-4">
          <input 
            type="date" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Button>Book Slot</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Slot Grid Mock */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <h3 className="font-semibold mb-4">Morning Slots (09:00 - 13:00)</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="w-24 bg-red-50 text-red-700 border-red-200" disabled>09:00</Button>
            <Button variant="outline" className="w-24 bg-red-50 text-red-700 border-red-200" disabled>09:30</Button>
            <Button variant="outline" className="w-24">10:00</Button>
            <Button variant="outline" className="w-24">10:30</Button>
            <Button variant="outline" className="w-24 bg-yellow-50 text-yellow-700 border-yellow-200" title="Reserved for Follow-up">11:00</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
