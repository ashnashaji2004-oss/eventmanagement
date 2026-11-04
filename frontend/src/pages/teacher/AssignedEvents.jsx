import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import CountdownTimer from '../../components/CountdownTimer';
import {
  Calendar,
  Users,
  Award,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AssignedEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/?teacher=${user?.id}`)
      .then((res) => setEvents(res.data.results || res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Calendar className="w-6 h-6" />
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Coordinated Events
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Review all school competitions assigned to your supervision.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading assigned events...</div>
      ) : events.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <p className="font-semibold text-slate-700">No events currently assigned to your account.</p>
          <p className="text-xs text-slate-500">Contact the festival administrator to assign event coordination.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {ev.category_name}
                  </span>
                  <CountdownTimer
                    closeDate={ev.registration_close_date}
                    isOverridden={ev.is_registration_overridden}
                    status={ev.status}
                  />
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 leading-snug">{ev.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{ev.description}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.event_date} ({ev.start_time?.slice(0, 5)})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.participants_count || 0} participants registered</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  to={`/teacher/participants?event=${ev.id}`}
                  className="w-full py-2 text-center rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
                >
                  Participants
                </Link>
                <Link
                  to={`/teacher/results?event=${ev.id}`}
                  className="w-full py-2 text-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                >
                  Enter Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
