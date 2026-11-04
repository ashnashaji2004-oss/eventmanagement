import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import SchoolEmblem from '../components/SchoolEmblem';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  Sparkles
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      if (user.role === 'ADMIN' || user.is_superuser) {
        navigate('/admin/dashboard');
      } else if (user.role === 'PARENT') {
        navigate('/parent/dashboard');
      } else {
        navigate('/teacher/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const data = err.response?.data;
      if (!err.response) {
        setError('Cannot connect to backend server. Please verify the backend API service is running.');
      } else if (err.response.status === 404) {
        setError('Backend API not found (404). The Django backend is not deployed at this URL. If on Vercel, please deploy the backend or configure VITE_API_BASE_URL.');
      } else if (err.response.status === 500) {
        setError('Backend server error (500). Please check Django backend logs.');
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data?.non_field_errors) {
        setError(Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : String(data.non_field_errors));
      } else if (['binu', 'admin'].includes(username.trim().toLowerCase())) {
        setError('Invalid administrator credentials. Please check your password (default: Binu@123 or Admin@123).');
      } else {
        setError('Invalid username or password. (Note: Newly registered Teachers and Parents require Administrator approval).');
      }
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Card Header with School Emblem */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <SchoolEmblem className="w-16 h-16" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to {t('app_name')}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            {i18n.language === 'ml' ? t('school_name_ml') : t('school_name')}
          </p>
          <p className="text-[11px] text-amber-700 font-medium">
            {i18n.language === 'ml' ? t('school_motto_ml') : t('school_motto')}
          </p>
          <div className="pt-1 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Quick Demo Credentials Switcher: Admin, Teacher, Parent */}
        <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick One-Click Demo Access
            </span>
            <span className="text-[10px] text-slate-400">Click to fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoAccount('binu', 'Binu@123')}
              className="py-2 px-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex flex-col items-center justify-center text-center"
              title="Admin: binu / Binu@123"
            >
              <span>👑 Admin</span>
              <span className="text-[10px] font-mono font-normal text-purple-500 truncate max-w-full">binu</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('teacher', 'Teacher@123')}
              className="py-2 px-2 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex flex-col items-center justify-center text-center"
              title="Teacher: teacher / Teacher@123"
            >
              <span>🎓 Teacher</span>
              <span className="text-[10px] font-mono font-normal text-indigo-500 truncate max-w-full">teacher</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('parent', 'Parent@123')}
              className="py-2 px-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex flex-col items-center justify-center text-center"
              title="Parent: parent / Parent@123"
            >
              <span>👨‍👩‍👦 Parent</span>
              <span className="text-[10px] font-mono font-normal text-emerald-500 truncate max-w-full">parent</span>
            </button>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin, or your registered username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration Options */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Need a new account?</span>
              <Link
                to="/register"
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Apply for Registration</span>
              </Link>
            </div>
          </div>

          {/* User Roles Note */}
          <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Strictly three authorized roles: <strong>Admin</strong>, <strong>Teacher</strong>, and <strong>Parent</strong>. In accordance with school regulations, there is no student login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
