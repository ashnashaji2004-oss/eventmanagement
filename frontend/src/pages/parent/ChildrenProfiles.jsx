import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import { Users, Award, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ChildrenProfiles() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/children/')
      .then((res) => {
        const list = res.data?.results || (Array.isArray(res.data) ? res.data : []);
        setChildren(list);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Users className="w-6 h-6" />
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Children Profiles
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Detailed student information, house affiliation, and participation history for your linked wards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(children) && children.map((item) => {
          const s = item.student;
          return (
            <div
              key={item.relationship_id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <HouseBadge houseName={s.house_name} size="md" />
                <span className="text-xs font-mono font-bold text-slate-400">
                  {s.admission_number}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">{s.full_name}</h3>
                {s.malayalam_name && (
                  <span className="text-sm font-semibold text-slate-500 block mt-0.5">
                    {s.malayalam_name}
                  </span>
                )}
                <p className="text-xs text-slate-600 mt-2">
                  Class: <strong>{s.class_name}-{s.division}</strong> • Academic Year: <strong>{s.academic_year}</strong>
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/parent/child-achievements/${s.id}`}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>View Full Achievements & Certificates</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
