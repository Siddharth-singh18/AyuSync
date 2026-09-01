import React from 'react';

// Basic router placeholder
export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-4 md:px-6">
          <h1 className="text-xl font-bold text-primary">AyuSync</h1>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <a className="text-sm font-medium hover:underline underline-offset-4" href="#">Dashboard</a>
            <a className="text-sm font-medium hover:underline underline-offset-4" href="#">Patients</a>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Doctor Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Dashboard Cards will go here */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Patients in Queue</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
