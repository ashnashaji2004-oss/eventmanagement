import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import {
  GraduationCap,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  Building
} from 'lucide-react';

export default function AdminStudents() {
  const { t, i18n } = useTranslation();
  const [students, setStudents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState(''); // '' | 'UP' | 'HS'
  const [houseFilter, setHouseFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [profileModal, setProfileModal] = useState({ open: false, data: null, loading: false });

  useEffect(() => {
    fetchHouses();
    fetchStudents();
  }, [sectionFilter, houseFilter, classFilter, includeArchived]);

  const fetchHouses = async () => {
    try {
      const res = await api.get('/houses/');
      const list = res.data?.results || (Array.isArray(res.data) ? res.data : []);
      setHouses(list);
    } catch (err) {
      console.error(err);
      setHouses([]);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (sectionFilter) params.school_section = sectionFilter;
      if (houseFilter) params.house = houseFilter;
      if (classFilter) params.class_name = classFilter;
      if (includeArchived) params.include_archived = 'true';

      const res = await api.get('/students/', { params });
      const list = res.data?.results || (Array.isArray(res.data) ? res.data : []);
      setStudents(list);
    } catch (err) {
      setError('Failed to fetch students roster.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  // View Student Profile Detail
  const handleViewProfile = async (studentId) => {
    setProfileModal({ open: true, data: null, loading: true });
    try {
      const res = await api.get(`/students/${studentId}/profile_detail/`);
      setProfileModal({ open: true, data: res.data, loading: false });
    } catch (err) {
      setProfileModal({ open: false, data: null, loading: false });
      setError('Failed to load full student profile.');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open('/api/students/export_csv/', '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Top Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <span>Student Directory (Read-Only)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse official UP and High School student records, house allocations, and participation portfolios. Student enrollment is managed exclusively by Teachers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-800">
          <XCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admission no or name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All School Sections</option>
            <option value="UP">UP Section (5-7)</option>
            <option value="HS">High School (8-12)</option>
          </select>

          {/* House Filter */}
          <select
            value={houseFilter}
            onChange={(e) => setHouseFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All Houses</option>
            <option value="Orange">Orange House</option>
            <option value="Blue">Blue House</option>
            <option value="Yellow">Yellow House</option>
            <option value="Green">Green House</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All Classes</option>
            {['5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>

          {/* Archive Toggle */}
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span>Include Archived</span>
          </label>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <span className="text-xs text-slate-400">Loading student roster...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Admission No</th>
                  <th className="py-3.5 px-4">Student Full Name</th>
                  <th className="py-3.5 px-4">Class & Division</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">House</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(students) && students.length > 0 ? (
                  students.map((st) => (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/60 transition-colors ${st.is_archived ? 'bg-slate-50/80 opacity-60' : ''}`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {st.admission_number}
                      </td>

                      <td className="py-3 px-4">
                        <span className="block font-bold text-slate-900 text-sm">
                          {st.full_name}
                        </span>
                        {st.malayalam_name && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {st.malayalam_name}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        Class {st.class_name} - {st.division}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.school_section === 'UP'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {st.school_section === 'UP' ? 'UP Section' : 'High School'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <HouseBadge houseName={st.house_name} />
                      </td>

                      <td className="py-3 px-4">
                        {st.is_archived ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                            Archived
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleViewProfile(st.id)}
                          className="px-2.5 py-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors inline-flex items-center gap-1 font-bold text-xs"
                          title="View student achievements & portfolio"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                      No students found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Profile & Achievement Portfolio Modal */}
      {profileModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {profileModal.loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <span className="text-xs text-slate-400">Loading student portfolio...</span>
              </div>
            ) : profileModal.data ? (
              <>
                {/* Header Profile Info */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      Student Achievement Profile
                    </span>
                    <h2 className="text-2xl font-black text-slate-900">
                      {profileModal.data.student.full_name}
                    </h2>
                    <span className="text-xs text-slate-500">
                      Adm: {profileModal.data.student.admission_number} • Class {profileModal.data.student.class_name}-{profileModal.data.student.division} ({profileModal.data.student.school_section === 'UP' ? 'UP Section' : 'High School'})
                    </span>
                  </div>

                  <div>
                    <HouseBadge houseName={profileModal.data.student.house_name} />
                  </div>
                </div>

                {/* Achievements Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Competition Achievements ({profileModal.data.achievements?.length || 0})</span>
                  </h3>

                  {profileModal.data.achievements?.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                      {profileModal.data.achievements.map((ach) => (
                        <div key={ach.result_id} className="p-3 bg-slate-50 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block">{ach.event_name}</span>
                            <span className="text-slate-500 text-[11px]">{ach.award || ach.position_display}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                            {ach.position_display}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-2">No competition achievements recorded yet.</p>
                  )}
                </div>

                {/* Certificates Issued */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Issued Certificates ({profileModal.data.certificates?.length || 0})</span>
                  </h3>

                  {profileModal.data.certificates?.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                      {profileModal.data.certificates.map((cert) => (
                        <div key={cert.certificate_number} className="p-3 bg-emerald-50/50 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block">{cert.award_title}</span>
                            <span className="text-slate-500 text-[11px]">Cert #: {cert.certificate_number}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Official Award
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-2">No certificates issued yet.</p>
                  )}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setProfileModal({ open: false, data: null, loading: false })}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}

