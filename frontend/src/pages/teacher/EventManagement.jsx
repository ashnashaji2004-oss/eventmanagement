import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import CountdownTimer from '../../components/CountdownTimer';
import {
  Calendar,
  PlusCircle,
  Clock,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Search,
  Filter,
  Users,
  ShieldAlert,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EventManagement() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'mine'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [newCloseDate, setNewCloseDate] = useState('');
  const [overrideError, setOverrideError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    name_ml: '',
    category: '',
    description: '',
    description_ml: '',
    venue: '',
    event_date: '',
    start_time: '09:00',
    end_time: '11:00',
    coordinating_teacher: '',
    participating_classes: 'All',
    event_type: 'INDIVIDUAL',
    registration_open_date: '',
    registration_close_date: '',
    rules: '',
    scoring_criteria: '',
    status: 'OPEN'
  });

  const fetchData = () => {
    Promise.all([
      api.get('/events/'),
      api.get('/categories/')
    ])
      .then(([evRes, catRes]) => {
        setEvents(evRes.data.results || evRes.data || []);
        const catList = catRes.data.results || catRes.data || [];
        setCategories(catList);
        if (catList.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: catList[0].id }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.category && categories.length > 0) {
        payload.category = categories[0].id;
      }
      await api.post('/events/', payload);
      setCreateModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      setOverrideError('A valid administrative reason is mandatory to override registration deadlines.');
      return;
    }
    setOverrideError('');
    try {
      await api.post(`/events/${selectedEvent.id}/override-deadline/`, {
        reason: overrideReason,
        new_registration_close_date: newCloseDate || undefined
      });
      setOverrideModalOpen(false);
      setOverrideReason('');
      setNewCloseDate('');
      fetchData();
    } catch (err) {
      setOverrideError(err.response?.data?.error || 'Failed to override deadline.');
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (filterMode === 'mine' && ev.coordinating_teacher !== user?.id) {
      return false;
    }
    if (selectedCategory && ev.category !== Number(selectedCategory)) {
      return false;
    }
    const q = search.toLowerCase();
    return (
      ev.name?.toLowerCase().includes(q) ||
      ev.venue?.toLowerCase().includes(q) ||
      ev.category_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Event Management & Deadlines
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure competitions, coordinate events, monitor live countdowns, enroll participants, and override deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Filter and Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            All School Events ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('mine')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filterMode === 'mine'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            My Supervised Events ({events.filter((e) => e.coordinating_teacher === user?.id).length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event name, venue..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Event Name & Category</th>
                <th className="py-3 px-4">Date & Venue</th>
                <th className="py-3 px-4">Registration Window</th>
                <th className="py-3 px-4">Coordinator</th>
                <th className="py-3 px-4">Deadline Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Loading school events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No matching events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">{ev.name}</span>
                      {ev.name_ml && <span className="text-xs text-slate-400 block">{ev.name_ml}</span>}
                      <span className="text-xs text-indigo-600 font-semibold uppercase">{ev.category_name}</span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800 block">{ev.event_date}</span>
                      <span className="text-slate-400 block">{ev.venue}</span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600">
                      <span className="block">
                        Closes: {new Date(ev.registration_close_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      {ev.is_registration_overridden && (
                        <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1">
                          Override: "{ev.registration_override_reason}"
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                      {ev.coordinating_teacher_name || 'Staff Coordinator'}
                    </td>

                    <td className="py-4 px-4">
                      <CountdownTimer
                        closeDate={ev.registration_close_date}
                        isOverridden={ev.is_registration_overridden}
                        status={ev.status}
                      />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/teacher/participants?event=${ev.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                          Participants
                        </Link>
                        <Link
                          to={`/teacher/results?event=${ev.id}`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                        >
                          Results
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEvent(ev);
                            setOverrideModalOpen(true);
                            setOverrideError('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors"
                          title="Override registration deadline"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Override</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Override Deadline */}
      {overrideModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Override Registration Deadline</span>
              </h3>
              <button
                type="button"
                onClick={() => setOverrideModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Event: <strong>{selectedEvent.name}</strong>
              <br />
              Current Close Date: {new Date(selectedEvent.registration_close_date).toLocaleString()}
            </p>

            {overrideError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs">
                {overrideError}
              </div>
            )}

            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mandatory Override Reason (Logged in Audit Trail)
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State the justification for extending registration..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Optional: Set Extended Close Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newCloseDate}
                  onChange={(e) => setNewCloseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                >
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Event */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Create New School Event</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Event Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Event Name in Malayalam (മലയാളം)
                  </label>
                  <input
                    type="text"
                    value={formData.name_ml}
                    onChange={(e) => setFormData({ ...formData, name_ml: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. School Auditorium, Main Ground, Hall B"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registration Opens
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registration_open_date}
                    onChange={(e) => setFormData({ ...formData, registration_open_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registration_close_date}
                    onChange={(e) => setFormData({ ...formData, registration_close_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  Save & Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
