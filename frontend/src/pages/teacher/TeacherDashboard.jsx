import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import CountdownTimer from '../../components/CountdownTimer';
import {
  LayoutDashboard,
  Calendar,
  Award,
  Users,
  Clock,
  ArrowRight,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats/')
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading teacher dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <LayoutDashboard className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Teacher Management Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Coordinating events, enrolling participants, recording results, managing student records, and issuing certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/teacher/students"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all"
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Student Records</span>
          </Link>
          <Link
            to="/teacher/certificates"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Certificates Registry</span>
          </Link>
          <Link
            to="/teacher/results"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Enter Marks & Results</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Events</span>
          <span className="text-3xl font-black text-slate-900 block">{stats?.total_events || stats?.assigned_events_count || 0}</span>
          <span className="text-xs text-indigo-600 font-medium">Competitions scheduled</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Open for Reg.</span>
          <span className="text-3xl font-black text-emerald-600 block">{stats?.open_registrations || 0}</span>
          <span className="text-xs text-emerald-700 font-medium">Active registration windows</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Students</span>
          <span className="text-3xl font-black text-blue-600 block">{stats?.total_students || 0}</span>
          <span className="text-xs text-blue-700 font-medium">Enrolled student records</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Certificates Issued</span>
          <span className="text-3xl font-black text-amber-600 block">{stats?.certificates_issued || 0}</span>
          <span className="text-xs text-amber-700 font-medium">Verified credentials</span>
        </div>
      </div>

      {/* Assigned Events Spotlight */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Events & Competitions</h2>
            <p className="text-xs text-slate-500">Track deadlines, enroll students, and submit results.</p>
          </div>
          <Link to="/teacher/events" className="text-xs font-bold text-indigo-600 hover:underline">
            View All Events →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats?.assigned_events?.map((ev) => (
            <div key={ev.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                  {ev.category_name}
                </span>
                <CountdownTimer
                  closeDate={ev.registration_close_date}
                  isOverridden={ev.is_registration_overridden}
                  status={ev.status}
                />
              </div>

              <h3 className="font-extrabold text-base text-slate-900">{ev.name}</h3>

              <div className="text-xs text-slate-500 space-y-1">
                <p>Date: <strong>{ev.event_date}</strong> ({ev.start_time?.slice(0, 5)}) • Venue: <strong>{ev.venue}</strong></p>
                <p>Enrolled: <strong>{ev.participants_count || 0} participants</strong></p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Link
                  to={`/teacher/participants?event=${ev.id}`}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                >
                  Manage Participants
                </Link>
                <Link
                  to={`/teacher/results?event=${ev.id}`}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors"
                >
                  Enter Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
