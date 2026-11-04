import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import {
  Award,
  Calendar,
  CheckCircle2,
  Download,
  Share2,
  ExternalLink,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

export default function ChildAchievements() {
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPdf = async (certId, certNumber) => {
    try {
      setDownloadingId(certId);
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
      console.error('Failed to download certificate PDF:', err);
      alert('Failed to download certificate PDF. Please ensure you are authorized.');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    api.get(`/parent/child-achievements/${studentId}/`)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 403) {
          setError('Unauthorized: You can only view achievements for your officially linked children.');
        } else {
          setError('Failed to load student achievement portfolio.');
        }
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading student achievements...</div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error}</h2>
        <Link
          to="/parent/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Parent Dashboard</span>
        </Link>
      </div>
    );
  }

  const s = data?.student || {};
  const participations = data?.participations || [];
  const results = data?.results || [];
  const certificates = data?.certificates || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link to="/parent/dashboard" className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-black text-slate-900">{s.full_name}</h1>
          {s.malayalam_name && (
            <span className="text-sm font-semibold text-slate-500 block">
              {s.malayalam_name}
            </span>
          )}
          <p className="text-xs text-slate-600">
            Admission No: <strong>{s.admission_number}</strong> • Class: <strong>{s.class_name}-{s.division}</strong> • Year: <strong>{s.academic_year}</strong>
          </p>
        </div>

        <div>
          <HouseBadge houseName={s.house_name} size="lg" />
        </div>
      </div>

      {/* Published Awards & Certificates */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Official Awards & Certificates ({certificates.length})</span>
        </h2>

        {certificates.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No certificates issued yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-500">{cert.certificate_number}</span>
                    <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      Valid
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{cert.award_title}</h3>
                  <p className="text-xs text-slate-600">Event: <strong>{cert.event_name}</strong></p>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                  <a
                    href={`/verify-certificate/${cert.verification_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <span>Verify Online</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    disabled={downloadingId === cert.id}
                    onClick={() => handleDownloadPdf(cert.id, cert.certificate_number)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === cert.id ? 'Downloading...' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Participation History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span>Competition Participation History ({participations.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Event Name</th>
                <th className="py-3 px-4">Chest Number</th>
                <th className="py-3 px-4">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {participations.map((p) => (
                <tr key={p.id}>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.event_name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold">{p.chest_number || '-'}</td>
                  <td className="py-3.5 px-4 text-slate-500">{new Date(p.registered_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
