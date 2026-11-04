import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import SchoolEmblem from '../components/SchoolEmblem';
import {
  Trophy,
  Maximize2,
  Minimize2,
  Globe,
  Radio,
  Flame,
  Clock,
  Sparkles,
  GraduationCap,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

const HOUSE_THEMES = {
  Orange: {
    bg: 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-950',
    border: 'border-orange-400/40',
    glow: 'shadow-orange-600/30',
    accent: 'bg-orange-500/30 text-orange-200 border-orange-400/40',
    badge: 'bg-orange-400 text-slate-950',
    text: 'text-orange-100',
    leadGlow: 'ring-4 ring-amber-400 shadow-[0_0_50px_rgba(249,115,22,0.5)]'
  },
  Red: {
    bg: 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-950',
    border: 'border-orange-400/40',
    glow: 'shadow-orange-600/30',
    accent: 'bg-orange-500/30 text-orange-200 border-orange-400/40',
    badge: 'bg-orange-400 text-slate-950',
    text: 'text-orange-100',
    leadGlow: 'ring-4 ring-amber-400 shadow-[0_0_50px_rgba(249,115,22,0.5)]'
  },
  Blue: {
    bg: 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950',
    border: 'border-blue-400/40',
    glow: 'shadow-blue-600/30',
    accent: 'bg-blue-500/30 text-blue-200 border-blue-400/40',
    badge: 'bg-blue-400 text-slate-950',
    text: 'text-blue-100',
    leadGlow: 'ring-4 ring-amber-400 shadow-[0_0_50px_rgba(59,130,246,0.5)]'
  },
  Yellow: {
    bg: 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-950',
    border: 'border-amber-400/40',
    glow: 'shadow-amber-600/30',
    accent: 'bg-amber-400/30 text-amber-100 border-amber-300/40',
    badge: 'bg-amber-300 text-slate-950',
    text: 'text-amber-100',
    leadGlow: 'ring-4 ring-amber-300 shadow-[0_0_50px_rgba(245,158,11,0.5)]'
  },
  Green: {
    bg: 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-950',
    border: 'border-emerald-400/40',
    glow: 'shadow-emerald-600/30',
    accent: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40',
    badge: 'bg-emerald-400 text-slate-950',
    text: 'text-emerald-100',
    leadGlow: 'ring-4 ring-amber-400 shadow-[0_0_50px_rgba(16,185,129,0.5)]'
  }
};

export default function ProjectorScoreboardPage() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [activeSection, setActiveSection] = useState('OVERALL'); // OVERALL | UP | HS
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [prevLeader, setPrevLeader] = useState(null);

  const fetchScoreboard = () => {
    api.get('/scoreboard/')
      .then((res) => {
        const newData = res.data;
        // Check leader of current view
        const currentStandings = activeSection === 'UP'
          ? (newData?.up_standings || [])
          : activeSection === 'HS'
            ? (newData?.hs_standings || [])
            : (newData?.standings || []);

        const currentLeader = currentStandings[0]?.name;
        if (prevLeader && currentLeader && prevLeader !== currentLeader) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
        setPrevLeader(currentLeader);
        setData(newData);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch((err) => console.error('Projector scoreboard fetch error:', err));
  };

  useEffect(() => {
    fetchScoreboard();
    const timer = setInterval(fetchScoreboard, 6000); // Auto-refresh every 6s
    return () => clearInterval(timer);
  }, [activeSection, prevLeader]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ml' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('schoolfest_lang', nextLang);
  };

  const schoolName = i18n.language === 'ml'
    ? (data?.school_name_ml || 'കൽദായ സുറിയാനി ഹയർ സെക്കൻഡറി സ്കൂൾ')
    : (data?.school_name || 'Chaldean Syrian Higher Secondary School');

  const schoolMotto = i18n.language === 'ml'
    ? (data?.school_motto_ml || 'ദൈവഭയം ജ്ഞാനത്തിന്റെ ആരംഭം')
    : (data?.school_motto || 'The fear of the Lord is the beginning of wisdom');

  const currentStandings = activeSection === 'UP'
    ? (data?.up_standings || [])
    : activeSection === 'HS'
      ? (data?.hs_standings || [])
      : (data?.standings || []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none font-sans overflow-hidden">
      {/* Top Projector Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-1 shadow-xl">
            <SchoolEmblem className="w-full h-full" showLabel={false} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              <span>{schoolName}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
              <span className="italic text-amber-200/90 font-serif">"{schoolMotto}"</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">Academic Session {data?.academic_year || '2025-2026'}</span>
            </div>
          </div>
        </div>

        {/* Projector Controls & Section Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Section Switcher Tabs */}
          <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveSection('OVERALL')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSection === 'OVERALL'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Overall
            </button>
            <button
              onClick={() => setActiveSection('UP')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSection === 'UP'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              UP (5-7)
            </button>
            <button
              onClick={() => setActiveSection('HS')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSection === 'HS'
                  ? 'bg-indigo-500 text-white shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              High School (8-12)
            </button>
          </div>

          {/* Live Heartbeat Indicator */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="hidden sm:inline">LIVE</span>
            <span className="text-slate-400 font-sans text-[11px] ml-1">{lastUpdated}</span>
          </div>

          {/* Bilingual Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{i18n.language === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-slate-300 hover:text-white"
            title="Toggle Fullscreen Projector"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main 4 House Cards Display */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {currentStandings.map((house) => {
          const theme = HOUSE_THEMES[house.name] || HOUSE_THEMES.Red;
          const isRank1 = house.rank === 1;

          return (
            <div
              key={house.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between border ${
                theme.border
              } ${theme.bg} shadow-2xl transition-all duration-500 ${
                isRank1 ? theme.leadGlow : 'hover:scale-[1.01]'
              }`}
            >
              {/* Leader Banner */}
              {isRank1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-slate-950 animate-bounce">
                  <Flame className="w-4 h-4 fill-current text-rose-600" />
                  <span>
                    {activeSection === 'UP'
                      ? 'UP SECTION TROPHY LEADER'
                      : activeSection === 'HS'
                        ? 'HIGH SCHOOL TROPHY LEADER'
                        : 'OVERALL CHAMPIONSHIP LEADER'}
                  </span>
                </div>
              )}

              {/* Card Header: Rank & House Name */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-xl ${theme.badge}`}>
                    Rank #{house.rank}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-white/80 font-semibold bg-black/30 px-3 py-1 rounded-xl backdrop-blur-xs">
                    <Trophy className="w-3.5 h-3.5 text-amber-300" />
                    <span>{house.first_places} Wins</span>
                  </div>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
                  {i18n.language === 'ml' && house.name_ml ? house.name_ml : house.name}
                </h2>
                <div className="text-xs uppercase font-bold tracking-widest text-white/60 mt-0.5">
                  {t('houses.house')}
                </div>
                <p className="text-xs italic text-white/80 mt-2 font-serif">
                  "{i18n.language === 'ml' && house.motto_ml ? house.motto_ml : house.motto}"
                </p>
              </div>

              {/* Card Body: Huge Points Display */}
              <div className="my-8 text-center bg-black/25 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-lg">
                  {house.total_points}
                </div>
                <div className="text-xs sm:text-sm font-bold tracking-widest uppercase text-white/70 mt-1">
                  {t('houses.points')}
                </div>
              </div>

              {/* Card Footer: Status Bar */}
              <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
                <span>Section Category</span>
                <span className="font-bold uppercase tracking-wider text-amber-300">
                  {activeSection === 'OVERALL' ? 'Combined (5-12)' : activeSection === 'UP' ? 'UP Section' : 'High School'}
                </span>
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Live Marquee / Ticker */}
      <footer className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-bold text-slate-200">Chaldean Syrian Higher Secondary School, Thrissur (Est. 1927)</span>
          <span className="hidden md:inline">• Official Live Event & Championship Scoreboard</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>Active View: <span className="text-amber-400 font-bold">{activeSection}</span></span>
          <span>Auto-sync interval: 6s</span>
        </div>
      </footer>
    </div>
  );
}
