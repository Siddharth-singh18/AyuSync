import React, { useState } from 'react';
import { Button } from '../components/ui/Button';

export default function Patients() {
  const [search, setSearch] = useState('');

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Patients</h2>
        <Button>Register Patient</Button>
      </div>

      <div className="mb-6 flex gap-4">
        <input 
          type="text" 
          placeholder="Search by name, phone, or ABHA ID..." 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline">Search</Button>
      </div>

      <div className="rounded-md border">
        {/* Placeholder table for patients */}
        <table className="w-full text-sm text-left text-muted-foreground">
          <thead className="text-xs text-secondary-foreground uppercase bg-secondary">
            <tr>
              <th className="px-4 py-3">Patient ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Age/Gender</th>
              <th className="px-4 py-3">Village</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-card">
              <td className="px-4 py-3 font-medium text-foreground">ABHA-1234</td>
              <td className="px-4 py-3">Ram Singh</td>
              <td className="px-4 py-3">45 / M</td>
              <td className="px-4 py-3">Mokama</td>
              <td className="px-4 py-3 text-right">
                <Button variant="ghost" size="sm">View Profile</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
