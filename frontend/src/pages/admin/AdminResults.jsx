import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Building,
  GraduationCap
} from 'lucide-react';

export default function AdminResults() {
  const { t, i18n } = useTranslation();
  const [results, setResults] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchResults();
  }, [selectedEvent, statusFilter]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/');
      const list = res.data?.results || (Array.isArray(res.data) ? res.data : []);
      setEvents(list);
    } catch (err) {
      console.error(err);
      setEvents([]);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedEvent) params.event = selectedEvent;
      if (statusFilter) params.approval_status = statusFilter;

      const res = await api.get('/results/', { params });
      const list = res.data?.results || (Array.isArray(res.data) ? res.data : []);
      setResults(list);
    } catch (err) {
      setError('Failed to load competition results.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Award className="w-8 h-8 text-emerald-600" />
          <span>Competition Results Directory</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Official competition marks, positions, and house points credited by coordinating teachers. Results are published directly upon teacher score entry.
        </p>
      </div>

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
          {/* Event Selector */}
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All Events & Competitions</option>
            {Array.isArray(events) && events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name} ({ev.school_section})</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All Approval Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved & Published</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
            <span className="text-xs text-slate-400">Loading results...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Student / Participant</th>
                  <th className="py-3.5 px-4">House</th>
                  <th className="py-3.5 px-4">Position & Award</th>
                  <th className="py-3.5 px-4">Marks Obtained</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(results) && results.length > 0 ? (
                  results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {r.event_name || 'N/A'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="block font-bold text-slate-900 text-sm">
                          {r.student_name || r.team_name || 'N/A'}
                        </span>
                        {r.student_admission_number && (
                          <span className="font-mono text-purple-700 text-[11px]">
                            Adm: {r.student_admission_number}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <HouseBadge houseName={r.student_house_name || r.team_house_name} />
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded font-extrabold text-[10px] ${
                          r.position === '1ST' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          r.position === '2ND' ? 'bg-slate-200 text-slate-800' :
                          r.position === '3RD' ? 'bg-amber-700 text-white' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {r.position_display || r.position || 'Participant'}
                        </span>
                        {r.award && (
                          <span className="block text-slate-600 text-[11px] pt-0.5">
                            {r.award}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {r.marks_obtained !== null && r.marks_obtained !== undefined ? `${r.marks_obtained} / ${r.max_marks || 100}` : 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Published & Points Credited</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                      No results found for current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

