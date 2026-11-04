import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import SchoolEmblem from '../../components/SchoolEmblem';
import {
  Users,
  GraduationCap,
  Calendar,
  Award,
  ShieldCheck,
  FileCheck,
  Building,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRankTab, setActiveRankTab] = useState('overall'); // 'overall' | 'up' | 'hs'

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentRankings = activeRankTab === 'overall'
    ? stats?.house_rankings
    : activeRankTab === 'up'
    ? stats?.up_rankings
    : stats?.hs_rankings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with School Identity */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <SchoolEmblem className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 p-2 rounded-2xl" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-amber-950">
                Principal & Administrator Portal
              </span>
              <span className="text-xs text-purple-200 font-mono">
                Year: {stats?.academic_year || '2025-2026'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {i18n.language === 'ml' ? t('school_name_ml') : t('school_name')}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200">
              {i18n.language === 'ml' ? t('school_motto_ml') : t('school_motto')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/registrations"
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Manage Registrations ({stats?.pending_registration_requests || 0})</span>
          </Link>
          <Link
            to="/projector/scoreboard"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
          >
            <span>Live Projector</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Critical Pending Approvals Alert Bar */}
      {(stats?.pending_registration_requests > 0 || stats?.pending_child_links > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Pending Faculty & Parent Verifications
              </h3>
              <p className="text-xs text-amber-800">
                {stats?.pending_teachers || 0} teachers & {stats?.pending_parents || 0} parents pending review • {stats?.pending_child_links || 0} child linking requests pending approval.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin/registrations"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Requests</span>
            </Link>
          </div>
        </div>
      )}

      {/* Primary KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 leading-tight">
              {stats?.total_students || 0}
            </span>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <span className="block text-[11px] text-blue-600 font-semibold pt-0.5">
              UP: {stats?.section_stats?.up_students || 0} • HS: {stats?.section_stats?.hs_students || 0}
            </span>
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 leading-tight">
              {stats?.total_teachers || 0}
            </span>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Faculty / Teachers
            </span>
            <span className="block text-[11px] text-purple-600 font-semibold pt-0.5">
              {stats?.pending_teachers || 0} pending review
            </span>
          </div>
        </div>

        {/* Parents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 leading-tight">
              {stats?.total_parents || 0}
            </span>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verified Parents
            </span>
            <span className="block text-[11px] text-emerald-600 font-semibold pt-0.5">
              {stats?.pending_parents || 0} pending review
            </span>
          </div>
        </div>

        {/* Certificates Issued */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 leading-tight">
              {stats?.total_certificates || 0}
            </span>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Issued Certificates
            </span>
            <span className="block text-[11px] text-amber-600 font-semibold pt-0.5">
              Digitally verified & signed
            </span>
          </div>
        </div>
      </div>

      {/* Section Overview & Events Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* UP Section Stats Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                UP
              </div>
              <h2 className="font-bold text-slate-900 text-base">
                UP Section (Classes 5-7)
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 text-blue-900">
              Primary Wing
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-blue-100">
              <span className="block text-2xl font-black text-blue-950">
                {stats?.section_stats?.up_students || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">UP Students</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-100">
              <span className="block text-2xl font-black text-blue-950">
                {stats?.section_stats?.up_events || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">UP Competitions</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/events"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              <span>View UP Section Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* High School Section Stats Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                HS
              </div>
              <h2 className="font-bold text-slate-900 text-base">
                High School Section (8-12)
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
              Senior Wing
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <span className="block text-2xl font-black text-emerald-950">
                {stats?.section_stats?.hs_students || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">HS Students</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <span className="block text-2xl font-black text-emerald-950">
                {stats?.section_stats?.hs_events || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">HS Competitions</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/events"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              <span>View High School Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Overall Events Quick Counter */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-700" />
              <h2 className="font-bold text-slate-900 text-base">
                All Events Overview
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-900">
              {stats?.total_events || 0} Total
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-white rounded-lg border border-purple-100">
              <span className="text-slate-600">Upcoming / Active Registration:</span>
              <span className="font-bold text-indigo-700">{stats?.upcoming_events || 0}</span>
            </div>
            <div className="flex justify-between p-2 bg-white rounded-lg border border-purple-100">
              <span className="text-slate-600">Completed & Results Published:</span>
              <span className="font-bold text-emerald-700">{stats?.completed_events || 0}</span>
            </div>
            <div className="flex justify-between p-2 bg-white rounded-lg border border-purple-100">
              <span className="text-slate-600">Draft Events (Pending Approval):</span>
              <span className="font-bold text-amber-700">{stats?.pending_event_approvals || 0}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/events"
              className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              <span>Browse Public Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* House Standings & Championship Leaderboard */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>Four-House Championship Standings</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live official rankings for Orange, Blue, Yellow, and Green Houses across school events.
            </p>
          </div>

          {/* Section Filter Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveRankTab('overall')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeRankTab === 'overall'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏆 Overall
            </button>
            <button
              type="button"
              onClick={() => setActiveRankTab('up')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeRankTab === 'up'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📘 UP Section
            </button>
            <button
              type="button"
              onClick={() => setActiveRankTab('hs')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeRankTab === 'hs'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📗 High School
            </button>
          </div>
        </div>

        {/* 4 House Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentRankings?.map((h) => (
            <div
              key={h.id}
              className="rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between"
              style={{
                borderColor: `${h.color_code}40`,
                backgroundColor: `${h.color_code}08`
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xs"
                  style={{ backgroundColor: h.color_code }}
                >
                  #{h.rank}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {h.first_places || 0} Wins (1st)
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900">
                  {h.name} House
                </h3>
                <span className="block text-3xl font-black text-slate-900" style={{ color: h.color_code }}>
                  {h.points || 0} <span className="text-xs font-semibold text-slate-500">pts</span>
                </span>
                <span className="block text-[11px] text-slate-500 truncate">
                  Captain: {h.captain_name || 'Assigned'}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <Link
                  to="/admin/houses"
                  className="font-bold hover:underline text-indigo-700 flex items-center gap-1"
                >
                  <span>View House Standings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Recent Activities & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audit Trail */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Recent System Audit Trail</span>
            </h2>
            <Link to="/admin/settings" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View All Logs →
            </Link>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {stats?.recent_activities?.length > 0 ? (
              stats.recent_activities.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 uppercase tracking-wide">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {log.details}
                  </p>
                  <span className="block text-[10px] text-slate-400">
                    User: {log.username || 'System'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No recent audit logs.</p>
            )}
          </div>
        </div>

        {/* Notifications & Pending Requests */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Administrative Notifications</span>
            </h2>
            <Link to="/admin/registrations" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View Requests →
            </Link>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {stats?.recent_notifications?.length > 0 ? (
              stats.recent_notifications.map((notif) => (
                <div key={notif.id} className="p-3 bg-amber-50/50 rounded-xl text-xs space-y-1 border border-amber-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {i18n.language === 'ml' && notif.title_ml ? notif.title_ml : notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {i18n.language === 'ml' && notif.message_ml ? notif.message_ml : notif.message}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No notifications at present.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

