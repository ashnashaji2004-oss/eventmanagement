import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import {
  Award,
  Download,
  Printer,
  Share2,
  ExternalLink,
  ShieldCheck,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';

export default function CertificateGallery() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);
  const [copied, setCopied] = useState(false);
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
      console.error('Failed to download PDF:', err);
      alert('Failed to download certificate PDF. Please ensure you are authorized.');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    api.get('/certificates/')
      .then((res) => setCertificates(res.data.results || res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async (cert) => {
    const url = `${window.location.origin}/verify-certificate/${cert.verification_token}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verified Certificate - ${cert.student_details?.full_name}`,
          text: `Official Certificate of Achievement awarded for ${cert.event_name}`,
          url: url
        });
      } catch {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Official Certificates Gallery
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Preview, download high-resolution PDF certificates, print, and share verifiable credentials for your children.
          </p>
        </div>

        {copied && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
            Public verification link copied to clipboard!
          </span>
        )}
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading certificates...</div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-2">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700">No Certificates Issued Yet</h3>
          <p className="text-xs text-slate-500">Certificates appear here as soon as competition results are approved by school administration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const s = cert.student_details || {};
            return (
              <div
                key={cert.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <HouseBadge houseName={s.house_name} size="sm" />
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {cert.certificate_number}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Recipient</span>
                    <h3 className="text-xl font-black text-slate-900">{s.full_name}</h3>
                    {s.malayalam_name && (
                      <span className="text-xs font-semibold text-slate-500 block">{s.malayalam_name}</span>
                    )}
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/50 space-y-1">
                    <span className="text-xs font-extrabold text-amber-700 block">
                      {cert.award_title}
                    </span>
                    <p className="text-xs text-slate-600 truncate">Event: <strong>{cert.event_name}</strong></p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewCert(cert)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleShare(cert)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Share Verification Link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={downloadingId === cert.id}
                      onClick={() => handleDownloadPdf(cert.id, cert.certificate_number)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingId === cert.id ? 'Saving...' : 'PDF'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Certificate Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                Official Certificate Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  disabled={downloadingId === previewCert.id}
                  onClick={() => handleDownloadPdf(previewCert.id, previewCert.certificate_number)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingId === previewCert.id ? 'Downloading...' : 'Download PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCert(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Certificate Layout Canvas */}
            <div
              id="printable-certificate"
              className="relative p-8 sm:p-12 border-8 border-indigo-950 rounded-2xl bg-amber-50/20 shadow-inner text-center space-y-6"
            >
              {/* Inner Gold Border */}
              <div className="border-2 border-amber-500/80 p-6 sm:p-8 rounded-lg space-y-5">
                {/* School Header */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 uppercase tracking-wide">
                    ST. MARY'S HIGHER SECONDARY SCHOOL
                  </h2>
                  <p className="text-xs italic text-slate-600 mt-0.5">
                    "Excellence Through Discipline and Knowledge"
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-lg sm:text-xl font-bold uppercase tracking-widest text-amber-700 border-b-2 border-amber-500 pb-1 inline-block">
                    Certificate of Achievement
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600">
                  This is proudly presented to
                </p>

                {/* Recipient Name */}
                <div className="py-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
                    {previewCert.student_details?.full_name}
                  </h3>
                  {previewCert.student_details?.malayalam_name && (
                    <span className="text-sm font-bold text-slate-600 block mt-1">
                      ({previewCert.student_details.malayalam_name})
                    </span>
                  )}
                </div>

                {/* Citation details */}
                <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
                  of <strong>Class {previewCert.student_details?.class_name}-{previewCert.student_details?.division}</strong>, <strong>{previewCert.student_details?.house_name} House</strong>, for securing <strong>{previewCert.award_title}</strong> in the event <strong>'{previewCert.event_name}'</strong> during the Annual School Fest for the academic year <strong>{previewCert.academic_year}</strong>.
                </p>

                {/* Certificate Footer with cert number and signatures */}
                <div className="pt-6 border-t border-amber-300/60 flex items-center justify-between text-left gap-4">
                  <div className="text-[10px] text-slate-500 space-y-0.5 font-mono bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                    <span className="block font-bold text-slate-700">No: {previewCert.certificate_number}</span>
                    <span className="block">Date: {new Date(previewCert.issued_at).toLocaleDateString()}</span>
                    <span className="text-emerald-700 font-bold font-sans">Official Verified Certificate</span>
                  </div>

                  <div className="flex items-center gap-8 text-center text-xs text-slate-800">
                    <div className="space-y-1">
                      <div className="w-28 border-b border-slate-700"></div>
                      <span className="text-[11px] font-bold block">Event Coordinator</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-28 border-b border-slate-700"></div>
                      <span className="text-[11px] font-bold block">Principal / Head</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
