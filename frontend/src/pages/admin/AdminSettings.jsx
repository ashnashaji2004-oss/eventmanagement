import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import SchoolEmblem from '../../components/SchoolEmblem';
import {
  Settings,
  Shield,
  Calendar,
  Award,
  Clock,
  Save,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Info,
  Check,
  Building
} from 'lucide-react';

export default function AdminSettings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('branding'); // branding | years | scoring | audit
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    school_name: 'Chaldean Syrian Higher Secondary School',
    school_name_ml: 'കൽദായ സുറിയാനി ഹയർ സെക്കൻഡറി സ്കൂൾ',
    school_motto: 'The fear of the Lord is the beginning of wisdom',
    school_motto_ml: 'ദൈവഭയം ജ്ഞാനത്തിന്റെ ആരംഭം',
    school_logo_url: '/cshss-emblem.png',
    academic_year: '2025-2026',
    timezone: 'Asia/Kolkata',
    points_1st: 10,
    points_2nd: 7,
    points_3rd: 5,
    points_participation: 1,
    default_language: 'en'
  });

  // Academic Years state
  const [academicYears, setAcademicYears] = useState([]);
  const [newYearModalOpen, setNewYearModalOpen] = useState(false);
  const [newYearName, setNewYearName] = useState('');
  const [newYearStart, setNewYearStart] = useState('');
  const [newYearEnd, setNewYearEnd] = useState('');
  const [creatingYear, setCreatingYear] = useState(false);
  const [yearError, setYearError] = useState('');

  // Account Security state
  const [credForm, setCredForm] = useState({ current_password: '', new_username: '', new_password: '', confirm_password: '' });
  const [credLoading, setCredLoading] = useState(false);
  const [credSuccess, setCredSuccess] = useState('');
  const [credErrors, setCredErrors] = useState({});
  const [showCurrPwd, setShowCurrPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfPwd, setShowConfPwd] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchSettings();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const fetchSettings = () => {
    setLoading(true);
    api.get('/settings/')
      .then((res) => {
        if (res.data) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch((err) => console.error('Error fetching settings:', err))
      .finally(() => setLoading(false));
  };

  const fetchAcademicYears = () => {
    api.get('/academic-years/')
      .then((res) => {
        setAcademicYears(res.data.results || res.data || []);
      })
      .catch((err) => console.error('Error fetching academic years:', err));
  };

  const fetchAuditLogs = () => {
    setLoadingAudit(true);
    api.get('/audit-logs/')
      .then((res) => {
        setAuditLogs(res.data.results || res.data || []);
      })
      .catch((err) => console.error('Error fetching audit logs:', err))
      .finally(() => setLoadingAudit(false));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess('');
    setSettingsError('');
    try {
      const res = await api.post('/settings/update_settings/', settings);
      setSettings((prev) => ({ ...prev, ...res.data }));
      setSettingsSuccess('School settings and scoring rules updated successfully.');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      setSettingsError(err.response?.data?.error || 'Failed to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    if (!newYearName.trim()) {
      setYearError('Year name is required (e.g. 2026-2027)');
      return;
    }
    setCreatingYear(true);
    setYearError('');
    try {
      await api.post('/academic-years/', {
        name: newYearName.trim(),
        start_date: newYearStart || null,
        end_date: newYearEnd || null,
        is_current: false
      });
      setNewYearModalOpen(false);
      setNewYearName('');
      setNewYearStart('');
      setNewYearEnd('');
      fetchAcademicYears();
    } catch (err) {
      setYearError(err.response?.data?.name?.[0] || err.response?.data?.error || 'Failed to create academic year.');
    } finally {
      setCreatingYear(false);
    }
  };

  const handleSetActiveYear = async (yearId) => {
    try {
      await api.post(`/academic-years/${yearId}/set_current/`);
      fetchAcademicYears();
      fetchSettings();
    } catch (err) {
      console.error('Error setting current academic year:', err);
    }
  };

  // Distinct audit actions
  const auditActions = Array.from(new Set(auditLogs.map((l) => l.action).filter(Boolean)));

  const filteredAuditLogs = auditLogs.filter((log) => {
    const q = auditSearch.toLowerCase();
    const matchesSearch =
      log.action?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      log.actor_username?.toLowerCase().includes(q) ||
      log.target_model?.toLowerCase().includes(q);

    const matchesAction = auditActionFilter === 'ALL' || log.action === auditActionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shadow-sm">
              <Settings className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Application Settings & Governance
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Chaldean Syrian Higher Secondary School branding, academic years, scoring matrix, and audit ledger.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('branding')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'branding'
              ? 'border-amber-600 text-amber-700 bg-amber-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          School Branding & Profile
        </button>

        <button
          onClick={() => setActiveTab('years')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'years'
              ? 'border-amber-600 text-amber-700 bg-amber-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Academic Years
        </button>

        <button
          onClick={() => setActiveTab('scoring')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'scoring'
              ? 'border-amber-600 text-amber-700 bg-amber-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Scoring Matrix & Points
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-amber-600 text-amber-700 bg-amber-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Audit Trail & Security Logs
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-rose-600 text-rose-700 bg-rose-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCog className="w-4 h-4" />
          Account Security
        </button>
      </div>

      {/* Feedback Alerts */}
      {settingsSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          {settingsSuccess}
        </div>
      )}
      {settingsError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          {settingsError}
        </div>
      )}

      {/* TAB 1: School Branding & Profile */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-slate-50 border border-amber-200/60">
            <SchoolEmblem size="xl" showLabel={false} />
            <div className="space-y-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                Official Heritage Institution
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Chaldean Syrian Higher Secondary School
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Thrissur, Kerala • Established 1927 • CBSE Affiliation & State Board
              </p>
              <div className="pt-2 text-xs text-amber-900 bg-amber-100/50 p-2.5 rounded-xl border border-amber-200">
                <strong>Authentic Emblem Notice:</strong> Per strict school identity guidelines, the official emblem is verified from <code className="font-mono bg-white px-1 py-0.5 rounded">/cshss-emblem.png</code>. AI-generated, distorted, or redesigned crests are strictly forbidden.
              </div>
            </div>
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School Name English */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  School Name (English)
                </label>
                <input
                  type="text"
                  value={settings.school_name}
                  onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              {/* School Name Malayalam */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  സ്കൂളിന്റെ പേര് (Malayalam)
                </label>
                <input
                  type="text"
                  value={settings.school_name_ml}
                  onChange={(e) => setSettings({ ...settings, school_name_ml: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-malayalam"
                  required
                />
              </div>

              {/* School Motto English */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  School Motto (English)
                </label>
                <input
                  type="text"
                  value={settings.school_motto}
                  onChange={(e) => setSettings({ ...settings, school_motto: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              {/* School Motto Malayalam */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  സ്കൂൾ ആപ്തവാക്യം (Malayalam)
                </label>
                <input
                  type="text"
                  value={settings.school_motto_ml}
                  onChange={(e) => setSettings({ ...settings, school_motto_ml: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-malayalam"
                  required
                />
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Timezone
                </label>
                <input
                  type="text"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  disabled
                />
                <span className="text-[11px] text-slate-400">Locked to Indian Standard Time (IST - Asia/Kolkata).</span>
              </div>

              {/* Default Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Language
                </label>
                <select
                  value={settings.default_language}
                  onChange={(e) => setSettings({ ...settings, default_language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                >
                  <option value="en">English (Default)</option>
                  <option value="ml">മലയാളം (Malayalam)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Branding Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Academic Years */}
      {activeTab === 'years' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Academic Years & Historical Records</h2>
              <p className="text-xs text-slate-500">
                Configure academic sessions. Event points and achievements remain archived across historical years.
              </p>
            </div>
            <button
              onClick={() => setNewYearModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Academic Year
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Academic Session</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">End Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academicYears.map((yr) => (
                  <tr key={yr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {yr.name}
                    </td>
                    <td className="px-6 py-4">
                      {yr.is_current ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Active Session
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{yr.start_date || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{yr.end_date || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      {!yr.is_current && (
                        <button
                          onClick={() => handleSetActiveYear(yr.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                        >
                          Set as Active Session
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Year Modal */}
          {newYearModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add Academic Year</h3>
                    <p className="text-xs text-slate-500">Create a new academic calendar period</p>
                  </div>
                </div>

                {yearError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {yearError}
                  </div>
                )}

                <form onSubmit={handleCreateYear} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Year Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newYearName}
                      onChange={(e) => setNewYearName(e.target.value)}
                      placeholder="e.g. 2026-2027"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={newYearStart}
                        onChange={(e) => setNewYearStart(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={newYearEnd}
                        onChange={(e) => setNewYearEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setNewYearModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingYear}
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {creatingYear ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Create Year
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Scoring Matrix & Points */}
      {activeTab === 'scoring' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">House Competition Points Matrix</h2>
            <p className="text-xs text-slate-500 mt-1">
              Standard point allocation rules awarded automatically to the 4 houses (Red, Blue, Yellow, Green) when event winners are published.
            </p>
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                <div className="text-xs font-semibold text-amber-800 mb-1">1st Place (First)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.points_1st}
                    onChange={(e) => setSettings({ ...settings, points_1st: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg"
                  />
                  <span className="text-xs text-amber-700 font-semibold">pts</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-1">2nd Place (Second)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.points_2nd}
                    onChange={(e) => setSettings({ ...settings, points_2nd: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg"
                  />
                  <span className="text-xs text-slate-600 font-semibold">pts</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/20 border border-slate-200">
                <div className="text-xs font-semibold text-amber-900 mb-1">3rd Place (Third)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.points_3rd}
                    onChange={(e) => setSettings({ ...settings, points_3rd: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg"
                  />
                  <span className="text-xs text-slate-600 font-semibold">pts</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-1">Participation Point</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={settings.points_participation}
                    onChange={(e) => setSettings({ ...settings, points_participation: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg"
                  />
                  <span className="text-xs text-slate-600 font-semibold">pts</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-800 space-y-1">
              <div className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Section Scoring Separation Rules:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-blue-700 pl-1">
                <li>UP Section events (Classes 5-7) contribute to the UP Section House Trophy and the Overall Championship.</li>
                <li>High School events (Classes 8-12) contribute to the High School House Trophy and the Overall Championship.</li>
                <li>All house points adjustments must be authorized and recorded in the permanent audit ledger.</li>
              </ul>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Scoring Matrix
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Audit Logs & Security Ledger */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit records, actor, action, details..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">Action: All</option>
                {auditActions.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchAuditLogs}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                title="Refresh Audit Logs"
              >
                <RefreshCw className={`w-4 h-4 ${loadingAudit ? 'animate-spin text-amber-600' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loadingAudit ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Loading audit logs...</p>
              </div>
            ) : filteredAuditLogs.length === 0 ? (
              <div className="py-16 text-center">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">No audit logs found</p>
                <p className="text-slate-400 text-xs mt-1">Actions performed across the system will be recorded here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Actor</th>
                      <th className="px-6 py-3.5">Action</th>
                      <th className="px-6 py-3.5">Target</th>
                      <th className="px-6 py-3.5">Details</th>
                      <th className="px-6 py-3.5">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 font-mono">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{log.actor_username || 'System'}</span>
                          {log.actor_role && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                              {log.actor_role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-slate-700">
                          {log.target_model ? (
                            <span>
                              {log.target_model} <span className="font-mono text-slate-400">#{log.target_id}</span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-slate-800 max-w-xs truncate" title={log.details}>
                          {log.details || '—'}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                          {log.ip_address || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

