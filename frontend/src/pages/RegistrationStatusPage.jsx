import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import SchoolEmblem from '../components/SchoolEmblem';
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  GraduationCap,
  Calendar,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function RegistrationStatusPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('identifier') || '';

  const [identifier, setIdentifier] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusResult, setStatusResult] = useState(null);

  const handleLookup = async (idToSearch) => {
    const query = idToSearch || identifier;
    if (!query.trim()) return;

    setError('');
    setLoading(true);
    setStatusResult(null);

    try {
      const res = await api.get('/auth/registration-status/', {
        params: { identifier: query.trim() }
      });
      setStatusResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'No registration record found for this reference number or email.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      handleLookup(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLookup();
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <SchoolEmblem className="w-16 h-16" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Track Application Status
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            {i18n.language === 'ml' ? t('school_name_ml') : t('school_name')}
          </p>
          <div className="flex justify-center pt-1">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Enter Application Reference Number or Email
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. APP-TCH-2026-1024 or email@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-2xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Checking status...' : 'Check Status'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
              <XCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Result Status Card */}
        {statusResult && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in duration-300">
            {/* Status Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Application Reference
                </span>
                <span className="font-mono font-black text-lg text-slate-900">
                  {statusResult.application_number}
                </span>
              </div>

              <div>
                {statusResult.verification_status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approved & Verified</span>
                  </span>
                )}
                {statusResult.verification_status === 'PENDING' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="w-4 h-4" />
                    <span>Pending Administrative Review</span>
                  </span>
                )}
                {statusResult.verification_status === 'REJECTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                    <XCircle className="w-4 h-4" />
                    <span>Application Rejected</span>
                  </span>
                )}
                {statusResult.verification_status === 'SUSPENDED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Account Suspended</span>
                  </span>
                )}
              </div>
            </div>

            {/* Applicant Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-slate-500 font-semibold mb-0.5">Applicant Name</span>
                <span className="font-bold text-slate-900 text-sm">{statusResult.full_name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-slate-500 font-semibold mb-0.5">Role Applied For</span>
                <span className="font-bold text-indigo-700 text-sm uppercase">{statusResult.role}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-slate-500 font-semibold mb-0.5">Submission Date</span>
                <span className="font-semibold text-slate-800">
                  {statusResult.applied_at ? new Date(statusResult.applied_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-slate-500 font-semibold mb-0.5">Verification Date</span>
                <span className="font-semibold text-slate-800">
                  {statusResult.verified_at ? new Date(statusResult.verified_at).toLocaleDateString() : 'Pending'}
                </span>
              </div>
            </div>

            {/* Rejection Notice if rejected */}
            {statusResult.verification_status === 'REJECTED' && statusResult.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-1">
                <span className="block text-xs font-bold text-red-800 uppercase tracking-wide">
                  Official Rejection Reason
                </span>
                <p className="text-xs text-red-700">
                  {statusResult.rejection_reason}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Please contact the school office at Latin Church Road, Thrissur or re-apply with corrected credentials.
                </p>
              </div>
            )}

            {/* Parent's Children Linking Status Breakdown */}
            {statusResult.role === 'PARENT' && statusResult.child_requests && statusResult.child_requests.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Student Linking Requests Status</span>
                </h3>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {statusResult.child_requests.map((child, idx) => (
                    <div key={child.id || idx} className="p-3.5 bg-slate-50 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="block font-bold text-slate-900 text-sm">
                          {child.student_name}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Adm: {child.student_admission_number} • Class: {child.class_division} ({child.relationship_type})
                        </span>
                      </div>

                      <div className="text-right">
                        {child.status === 'APPROVED' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            Linked
                          </span>
                        )}
                        {child.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            Verification Pending
                          </span>
                        )}
                        {child.status === 'REJECTED' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <Link
                to="/register"
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
              >
                ← Submit Another Application
              </Link>

              {statusResult.verification_status === 'APPROVED' && (
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

