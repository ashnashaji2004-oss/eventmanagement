import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import SchoolEmblem from '../components/SchoolEmblem';
import HouseBadge from '../components/HouseBadge';
import {
  Trophy,
  Tv,
  ArrowUpRight,
  Clock,
  Sparkles,
  BarChart3,
  Flame,
  Award,
  RefreshCw,
  GraduationCap,
  Building,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function ScoreboardPage() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [activeSection, setActiveSection] = useState('OVERALL'); // OVERALL | UP | HS
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScoreboard = () => {
    setRefreshing(true);
    api.get('/scoreboard/')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchScoreboard();
    const interval = setInterval(fetchScoreboard, 8000); // Polling every 8s
    return () => clearInterval(interval);
  }, []);

  // Fallback 4 houses if data is loading or empty
  const DEFAULT_HOUSES = [
    { id: 1, name: 'Orange', color_code: '#F97316', total_points: 0, first_places: 0, rank: 1, motto: 'Valour and Strength' },
    { id: 2, name: 'Blue', color_code: '#3B82F6', total_points: 0, first_places: 0, rank: 2, motto: 'Loyalty and Truth' },
    { id: 3, name: 'Yellow', color_code: '#F59E0B', total_points: 0, first_places: 0, rank: 3, motto: 'Wisdom and Radiance' },
    { id: 4, name: 'Green', color_code: '#10B981', total_points: 0, first_places: 0, rank: 4, motto: 'Hope and Harmony' },
  ];

  // Determine current active standings based on section filter
  const rawStandings = activeSection === 'UP'
    ? (data?.up_standings || [])
    : activeSection === 'HS'
      ? (data?.hs_standings || [])
      : (data?.standings || []);

  const currentStandings = rawStandings.length > 0 ? rawStandings : DEFAULT_HOUSES;

  const chartData = currentStandings.map((h) => ({
    name: `${h.name} House`,
    points: h.total_points,
    color: h.color_code,
    wins: h.first_places
  }));

  const schoolName = i18n.language === 'ml'
    ? (data?.school_name_ml || 'കൽദായ സുറിയാനി ഹയർ സെക്കൻഡറി സ്കൂൾ')
    : (data?.school_name || 'Chaldean Syrian Higher Secondary School');

  const schoolMotto = i18n.language === 'ml'
    ? (data?.school_motto_ml || 'ദൈവഭയം ജ്ഞാനത്തിന്റെ ആരംഭം')
    : (data?.school_motto || 'The fear of the Lord is the beginning of wisdom');

  const hasPoints = chartData.some((h) => h.points > 0);
  const pieData = hasPoints
    ? chartData
    : chartData.map((h) => ({ ...h, displayPoints: 1 }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & School Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <SchoolEmblem size="lg" showLabel={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                <Trophy className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {schoolName}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 italic mt-0.5">
              "{schoolMotto}" • {t('houses.live_scoreboard')} • Academic Year {data?.academic_year || '2025-2026'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchScoreboard}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <a
            href="/projector/scoreboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Tv className="w-4 h-4" />
            <span>Launch Projector Display</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Section View Selector Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSection('OVERALL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSection === 'OVERALL'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
              }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Overall Championship
          </button>

          <button
            onClick={() => setActiveSection('UP')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSection === 'UP'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
              }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            UP Section (Classes 5-7)
          </button>

          <button
            onClick={() => setActiveSection('HS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSection === 'HS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
              }`}
          >
            <Building className="w-3.5 h-3.5" />
            High School (Classes 8-12)
          </button>
        </div>

        <div className="text-xs text-slate-500 px-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live Scores: <strong className="text-slate-800">{activeSection === 'OVERALL' ? 'All Classes (5-12)' : activeSection === 'UP' ? 'Classes 5-7' : 'Classes 8-12'}</strong></span>
        </div>
      </div>

      {/* Four House Standings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentStandings.map((house) => {
          const isRank1 = house.rank === 1;
          return (
            <div
              key={house.id}
              className={`relative bg-white rounded-3xl p-6 border shadow-sm transition-all hover:shadow-lg ${isRank1 ? 'ring-2 ring-amber-400 border-amber-300' : 'border-slate-200'
                }`}
            >
              {isRank1 && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {activeSection === 'UP'
                      ? 'UP Section Leader'
                      : activeSection === 'HS'
                        ? 'High School Leader'
                        : 'Championship Leader'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mt-1 mb-4">
                <span
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md"
                  style={{ backgroundColor: house.color_code }}
                >
                  #{house.rank}
                </span>
                <div className="text-right">
                  <span className="block text-3xl font-black text-slate-900">{house.total_points}</span>
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    {t('houses.points')}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">{house.name} House</h3>
                <p className="text-xs text-slate-500 italic">
                  "{i18n.language === 'ml' && house.motto_ml ? house.motto_ml : house.motto}"
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{t('houses.wins')} (1st Places):</span>
                <span className="font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {house.first_places}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Charts: Bar Chart & Distribution Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Points Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>
                  {activeSection === 'OVERALL'
                    ? 'Overall Points Comparison'
                    : activeSection === 'UP'
                      ? 'UP Section Points Standing'
                      : 'High School Points Standing'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Accumulated points across {activeSection === 'OVERALL' ? 'all events' : `${activeSection} section events`}
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value) => [`${value} Points`, 'House Score']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="points" minPointSize={4} radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Share of Points Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Points Share</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {activeSection === 'OVERALL' ? 'Overall Championship' : `${activeSection} Section`} distribution
            </p>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey={hasPoints ? "points" : "displayPoints"}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => [hasPoints ? `${value} Pts` : '0 Pts (Awaiting Results)', 'Points']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {chartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-700 truncate font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Ticker */}
      {data?.recent_events && data.recent_events.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Recently Concluded Events</span>
            </h3>
            <span className="text-xs text-slate-400">Live score updates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recent_events.map((ev) => (
              <div key={ev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 truncate">{ev.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {ev.school_section || 'ALL'}
                  </span>
                </div>
                {ev.results && ev.results.length > 0 ? (
                  <div className="text-xs space-y-1">
                    {ev.results.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-600">
                        <span>
                          {r.position === '1ST' ? '🥇' : r.position === '2ND' ? '🥈' : '🥉'} {r.student_name}
                        </span>
                        <span className="font-semibold text-slate-800">{r.house_name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Results pending</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
