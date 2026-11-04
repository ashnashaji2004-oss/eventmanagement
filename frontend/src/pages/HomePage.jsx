import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import HouseBadge from '../components/HouseBadge';
import CountdownTimer from '../components/CountdownTimer';
import {
  Trophy,
  Calendar,
  Award,
  Tv,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Flame,
  ShieldCheck,
  MapPin,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [scoreboard, setScoreboard] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/scoreboard/'),
      api.get('/events/?upcoming=true')
    ])
      .then(([scoreRes, eventsRes]) => {
        setScoreboard(scoreRes.data);
        const evList = eventsRes.data.results || eventsRes.data;
        setEvents(Array.isArray(evList) ? evList.slice(0, 4) : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const leadingHouse = scoreboard?.leading_house;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-2xl text-center lg:text-left">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Annual School Fest & Sports Meet 2025-2026</span>
            </div> */}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              {i18n.language === 'ml' ? t('school_name_ml') : t('school_name')}
              {/* <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-300 to-indigo-300">
                {t('app_name')} • {t('app_subtitle')}
              </span> */}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Real-time house points tracking for <strong className="text-orange-400">Orange</strong>, <strong className="text-blue-400">Blue</strong>, <strong className="text-amber-400">Yellow</strong>, and <strong className="text-emerald-400">Green</strong> houses. Official achievement certificates, automatic deadlines, and dedicated portals for Admins, Teachers, and Parents.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/scoreboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Trophy className="w-5 h-5 text-slate-950" />
                <span>{t('houses.live_scoreboard')}</span>
              </Link>

              <Link
                to="/projector/scoreboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold border border-indigo-400/30 transition-all"
              >
                <Tv className="w-4 h-4 text-indigo-300" />
                <span>{t('nav.projector')}</span>
              </Link>

              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-xs transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('events.all_events')}</span>
              </Link>
            </div>
          </div>

          {/* Leading House Hero Card */}
          {leadingHouse && (
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-300">
                    {t('houses.leader')}
                  </span>
                </div>
                <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded text-white font-semibold">
                  Rank #1
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl text-2xl font-black"
                  style={{ backgroundColor: leadingHouse.color_code }}
                >
                  <Trophy className="w-8 h-8 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{leadingHouse.name} House</h3>
                  <p className="text-xs text-slate-300 italic">
                    "{i18n.language === 'ml' && leadingHouse.motto_ml ? leadingHouse.motto_ml : leadingHouse.motto}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/10">
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <span className="block text-2xl font-black text-white">{leadingHouse.total_points}</span>
                  <span className="text-xs text-slate-300 font-medium">{t('houses.points')}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <span className="block text-2xl font-black text-amber-300">{leadingHouse.first_places}</span>
                  <span className="text-xs text-slate-300 font-medium">{t('houses.wins')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Four Houses Live Standings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('houses.standings')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Official live points updated instantly from approved event results.
            </p>
          </div>
          <Link
            to="/scoreboard"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            <span>View Full Scoreboard Breakdown</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {scoreboard?.standings?.map((house) => {
            const isLeader = house.rank === 1;
            return (
              <div
                key={house.id}
                className={`relative bg-white rounded-2xl p-6 border shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 ${isLeader ? 'ring-2 ring-amber-400 border-amber-300' : 'border-slate-200'
                  }`}
              >
                {isLeader && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Trophy className="w-3 h-3 text-amber-600" /> Leader
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm"
                    style={{ backgroundColor: house.color_code }}
                  >
                    #{house.rank}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{house.name} House</h3>
                    <span className="text-xs text-slate-500 font-medium">Captain: {house.captain_name || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-medium">{t('houses.points')}</span>
                    <span className="text-2xl font-black text-slate-900">{house.total_points}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{t('houses.wins')} (1st)</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      {house.first_places} wins
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic mt-3 truncate">
                  "{i18n.language === 'ml' && house.motto_ml ? house.motto_ml : house.motto}"
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming Events Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('events.upcoming')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Events scheduled for competition with live registration countdowns.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            <span>{t('events.all_events')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {ev.category_name}
                  </span>
                  <CountdownTimer
                    closeDate={ev.registration_close_date}
                    isOverridden={ev.is_registration_overridden}
                    status={ev.status}
                  />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {i18n.language === 'ml' && ev.name_ml ? ev.name_ml : ev.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {i18n.language === 'ml' && ev.description_ml ? ev.description_ml : ev.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{ev.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.event_date} ({ev.start_time?.slice(0, 5)})</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Classes: <strong className="text-slate-700">{ev.participating_classes}</strong></span>
                <span>Type: <strong className="text-slate-700">{ev.event_type}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights: Security, QR & Bilingual */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Four-House Championship</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automated points tally across UP and High School sections for Red, Blue, Yellow, and Green houses updated instantly from validated results.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Projector Display Mode</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dedicated full-screen scoreboard route optimized for large auditorium projectors with live auto-refresh and high-contrast house colors.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Bilingual Engine (EN & ML)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Seamlessly switch between English and Malayalam (മലയാളം) across certificates, event names, house mottos, and dashboards.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
