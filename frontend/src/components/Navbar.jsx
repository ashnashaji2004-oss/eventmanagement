import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import SchoolEmblem from './SchoolEmblem';
import {
  Trophy,
  Calendar,
  Award,
  Tv,
  LayoutDashboard,
  Users,
  GraduationCap,
  FileCheck,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  Building,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout, isAdmin, isTeacher, isParent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Authentic School Branding */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <SchoolEmblem className="w-10 h-10 group-hover:scale-105 transition-transform shrink-0" />
              <div className="flex flex-col justify-center">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors leading-none">
                  {t('app_name')}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 tracking-wide leading-tight truncate max-w-[190px] sm:max-w-[260px] mt-0.5">
                  {i18n.language === 'ml' ? t('school_name_ml') : 'Chaldean Syrian HSS, Thrissur'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/events"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/events')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t('nav.events')}</span>
            </Link>

            <Link
              to="/scoreboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/scoreboard')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{t('nav.scoreboard')}</span>
            </Link>

            <Link
              to="/projector/scoreboard"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
              title="Full-Screen Projector Scoreboard"
            >
              <Tv className="w-4 h-4" />
              <span>{t('nav.projector')}</span>
            </Link>

            <Link
              to="/registration-status"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive('/registration-status')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.status') || 'Check Status'}</span>
            </Link>

            {/* Authenticated Role-Specific Links */}
            {isAuthenticated && (
              <>
                {/* Admin Navigation */}
                {isAdmin && (
                  <>
                    <div className="h-5 w-px bg-slate-200 mx-1" />
                    <Link
                      to="/admin/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 ${isActive('/admin/dashboard')
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-purple-700 hover:bg-purple-50'
                        }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                    <Link
                      to="/admin/events"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/admin/events')
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>{t('nav.events') || 'Events'}</span>
                    </Link>
                    <Link
                      to="/admin/registrations"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/admin/registrations')
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>{t('nav.registrations')}</span>
                    </Link>
                    <Link
                      to="/admin/students"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/admin/students')
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span>{t('nav.students')}</span>
                    </Link>
                    <Link
                      to="/admin/results"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/admin/results')
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>{t('nav.results')}</span>
                    </Link>
                    <Link
                      to="/admin/houses"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/admin/houses')
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Building className="w-4 h-4 text-rose-600" />
                      <span>{t('nav.houses')}</span>
                    </Link>
                    <Link
                      to="/admin/certificates"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/admin/certificates')
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>{t('nav.certificates')}</span>
                    </Link>
                    <Link
                      to="/admin/settings"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/admin/settings')
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>{t('nav.settings')}</span>
                    </Link>
                  </>
                )}

                {/* Teacher Navigation */}
                {isTeacher && !isAdmin && (
                  <>
                    <div className="h-5 w-px bg-slate-200 mx-1" />
                    <Link
                      to="/teacher/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/teacher/dashboard')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                    <Link
                      to="/teacher/events"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/teacher/events')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>Events</span>
                    </Link>
                    <Link
                      to="/teacher/students"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/teacher/students')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span>Students</span>
                    </Link>
                    <Link
                      to="/teacher/results"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/teacher/results')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Results</span>
                    </Link>
                    <Link
                      to="/teacher/certificates"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/teacher/certificates')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <FileCheck className="w-4 h-4 text-amber-500" />
                      <span>Certificates</span>
                    </Link>
                  </>
                )}

                {/* Parent Navigation */}
                {isParent && (
                  <>
                    <div className="h-5 w-px bg-slate-200 mx-1" />
                    <Link
                      to="/parent/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/parent/dashboard')
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                    <Link
                      to="/parent/children"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/parent/children')
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{t('nav.my_children')}</span>
                    </Link>
                    <Link
                      to="/parent/certificates"
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive('/parent/certificates')
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>{t('nav.certificates')}</span>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right side: Language Switcher + User Profile / Registration / Login */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-800 leading-tight">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                  </span>
                  <span className={`inline-block px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider rounded ${isAdmin ? 'bg-purple-100 text-purple-800' : isTeacher ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                    {user?.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs font-bold shadow-2xs transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('nav.register')}</span>
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('nav.login')}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t('nav.events')}
          </Link>
          <Link
            to="/scoreboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t('nav.scoreboard')}
          </Link>
          <Link
            to="/projector/scoreboard"
            target="_blank"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            {t('nav.projector')}
          </Link>
          <Link
            to="/registration-status"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50"
          >
            {t('nav.status') || 'Check Status'}
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="px-3 py-1 bg-slate-50 rounded-lg">
                <span className="block text-xs font-bold text-slate-800">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-600">
                  {user?.role}
                </span>
              </div>

              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-purple-700">Admin Dashboard</Link>
                  <Link to="/admin/events" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Manage Events</Link>
                  <Link to="/admin/registrations" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Registrations</Link>
                  <Link to="/admin/students" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Students</Link>
                  <Link to="/admin/results" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Results</Link>
                  <Link to="/admin/houses" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Houses & Points</Link>
                  <Link to="/admin/certificates" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Certificates</Link>
                  <Link to="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Settings</Link>
                </>
              )}

              {isTeacher && !isAdmin && (
                <>
                  <Link to="/teacher/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Teacher Dashboard</Link>
                  <Link to="/teacher/events" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Events & Deadlines</Link>
                  <Link to="/teacher/students" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Students</Link>
                  <Link to="/teacher/results" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Results</Link>
                  <Link to="/teacher/certificates" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Certificates</Link>
                </>
              )}

              {isParent && (
                <>
                  <Link to="/parent/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Parent Dashboard</Link>
                  <Link to="/parent/children" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">My Children</Link>
                  <Link to="/parent/certificates" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Certificates</Link>
                </>
              )}

              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg border border-indigo-300 text-indigo-700 text-center text-xs font-bold"
              >
                {t('nav.register')}
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg bg-indigo-600 text-white text-center text-xs font-bold"
              >
                {t('nav.login')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
