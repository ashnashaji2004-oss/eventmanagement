import React from 'react';
import { Trophy, Shield, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Trophy className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">{t('app_name')}</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              {i18n.language === 'ml' ? t('school_name_ml') : t('school_name')}
              <br />
              {t('app_subtitle')}. Empowering students, teachers, and parents with live scoring, achievement tracking, and verified certificates.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-3 h-3 rounded-full bg-red-500" title="Red House"></span>
              <span className="w-3 h-3 rounded-full bg-blue-500" title="Blue House"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500" title="Yellow House"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500" title="Green House"></span>
              <span className="text-xs text-slate-400 font-medium ml-1">Four Houses: Red, Blue, Yellow, Green</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Portals & Modes
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/scoreboard" className="hover:text-white transition-colors">
                  {t('houses.live_scoreboard')}
                </a>
              </li>
              <li>
                <a href="/projector/scoreboard" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>{t('nav.projector')}</span>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded font-mono">LIVE</span>
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-white transition-colors">
                  {t('events.all_events')}
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & System */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Privacy & Standards
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Protected Student Records</span>
              </li>
              <li>Official School Certificates</li>
              <li>Bilingual EN / മലയാളം Engine</li>
              <li>Backend Registration Deadlines</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t('school_name')} • SchoolFest Management System.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Built with <span>Care for Excellence</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
