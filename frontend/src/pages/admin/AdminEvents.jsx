import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import CountdownTimer from '../../components/CountdownTimer';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Users,
  Search,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function AdminEvents() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [eventModal, setEventModal] = useState({ open: false, isNew: false, data: {} });
  const [overrideModal, setOverrideModal] = useState({ open: false, event: null, reason: '', newClose: '' });

  useEffect(() => {
    fetchAuxiliaryData();
    fetchEvents();
  }, [sectionFilter, categoryFilter, statusFilter]);

  const fetchAuxiliaryData = async () => {
    try {
      const [catsRes, usersRes] = await Promise.all([
        api.get('/categories/'),
        api.get('/admin/users/', { params: { role: 'TEACHER', status: 'APPROVED' } })
      ]);
      setCategories(catsRes.data?.results || (Array.isArray(catsRes.data) ? catsRes.data : []));
      setTeachers(usersRes.data?.results || (Array.isArray(usersRes.data) ? usersRes.data : []));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (sectionFilter) params.school_section = sectionFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/events/', { params });
      setEvents(res.data?.results || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  // Approve Draft Event
  const handleApproveEvent = async (eventId) => {
    try {
      const res = await api.post(`/events/${eventId}/approve_event/`);
      setMessage(res.data.message);
      fetchEvents();
    } catch (err) {
      setError('Failed to approve event.');
    }
  };

  // Cancel Event
  const handleCancelEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel this event?')) return;
    try {
      const res = await api.post(`/events/${eventId}/cancel_event/`);
      setMessage(res.data.message);
      fetchEvents();
    } catch (err) {
      setError('Failed to cancel event.');
    }
  };

  // Save Event (Create or Edit)
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setError('');
    const d = eventModal.data;
    try {
      if (eventModal.isNew) {
        await api.post('/events/', d);
        setMessage(`Event '${d.name}' created successfully.`);
      } else {
        await api.put(`/events/${d.id}/`, d);
        setMessage(`Event '${d.name}' updated successfully.`);
      }
      setEventModal({ open: false, isNew: false, data: {} });
      fetchEvents();
    } catch (err) {
      const resD = err.response?.data;
      setError(typeof resD === 'object' ? JSON.stringify(resD) : 'Failed to save event.');
    }
  };

  // Override Registration Deadline
  const handleExecuteOverride = async () => {
    if (!overrideModal.reason.trim()) {
      alert('Justification reason is required to override deadline.');
      return;
    }
    try {
      await api.post(`/events/${overrideModal.event.id}/override-deadline/`, {
        reason: overrideModal.reason,
        new_registration_close_date: overrideModal.newClose || undefined
      });
      setMessage(`Deadline overridden for '${overrideModal.event.name}'. Logged to audit trail.`);
      setOverrideModal({ open: false, event: null, reason: '', newClose: '' });
      fetchEvents();
    } catch (err) {
      setError('Failed to override registration deadline.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-8 h-8 text-amber-600" />
            <span>Event & Competition Scheduling</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, approve, and manage UP and High School competitions with strict deadline enforcement.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            setEventModal({
              open: true,
              isNew: true,
              data: {
                name: '',
                name_ml: '',
                category: categories[0]?.id || 1,
                school_section: 'ALL',
                event_date: tomorrow.toISOString().split('T')[0],
                start_time: '10:00:00',
                end_time: '12:00:00',
                venue: 'CSHSS Main Auditorium',
                coordinating_teacher: teachers[0]?.id || null,
                participating_classes: 'All',
                event_type: 'INDIVIDUAL',
                max_participants: 20,
                registration_open_date: now.toISOString(),
                registration_close_date: inThreeDays.toISOString(),
                status: 'OPEN',
                academic_year: '2025-2026'
              }
            });
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Alert Notices */}
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-800">
          <XCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All Sections</option>
            <option value="UP">UP Section (5-7)</option>
            <option value="HS">High School (8-12)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All Categories</option>
            {Array.isArray(categories) && categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Registration Open</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="CLOSED">Registration Closed</option>
            <option value="RESULTS_PENDING">Results Pending</option>
            <option value="RESULTS_PUBLISHED">Results Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchEvents()}
            placeholder="Search event name, venue..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <span className="text-xs text-slate-400">Loading events...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4">Section & Category</th>
                  <th className="py-3.5 px-4">Date & Venue</th>
                  <th className="py-3.5 px-4">Registration Window</th>
                  <th className="py-3.5 px-4">Status & Counts</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(events) && events.length > 0 ? (
                  events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="block font-bold text-slate-900 text-sm">
                          {ev.name}
                        </span>
                        {ev.name_ml && (
                          <span className="text-slate-500 text-[11px] font-medium block">
                            {ev.name_ml}
                          </span>
                        )}
                        <span className="text-[10px] text-indigo-700 font-semibold">
                          Coord: {ev.coordinating_teacher_name || 'Not assigned'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.school_section === 'UP'
                            ? 'bg-blue-100 text-blue-800'
                            : ev.school_section === 'HS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {ev.school_section === 'UP' ? 'UP Section' : ev.school_section === 'HS' ? 'High School' : 'All Sections'}
                        </span>
                        <span className="block text-[11px] text-slate-500 pt-0.5 font-medium">
                          {ev.category_name}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="block font-semibold text-slate-800">
                          {ev.event_date} ({ev.start_time.slice(0, 5)} - {ev.end_time.slice(0, 5)})
                        </span>
                        <span className="text-slate-500 text-[11px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {ev.venue}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {ev.is_registration_open ? (
                          <CountdownTimer targetDate={ev.registration_close_date} />
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            Closed on {new Date(ev.registration_close_date).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ev.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' :
                            ev.status === 'RESULTS_PUBLISHED' ? 'bg-indigo-100 text-indigo-800' :
                            ev.status === 'RESULTS_PENDING' ? 'bg-amber-100 text-amber-800' :
                            ev.status === 'DRAFT' ? 'bg-slate-200 text-slate-800' :
                            ev.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {ev.status}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            {ev.participants_count || 0} enrolled participants
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {ev.status === 'DRAFT' && (
                          <button
                            type="button"
                            onClick={() => handleApproveEvent(ev.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setOverrideModal({ open: true, event: ev, reason: '', newClose: '' })}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg text-xs"
                          title="Override registration deadline"
                        >
                          Override Deadline
                        </button>

                        <button
                          type="button"
                          onClick={() => setEventModal({ open: false, isNew: false, data: { ...ev } })}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                        >
                          Edit
                        </button>

                        {ev.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => handleCancelEvent(ev.id)}
                            className="px-2.5 py-1 text-red-600 hover:bg-red-50 font-semibold rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                      No events match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {eventModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-lg text-slate-900">
              {eventModal.isNew ? 'Create New Competition' : `Edit Event: ${eventModal.data.name}`}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Event Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventModal.data.name || ''}
                    onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, name: e.target.value } })}
                    placeholder="e.g. 100m Sprint Senior Boys"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Event Name (Malayalam)
                  </label>
                  <input
                    type="text"
                    value={eventModal.data.name_ml || ''}
                    onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, name_ml: e.target.value } })}
                    placeholder="e.g. 100 മീറ്റർ ഓട്ടം"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    School Section *
                  </label>
                  <select
                    value={eventModal.data.school_section || 'ALL'}
                    onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, school_section: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="ALL">All Sections (Common)</option>
                    <option value="UP">UP Section (5-7)</option>
                    <option value="HS">High School (8-12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={eventModal.data.category || (categories[0]?.id || '')}
                    onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, category: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {Array.isArray(categories) && categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventModal.data.event_date || ''}
                    onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, event_date: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventModal.data.venue || ''}
                    onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, venue: e.target.value } })}
                    placeholder="e.g. CSHSS Centenary Auditorium"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={eventModal.data.start_time || '10:00:00'}
                    onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, start_time: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={eventModal.data.end_time || '12:00:00'}
                    onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, end_time: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Coordinating Teacher
                  </label>
                  <select
                    value={eventModal.data.coordinating_teacher || ''}
                    onChange={(e) => setEventModal({ ...eventModal, data: { ...eventModal.data, coordinating_teacher: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">Select Coordinator...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.first_name ? `${t.first_name} ${t.last_name || ''}` : t.username}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEventModal({ open: false, isNew: false, data: {} })}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deadline Override Modal */}
      {overrideModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Override Registration Deadline</span>
            </h3>

            <p className="text-xs text-slate-600">
              Event: <strong>{overrideModal.event?.name}</strong>. Provide an official justification reason. This action will be recorded in the system audit log.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Justification Reason *
              </label>
              <textarea
                required
                rows={3}
                value={overrideModal.reason}
                onChange={(e) => setOverrideModal({ ...overrideModal, reason: e.target.value })}
                placeholder="e.g. Granted grace period for participating UP Section students due to school assembly..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOverrideModal({ open: false, event: null, reason: '', newClose: '' })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteOverride}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

