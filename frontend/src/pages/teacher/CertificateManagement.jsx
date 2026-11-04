import React, { useState, useEffect } from 'react';
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
  Upload,
  Plus,
  FileCheck,
  FileText,
  CheckCircle2,
  X
} from 'lucide-react';

export default function CertificateManagement() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Revoke modal state
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeError, setRevokeError] = useState('');

  // Upload New Certificate Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    student_id: '',
    event_id: '',
    award_title: 'First Place',
    award_title_custom: '',
    award_title_ml: '',
    academic_year: '2025-2026',
    file: null
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Attach / Replace File Modal State
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [attachCert, setAttachCert] = useState(null);
  const [attachFile, setAttachFile] = useState(null);
  const [attachLoading, setAttachLoading] = useState(false);
  const [attachError, setAttachError] = useState('');
  const [attachSuccess, setAttachSuccess] = useState('');

  const fetchCertificates = () => {
    api.get('/certificates/')
      .then((res) => setCertificates(res.data.results || res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchUploadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [stRes, evRes] = await Promise.all([
        api.get('/students/'),
        api.get('/events/')
      ]);
      const stList = stRes.data.results || stRes.data || [];
      const evList = evRes.data.results || evRes.data || [];
      setStudents(stList);
      setEvents(evList);
      if (stList.length > 0 && !uploadForm.student_id) {
        setUploadForm((prev) => ({ ...prev, student_id: stList[0].id }));
      }
      if (evList.length > 0 && !uploadForm.event_id) {
        setUploadForm((prev) => ({ ...prev, event_id: evList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load students/events:', err);
    } finally {
      setLoadingOptions(false);
    }
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
    setRevokeError('');
    try {
      await api.post(`/certificates/${selectedCert.id}/revoke/`, { reason: revokeReason });
      setRevokeModalOpen(false);
      setRevokeReason('');
      fetchCertificates();
    } catch (err) {
      setRevokeError(err.response?.data?.error || 'Failed to revoke certificate.');
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

  const handleUploadNewSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.student_id) {
      setUploadError('Please select a student.');
      return;
    }
    if (!uploadForm.event_id) {
      setUploadError('Please select an event.');
      return;
    }

    const finalAwardTitle = uploadForm.award_title === 'CUSTOM'
      ? uploadForm.award_title_custom.trim()
      : uploadForm.award_title;

    if (!finalAwardTitle) {
      setUploadError('Award title is required.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('student', uploadForm.student_id);
      formData.append('event', uploadForm.event_id);
      formData.append('award_title', finalAwardTitle);
      if (uploadForm.award_title_ml) {
        formData.append('award_title_ml', uploadForm.award_title_ml.trim());
      }
      formData.append('academic_year', uploadForm.academic_year);
      if (uploadForm.file) {
        formData.append('file', uploadForm.file);
      }

      await api.post('/certificates/upload_new/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadSuccess('Certificate uploaded and registered successfully!');
      fetchCertificates();
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccess('');
        setUploadForm({
          student_id: '',
          event_id: '',
          award_title: 'First Place',
          award_title_custom: '',
          award_title_ml: '',
          academic_year: '2025-2026',
          file: null
        });
      }, 1500);
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.error || err.response?.data?.detail || 'Failed to upload certificate.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAttachFileSubmit = async (e) => {
    e.preventDefault();
    if (!attachFile) {
      setAttachError('Please select a certificate document file to upload.');
      return;
    }
    setAttachLoading(true);
    setAttachError('');
    setAttachSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', attachFile);

      await api.post(`/certificates/${attachCert.id}/upload_file/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAttachSuccess('Certificate document uploaded successfully!');
      fetchCertificates();
      setTimeout(() => {
        setAttachModalOpen(false);
        setAttachCert(null);
        setAttachFile(null);
        setAttachSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setAttachError(err.response?.data?.error || 'Failed to upload certificate document.');
    } finally {
      setAttachLoading(false);
    }
  };

  const filtered = certificates.filter((c) => {
    const q = search.toLowerCase();
    const s = c.student_details || {};
    return (
      c.certificate_number?.toLowerCase().includes(q) ||
      s.full_name?.toLowerCase().includes(q) ||
      c.event_name?.toLowerCase().includes(q) ||
      c.award_title?.toLowerCase().includes(q)
    );
  });

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
              Certificate Registry & Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Issued certificates, teacher document uploads, PDF downloads, and revocation controls.
          </p>
        </div>

        {/* Action Button: Upload Certificate */}
        <button
          type="button"
          onClick={() => {
            setUploadModalOpen(true);
            setUploadError('');
            setUploadSuccess('');
            fetchUploadOptions();
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload / Issue Certificate</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by certificate number, student name, event..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        />
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Cert Number</th>
                <th className="py-3 px-4">Student & House</th>
                <th className="py-3 px-4">Event & Award</th>
                <th className="py-3 px-4">File Type</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading certificates...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No certificates found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click the "Upload / Issue Certificate" button above to upload a certificate document.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => {
                  const s = cert.student_details || {};
                  const isValid = cert.status === 'VALID';
                  const hasCustomFile = !!cert.pdf_file;

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-800 text-xs">
                        {cert.certificate_number}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block">{s.full_name}</span>
                        {s.house_name && (
                          <div className="mt-1">
                            <HouseBadge houseName={s.house_name} size="sm" />
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 block">{cert.event_name}</span>
                        <span className="text-xs font-bold text-amber-600 block">{cert.award_title}</span>
                      </td>

                      <td className="py-4 px-4">
                        {hasCustomFile ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                            <span>Uploaded File</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>Auto-Generated</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4">
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Revoked</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Attach / Replace File Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setAttachCert(cert);
                              setAttachFile(null);
                              setAttachError('');
                              setAttachSuccess('');
                              setAttachModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                            title={hasCustomFile ? 'Replace Uploaded Certificate File' : 'Upload Certificate File'}
                          >
                            <Upload className="w-4 h-4" />
                          </button>

                          {/* Download PDF */}
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(cert.id, cert.certificate_number)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                            title="Download Certificate File / PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Revoke Button */}
                          {isValid && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCert(cert);
                                setRevokeModalOpen(true);
                                setRevokeError('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Upload / Issue New Certificate */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" />
                <span>Upload & Issue Certificate</span>
              </h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadNewSubmit} className="space-y-4">
              {/* Student Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Student <span className="text-red-500">*</span>
                </label>
                {loadingOptions ? (
                  <p className="text-xs text-slate-400">Loading student list...</p>
                ) : (
                  <select
                    required
                    value={uploadForm.student_id}
                    onChange={(e) => setUploadForm({ ...uploadForm, student_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.full_name} ({st.admission_number}) — {st.house_name} House (Class {st.class_name}-{st.division})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Event Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Event <span className="text-red-500">*</span>
                </label>
                {loadingOptions ? (
                  <p className="text-xs text-slate-400">Loading event list...</p>
                ) : (
                  <select
                    required
                    value={uploadForm.event_id}
                    onChange={(e) => setUploadForm({ ...uploadForm, event_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="">-- Choose Event --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.event_type})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Award Title Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Award / Position <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadForm.award_title}
                    onChange={(e) => setUploadForm({ ...uploadForm, award_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="First Place">First Place (1st Prize)</option>
                    <option value="Second Place">Second Place (2nd Prize)</option>
                    <option value="Third Place">Third Place (3rd Prize)</option>
                    <option value="Participation Certificate">Participation Certificate</option>
                    <option value="Special Recognition">Special Recognition</option>
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="CUSTOM">Custom Title...</option>
                  </select>
                </div>

                {uploadForm.award_title === 'CUSTOM' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Custom Award Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadForm.award_title_custom}
                      onChange={(e) => setUploadForm({ ...uploadForm, award_title_custom: e.target.value })}
                      placeholder="e.g. Best Singer Award"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Award in Malayalam (മലയാളം)
                    </label>
                    <input
                      type="text"
                      value={uploadForm.award_title_ml}
                      onChange={(e) => setUploadForm({ ...uploadForm, award_title_ml: e.target.value })}
                      placeholder="ഉദാ: ഒന്നാം സ്ഥാനം"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={uploadForm.academic_year}
                  onChange={(e) => setUploadForm({ ...uploadForm, academic_year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Certificate Document Upload */}
              <div className="border border-dashed border-amber-300 rounded-2xl p-4 bg-amber-50/30 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Upload Certificate Document (PDF or Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setUploadForm({ ...uploadForm, file });
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                />
                {uploadForm.file && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <FileCheck className="w-4 h-4" />
                    <span>Selected: {uploadForm.file.name} ({(uploadForm.file.size / 1024).toFixed(1)} KB)</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400">
                  Optional: If a file is uploaded, parents and students will download this exact document. If left blank, the system will dynamically generate the official verified certificate.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadLoading ? 'Uploading...' : 'Upload & Issue'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Attach / Replace File on Existing Certificate */}
      {attachModalOpen && attachCert && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                <span>Upload Certificate File</span>
              </h3>
              <button
                type="button"
                onClick={() => setAttachModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p><strong>Cert No:</strong> {attachCert.certificate_number}</p>
              <p><strong>Student:</strong> {attachCert.student_details?.full_name}</p>
              <p><strong>Event:</strong> {attachCert.event_name} — {attachCert.award_title}</p>
            </div>

            {attachSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{attachSuccess}</span>
              </div>
            )}

            {attachError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{attachError}</span>
              </div>
            )}

            <form onSubmit={handleAttachFileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Certificate File (PDF / JPG / PNG)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setAttachFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                />
                {attachFile && (
                  <p className="text-xs text-purple-700 font-semibold mt-2 flex items-center gap-1">
                    <FileCheck className="w-4 h-4" />
                    <span>{attachFile.name} ({(attachFile.size / 1024).toFixed(1)} KB)</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAttachModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={attachLoading}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{attachLoading ? 'Uploading...' : 'Save Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Revoke Certificate */}
      {revokeModalOpen && selectedCert && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900 text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>Revoke Certificate {selectedCert.certificate_number}</span>
            </h3>

            {revokeError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs">
                {revokeError}
              </div>
            )}

            <form onSubmit={handleRevokeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mandatory Revocation Reason
                </label>
                <textarea
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="State the reason why this certificate is being permanently revoked..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevokeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
                >
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
