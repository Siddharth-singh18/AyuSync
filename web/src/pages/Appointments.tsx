import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/Button';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Booking Form State
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments');
      setAppointments(res.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // Fetch dependencies for booking form
    api.get('/patients/search?q=').then(res => setPatients(res.data)).catch(console.error);
    api.get('/auth/doctors').then(res => setDoctors(res.data)).catch(console.error);
    api.get('/facilities').then(res => setFacilities(res.data)).catch(console.error);
  }, []);

  const handleBook = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedFacility || !date || !bookingTime) {
      alert('All fields are required');
      return;
    }

    setBookingLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${bookingTime}:00`).toISOString();
      await api.post('/appointments', {
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        facilityId: selectedFacility,
        scheduledAt
      });
      setShowBookingForm(false);
      setSelectedPatient('');
      setSelectedDoctor('');
      setSelectedFacility('');
      setBookingTime('');
      await fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to book slot');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const apptDate = new Date(a.scheduledAt).toISOString().split('T')[0];
    return apptDate === date;
  });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Appointments</h2>
        <div className="flex gap-4 items-center">
          <Button variant="outline" onClick={fetchAppointments}>Refresh</Button>
          <input 
            type="date" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Button onClick={() => setShowBookingForm(true)}>Book Slot</Button>
        </div>
      </div>

      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Book Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select className="w-full border p-2 rounded-md" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id.slice(0,6)})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select className="w-full border p-2 rounded-md" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.phone || 'Doctor'} (ID: {d.id.slice(0,6)})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
                <select className="w-full border p-2 rounded-md" value={selectedFacility} onChange={e => setSelectedFacility(e.target.value)}>
                  <option value="">Select Facility</option>
                  {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input type="time" className="w-full border p-2 rounded-md" value={bookingTime} onChange={e => setBookingTime(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBookingForm(false)}>Cancel</Button>
              <Button onClick={handleBook} disabled={bookingLoading}>{bookingLoading ? 'Booking...' : 'Book Appointment'}</Button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

      {loading ? (
        <div className="text-gray-500 animate-pulse">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-gray-500 bg-gray-50 p-8 rounded-xl text-center border">
          No appointments found for this date. Try changing the date.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Facility</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appt) => (
                <tr key={appt.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    {appt.patient?.name || 'Unknown Patient'}
                  </td>
                  <td className="px-6 py-4">
                    {appt.doctor?.user?.phone || 'Assigned Doctor'}
                  </td>
                  <td className="px-6 py-4">
                    {appt.facility?.name || 'Unknown Facility'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      appt.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                      appt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Show all appointments count just for info */}
      <div className="mt-4 text-xs text-gray-400">
        Total appointments in database: {appointments.length} (Showing {filteredAppointments.length} for {date})
      </div>
    </div>
  );
}
