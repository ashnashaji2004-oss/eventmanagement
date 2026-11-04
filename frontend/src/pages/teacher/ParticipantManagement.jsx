import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import CountdownTimer from '../../components/CountdownTimer';
import {
  Users,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  ShieldAlert,
  Trash2
} from 'lucide-react';

export default function ParticipantManagement() {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('event') || '';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [chestNumber, setChestNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/events/'),
      api.get('/students/')
    ])
      .then(([evRes, stuRes]) => {
        const evList = evRes.data.results || evRes.data || [];
        setEvents(evList);
        setStudents(stuRes.data.results || stuRes.data || []);
        if (evList.length > 0 && !selectedEventId) {
          setSelectedEventId(evList[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const fetchParticipants = (eventId) => {
    if (!eventId) return;
    api.get(`/participants/?event=${eventId}`)
      .then((res) => setParticipants(res.data.results || res.data || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (selectedEventId) {
      const found = events.find((e) => String(e.id) === String(selectedEventId));
      setSelectedEvent(found || null);
      fetchParticipants(selectedEventId);
    }
  }, [selectedEventId, events]);

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedStudentId) {
      setError('Please select a student.');
      return;
    }

    try {
      await api.post('/participants/', {
        event: selectedEventId,
        student: selectedStudentId,
        chest_number: chestNumber
      });
      setSuccess('Participant enrolled successfully!');
      setSelectedStudentId('');
      setChestNumber('');
      fetchParticipants(selectedEventId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to enroll participant. Event registration deadline may have passed.'
      );
    }
  };

  const isRegistrationOpen = selectedEvent?.is_registration_open;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Event Participant Enrollment
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enroll students from the school directory into competitions. Registrations are automatically blocked once deadlines expire.
          </p>
        </div>

        {/* Event selector dropdown */}
        <div className="w-full sm:w-72">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} ({ev.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedEvent && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
              {selectedEvent.category_name}
            </span>
            <h2 className="text-xl font-black text-slate-900">{selectedEvent.name}</h2>
            <p className="text-xs text-slate-500">
              Venue: {selectedEvent.venue} • Date: {selectedEvent.event_date} ({selectedEvent.start_time?.slice(0, 5)})
            </p>
          </div>

          <div>
            <CountdownTimer
              closeDate={selectedEvent.registration_close_date}
              isOverridden={selectedEvent.is_registration_overridden}
              status={selectedEvent.status}
            />
          </div>
        </div>
      )}

      {/* Add Participant Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>Add Participant Record</span>
        </h3>

        {!isRegistrationOpen && !selectedEvent?.is_registration_overridden && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <span className="font-bold block">Registration Closed by Deadline</span>
              <span>
                The registration window for this event closed on {new Date(selectedEvent?.registration_close_date).toLocaleString()}. Late participant additions are prohibited by backend security rules.
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleAddParticipant} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Student from Directory
            </label>
            <select
              required
              disabled={!isRegistrationOpen}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-slate-100 disabled:opacity-60"
            >
              <option value="">-- Choose Student Record --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.admission_number} - {st.full_name} ({st.class_name}-{st.division}, {st.house_name} House)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Chest Number (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                disabled={!isRegistrationOpen}
                value={chestNumber}
                onChange={(e) => setChestNumber(e.target.value)}
                placeholder="e.g. C-105"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 font-mono disabled:bg-slate-100 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!isRegistrationOpen}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enroll
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Enrolled Participants List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">
            Enrolled Competitors ({participants.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Chest No.</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission No.</th>
                <th className="py-3 px-4">Class & Division</th>
                <th className="py-3 px-4">House Team</th>
                <th className="py-3 px-4">Enrolled At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {participants.map((p) => {
                const s = p.student_details || {};
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 text-xs">
                      {p.chest_number || '-'}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {s.full_name}
                      {s.malayalam_name && <span className="block text-xs font-normal text-slate-500">{s.malayalam_name}</span>}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-600">
                      {s.admission_number}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                      Class {s.class_name}-{s.division}
                    </td>
                    <td className="py-4 px-4">
                      <HouseBadge houseName={s.house_name} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                      {new Date(p.registered_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
