import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import {
  Award,
  ShieldCheck,
  XCircle,
  ExternalLink,
  Download,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  Building,
  GraduationCap
} from 'lucide-react';

export default function AdminCertificates() {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [houseFilter, setHouseFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  // Modal states
  const [selectedCert, setSelectedCert] = useState(null);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeError, setRevokeError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const fetchCertificates = () => {
    setLoading(true);
    api.get('/certificates/')
      .then((res) => {
        const data = res.data.results || res.data || [];
        setCertificates(data);
      })
      .catch((err) => console.error('Error fetching certificates:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!revokeReason.trim()) {
      setRevokeError('Revocation reason is required.');
      return;
    }
    setSubmitting(true);
    setRevokeError('');
    try {
      await api.post(`/certificates/${selectedCert.id}/revoke/`, { reason: revokeReason.trim() });
      setRevokeModalOpen(false);
      setRevokeReason('');
      setSelectedCert(null);
      fetchCertificates();
    } catch (err) {
      setRevokeError(err.response?.data?.error || 'Failed to revoke certificate.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async (certId, certNumber) => {
    try {
      const res = await api.get(`/certificates/${certId}/download-pdf/`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${certNumber || certId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download certificate PDF.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Distinct academic years
  const academicYears = Array.from(new Set(certificates.map((c) => c.academic_year || '2025-2026')));

  // Filtering
  const filtered = certificates.filter((c) => {
    const s = c.student_details || {};
    const q = search.toLowerCase();

    // Search query
    const matchesSearch =
      c.certificate_number?.toLowerCase().includes(q) ||
      s.full_name?.toLowerCase().includes(q) ||
      s.admission_number?.toLowerCase().includes(q) ||
      c.event_name?.toLowerCase().includes(q) ||
      c.award_title?.toLowerCase().includes(q);

    // Section filter
    const matchesSection =
      sectionFilter === 'ALL' ||
      (sectionFilter === 'UP' && (s.school_section === 'UP' || ['5', '6', '7'].includes(String(s.standard)))) ||
      (sectionFilter === 'HS' && (s.school_section === 'HS' || ['8', '9', '10', '11', '12'].includes(String(s.standard))));

    // Status filter
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'VALID' && c.status === 'VALID') ||
      (statusFilter === 'REVOKED' && c.status === 'REVOKED');

    // House filter
    const matchesHouse =
      houseFilter === 'ALL' ||
      s.house?.name?.toUpperCase() === houseFilter.toUpperCase() ||
      s.house_details?.name?.toUpperCase() === houseFilter.toUpperCase();

    // Year filter
    const matchesYear = yearFilter === 'ALL' || c.academic_year === yearFilter;

    return matchesSearch && matchesSection && matchesStatus && matchesHouse && matchesYear;
  });

  // Analytics counts
  const totalCerts = certificates.length;
  const validCerts = certificates.filter((c) => c.status === 'VALID').length;
  const revokedCerts = certificates.filter((c) => c.status === 'REVOKED').length;
  const upCerts = certificates.filter((c) => {
    const s = c.student_details || {};
    return s.school_section === 'UP' || ['5', '6', '7'].includes(String(s.standard));
  }).length;
  const hsCerts = certificates.filter((c) => {
    const s = c.student_details || {};
    return s.school_section === 'HS' || ['8', '9', '10', '11', '12'].includes(String(s.standard));
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-sm">
              <Award className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Certificate Master Registry
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Official certificates, PDF downloads, UP & High School records, and revocation audit trail.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCertificates}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Issued</div>
            <div className="text-xl font-extrabold text-slate-800">{totalCerts}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Valid Active</div>
            <div className="text-xl font-extrabold text-emerald-600">{validCerts}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Revoked</div>
            <div className="text-xl font-extrabold text-rose-600">{revokedCerts}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">UP Section</div>
            <div className="text-xl font-extrabold text-cyan-700">{upCerts}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">High School</div>
            <div className="text-xl font-extrabold text-indigo-700">{hsCerts}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, adm no, cert number, event..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Section Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSectionFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sectionFilter === 'ALL' ? 'bg-white shadow-sm text-slate-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sections
            </button>
            <button
              onClick={() => setSectionFilter('UP')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sectionFilter === 'UP' ? 'bg-cyan-600 shadow-sm text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              UP (5-7)
            </button>
            <button
              onClick={() => setSectionFilter('HS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sectionFilter === 'HS' ? 'bg-indigo-600 shadow-sm text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HS (8-12)
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">Status: All</option>
            <option value="VALID">Valid Active</option>
            <option value="REVOKED">Revoked</option>
          </select>

          {/* House Filter */}
          <select
            value={houseFilter}
            onChange={(e) => setHouseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">House: All</option>
            <option value="Orange">Orange House</option>
            <option value="BLUE">Blue House</option>
            <option value="YELLOW">Yellow House</option>
            <option value="GREEN">Green House</option>
          </select>

          {/* Year Filter */}
          {academicYears.length > 1 && (
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Year: All</option>
              {academicYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Loading certificate registry...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No certificates match your criteria</p>
            <p className="text-slate-400 text-xs mt-1">Try adjusting search terms or clear filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Certificate No</th>
                  <th className="px-6 py-4">Recipient Student</th>
                  <th className="px-6 py-4">Event & Award</th>
                  <th className="px-6 py-4">Academic Year</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Issued On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filtered.map((cert) => {
                  const s = cert.student_details || {};
                  const isUP = s.school_section === 'UP' || ['5', '6', '7'].includes(String(s.standard));
                  const isValid = cert.status === 'VALID';
                  const verificationUrl = `${window.location.origin}/verify-certificate/${cert.verification_token}`;

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Certificate No */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {cert.certificate_number}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]">
                          {cert.verification_token?.slice(0, 8)}...
                        </div>
                      </td>

                      {/* Recipient Student */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                            {s.full_name ? s.full_name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{s.full_name || 'Unknown Student'}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-500 font-mono">Adm: {s.admission_number || 'N/A'}</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-600 font-medium">
                                Class {s.standard} - {s.division}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                  isUP ? 'bg-cyan-50 text-cyan-700' : 'bg-indigo-50 text-indigo-700'
                                }`}
                              >
                                {isUP ? 'UP' : 'HS'}
                              </span>
                              {s.house && <HouseBadge houseName={s.house.name || s.house} size="sm" />}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Event & Award */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{cert.event_name || 'Event'}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Award className="w-3 h-3 text-amber-600" />
                            {cert.award_title || 'Winner'}
                          </span>
                          {cert.award_title_ml && (
                            <span className="text-xs text-slate-400 font-normal">
                              ({cert.award_title_ml})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Academic Year */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {cert.academic_year || '2025-2026'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isValid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Valid
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Revoked
                            </span>
                            {cert.revocation_reason && (
                              <p className="text-[11px] text-rose-600 mt-1 max-w-[180px] truncate" title={cert.revocation_reason}>
                                Reason: {cert.revocation_reason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Issued On */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Download PDF */}
                          <button
                            onClick={() => handleDownloadPdf(cert.id, cert.certificate_number)}
                            title="Download ReportLab PDF"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Public Verify Link */}
                          <a
                            href={verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Public Verification Link"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Revoke Action */}
                          {isValid && (
                            <button
                              onClick={() => {
                                setSelectedCert(cert);
                                setRevokeReason('');
                                setRevokeError('');
                                setRevokeModalOpen(true);
                              }}
                              title="Revoke Certificate"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revocation Modal */}
      {revokeModalOpen && selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-rose-50/70 border-b border-rose-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-900">Revoke Official Certificate</h3>
                  <p className="text-xs text-rose-600">
                    This action marks the certificate as invalidated. It cannot be undone without re-issue.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRevokeSubmit} className="p-6 space-y-4">
              {revokeError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {revokeError}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-800">
                  Certificate: <span className="font-mono text-slate-900">{selectedCert.certificate_number}</span>
                </div>
                <div className="text-slate-600">
                  Student: {selectedCert.student_details?.full_name} (Adm: {selectedCert.student_details?.admission_number})
                </div>
                <div className="text-slate-600">
                  Event: {selectedCert.event_name} • {selectedCert.award_title}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Revocation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="State the official justification (e.g., scoring error, disciplinary action, duplicate issue)..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This reason will be logged in the permanent audit trail and displayed on the verification page.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setRevokeModalOpen(false);
                    setSelectedCert(null);
                  }}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Confirm Revocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

