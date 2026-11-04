import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import {
  Award,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Send,
  Download,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ResultsEntry() {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('event') || '';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    student: '',
    marks_obtained: '',
    max_marks: '100',
    position: '1ST',
    award: 'First Prize',
    award_ml: 'ഒന്നാം സമ്മാനം',
    grade: 'A+',
    judge_comments: '',
    certificate_eligible: true
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/events/')
      .then((res) => {
        const evList = res.data.results || res.data || [];
        setEvents(evList);
        if (evList.length > 0 && !selectedEventId) {
          setSelectedEventId(evList[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const fetchResultsAndParticipants = (eventId) => {
    if (!eventId) return;
    Promise.all([
      api.get(`/results/?event=${eventId}`),
      api.get(`/participants/?event=${eventId}`)
    ])
      .then(([resRes, partRes]) => {
        setResults(resRes.data.results || resRes.data || []);
        const partList = partRes.data.results || partRes.data || [];
        setParticipants(partList);
        if (partList.length > 0 && !formData.student) {
          setFormData((prev) => ({ ...prev, student: partList[0].student }));
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchResultsAndParticipants(selectedEventId);
    }
  }, [selectedEventId]);

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/results/', {
        ...formData,
        event: selectedEventId
      });
      setSuccess('Result recorded and submitted for Admin approval!');
      fetchResultsAndParticipants(selectedEventId);
      setFormData({
        student: participants[0]?.student || '',
        marks_obtained: '',
        max_marks: '100',
        position: 'NONE',
        award: '',
        award_ml: '',
        grade: '',
        judge_comments: '',
        certificate_eligible: true
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit result.');
    }
  };

  const handleExportResults = () => {
    if (!selectedEventId) return;
    window.open(`/api/reports/events/${selectedEventId}/export/`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Competition Marks & Results Entry
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Record marks, 1st/2nd/3rd places, grades, and submit official competition results for administrative approval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportResults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Event CSV</span>
          </button>

          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} ({ev.category_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Record Marks Form Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>Enter Winner / Marks Record</span>
        </h3>

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitResult} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student Competitor
              </label>
              <select
                required
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- Choose Enrolled Student --</option>
                {participants.map((p) => {
                  const s = p.student_details || {};
                  return (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.house_name} House, Class {s.class_name}-{s.division})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Position / Rank
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
              >
                <option value="1ST">1st Place (First Prize)</option>
                <option value="2ND">2nd Place (Second Prize)</option>
                <option value="3RD">3rd Place (Third Prize)</option>
                <option value="PARTICIPATION">Participation</option>
                <option value="NONE">None / Grade Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Marks Obtained (out of 100)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={formData.marks_obtained}
                  onChange={(e) => setFormData({ ...formData, marks_obtained: e.target.value })}
                  placeholder="e.g. 96.5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="Grade (A+)"
                  className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-sm text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Award Title (English)
              </label>
              <input
                type="text"
                value={formData.award}
                onChange={(e) => setFormData({ ...formData, award: e.target.value })}
                placeholder="e.g. Gold Medal & First Prize"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Award Title in Malayalam (മലയാളം)
              </label>
              <input
                type="text"
                value={formData.award_ml}
                onChange={(e) => setFormData({ ...formData, award_ml: e.target.value })}
                placeholder="e.g. സ്വർണ്ണ മെഡലും ഒന്നാം സമ്മാനവും"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Judge's Evaluation Comments
            </label>
            <input
              type="text"
              value={formData.judge_comments}
              onChange={(e) => setFormData({ ...formData, judge_comments: e.target.value })}
              placeholder="Comments on technique, presentation, rhythm, sprint timing..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.certificate_eligible}
                onChange={(e) => setFormData({ ...formData, certificate_eligible: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Generate Official Certificate upon Admin Approval</span>
            </label>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Result for Approval</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">
            Recorded Event Results ({results.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Student & House</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Award Title</th>
                <th className="py-3 px-4">Marks & Grade</th>
                <th className="py-3 px-4">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {results.map((r) => {
                const s = r.student_details || {};
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">{s.full_name}</span>
                      {s.house_name && (
                        <div className="mt-1">
                          <HouseBadge houseName={s.house_name} size="sm" />
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 font-black text-amber-600">
                      {r.position}
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <span className="font-semibold text-slate-800 block">{r.award || '-'}</span>
                      {r.award_ml && <span className="text-slate-500 block">{r.award_ml}</span>}
                    </td>

                    <td className="py-4 px-4 text-xs font-mono">
                      <span className="font-bold text-slate-800">{r.marks_obtained ? `${r.marks_obtained}/${r.max_marks}` : '-'}</span>
                      {r.grade && <span className="block text-slate-500 font-sans font-semibold">({r.grade})</span>}
                    </td>

                    <td className="py-4 px-4">
                      {r.is_published ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Published & Awarded
                        </span>
                      ) : r.approval_status === 'APPROVED' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Approved
                        </span>
                      ) : r.approval_status === 'REJECTED' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Approval
                        </span>
                      )}
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
