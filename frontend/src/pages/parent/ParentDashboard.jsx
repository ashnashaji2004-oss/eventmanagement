import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import {
  Users,
  Award,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ParentDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats/'),
      api.get('/parent/children/')
    ])
      .then(([statsRes, childRes]) => {
        setStats(statsRes.data);
        const childList = childRes.data?.results || (Array.isArray(childRes.data) ? childRes.data : []);
        setChildren(childList);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading parent portal...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('parent.welcome')}, {user?.first_name || user?.username}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Access achievements, schedules, and verified certificates for your linked children.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/parent/certificates"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Award className="w-4 h-4" />
            <span>{t('parent.view_certificates')}</span>
          </Link>
        </div>
      </div>

      {/* Linked Children Profiles Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{t('parent.linked_children')}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
            {children.length}
          </span>
        </h2>

        {children.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
            <p className="font-semibold text-slate-700">{t('parent.no_children')}</p>
            <p className="text-xs text-slate-500">Please contact the school office with your admission number to link your ward.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((item) => {
              const s = item.student;
              return (
                <div
                  key={item.relationship_id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <HouseBadge houseName={s.house_name} size="sm" />
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        {s.admission_number}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-xl text-slate-900">{s.full_name}</h3>
                      {s.malayalam_name && (
                        <span className="text-xs font-semibold text-slate-500 block">
                          {s.malayalam_name}
                        </span>
                      )}
                      <p className="text-xs text-slate-600 mt-1">
                        Class <strong>{s.class_name}-{s.division}</strong> • Relationship: <strong>{item.relationship_type}</strong>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl text-center">
                        <span className="block font-black text-base text-slate-900">{item.certificates_count}</span>
                        <span className="text-slate-500 text-[11px]">Certificates</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl text-center">
                        <span className="block font-black text-base text-slate-900">{item.events_count}</span>
                        <span className="text-slate-500 text-[11px]">Participations</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/parent/child-achievements/${s.id}`}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View Achievement Portfolio</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Published Achievements */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Recent Official Achievements</span>
          </h2>
          <Link to="/parent/certificates" className="text-xs font-bold text-emerald-600 hover:underline">
            Certificate Gallery →
          </Link>
        </div>

        {stats?.recent_achievements?.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No published results yet for your linked children.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats?.recent_achievements?.map((r) => {
              const s = r.student_details || {};
              return (
                <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{r.event_name}</span>
                      <HouseBadge houseName={s.house_name} size="sm" showIcon={false} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Awarded to <strong>{s.full_name}</strong> • Position: <strong className="text-amber-600">{r.position}</strong> ({r.award})
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Approved & Published
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
