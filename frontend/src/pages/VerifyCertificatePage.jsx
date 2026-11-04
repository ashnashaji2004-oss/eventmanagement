import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Share2,
  Printer,
  Copy,
  Search,
  Award,
  Calendar,
  Building2,
  UserCheck
} from 'lucide-react';
import HouseBadge from '../components/HouseBadge';

export default function VerifyCertificatePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [searchToken, setSearchToken] = useState(token || '');
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusState, setStatusState] = useState(null); // 'VALID', 'REVOKED', 'NOT_FOUND', null
  const [copied, setCopied] = useState(false);

  const performVerification = (tok) => {
    if (!tok || tok.trim() === '') return;
    setLoading(true);
    setStatusState(null);
    setCertData(null);

    api.get(`/certificates/verify/${tok.trim()}/`)
      .then((res) => {
        setCertData(res.data);
        setStatusState(res.data.status);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setStatusState('NOT_FOUND');
        } else {
          setStatusState('NOT_FOUND');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) {
      setSearchToken(token);
      performVerification(token);
    }
  }, [token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchToken.trim()) {
      navigate(`/verify-certificate/${searchToken.trim()}`);
      performVerification(searchToken.trim());
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verified Certificate - ${certData?.recipient_name}`,
          text: `Official Certificate of Achievement for ${certData?.recipient_name} in ${certData?.event_name}`,
          url: url
        });
      } catch {
        // Fallback to clipboard
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm mb-1">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('certificates.verify_title')}
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Public online certificate authenticity validation. Verify issued credentials using the cryptographic QR code token.
        </p>

        {/* Token Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              placeholder="Enter certificate verification token (UUID)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Verification Results Card */}
      {statusState && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all">
          {/* Status Alert Banner */}
          {statusState === 'VALID' && (
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-200 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">{t('certificates.status_valid')}</h3>
                  <p className="text-xs text-emerald-100">
                    This certificate is genuine, officially issued by {certData?.school_name}, and has not been revoked.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Authentic
              </span>
            </div>
          )}

          {statusState === 'REVOKED' && (
            <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="w-7 h-7 text-red-200 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">{t('certificates.status_revoked')}</h3>
                  <p className="text-xs text-red-100">
                    This certificate was previously issued but has been officially revoked by the school administration.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Invalid
              </span>
            </div>
          )}

          {statusState === 'NOT_FOUND' && (
            <div className="bg-slate-800 text-white px-6 py-6 text-center space-y-2">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="font-extrabold text-lg">{t('certificates.status_not_found')}</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                No matching certificate record was found for this token. Please ensure the token was entered accurately or scan the QR code again.
              </p>
            </div>
          )}

          {/* Certificate Details for VALID or REVOKED */}
          {certData && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Revocation Warning Box if Revoked */}
              {statusState === 'REVOKED' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
                  <span className="font-bold block text-sm">Official Revocation Reason:</span>
                  <p>{certData.revocation_reason || 'Administrative revocation'}</p>
                  {certData.revoked_at && (
                    <span className="block text-[11px] text-red-600 font-mono">Revoked on: {certData.revoked_at}</span>
                  )}
                </div>
              )}

              {/* Certificate Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {t('certificates.issued_to')}
                    </span>
                    <span className="text-2xl font-black text-slate-900 block mt-0.5">
                      {certData.recipient_name}
                    </span>
                    {certData.malayalam_name && (
                      <span className="text-sm font-semibold text-slate-600 block">
                        ({certData.malayalam_name})
                      </span>
                    )}
                    <div className="mt-2">
                      <HouseBadge houseName={certData.house_name} size="sm" />
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {t('certificates.event')}
                    </span>
                    <span className="text-base font-bold text-slate-800 block mt-0.5">
                      {i18n.language === 'ml' && certData.event_name_ml ? certData.event_name_ml : certData.event_name}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {t('certificates.award')}
                    </span>
                    <span className="text-xl font-extrabold text-amber-600 flex items-center gap-1.5 mt-0.5">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span>{i18n.language === 'ml' && certData.award_title_ml ? certData.award_title_ml : certData.award_title}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-400 uppercase tracking-wider block">
                        {t('certificates.cert_number')}
                      </span>
                      <span className="font-mono font-bold text-slate-800 block mt-0.5">
                        {certData.certificate_number}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-400 uppercase tracking-wider block">
                        {t('certificates.date')}
                      </span>
                      <span className="font-medium text-slate-800 block mt-0.5">
                        {certData.issued_at}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-400 uppercase tracking-wider block text-xs">
                      Issuing Institution
                    </span>
                    <span className="text-xs font-bold text-slate-700 block mt-0.5">
                      {certData.school_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Share & Print */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-slate-600" />
                    <span>{t('certificates.share')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>{t('certificates.print')}</span>
                  </button>
                </div>

                {copied && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                    {t('certificates.copied')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
