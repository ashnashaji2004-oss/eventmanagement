import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import HouseBadge from '../../components/HouseBadge';
import {
  GraduationCap,
  PlusCircle,
  Search,
  Filter,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    admission_number: '',
    first_name: '',
    last_name: '',
    malayalam_name: '',
    class_name: '10',
    division: 'A',
    house: '',
    gender: 'M',
    academic_year: '2025-2026'
  });

  const fetchData = () => {
    Promise.all([
      api.get('/students/'),
      api.get('/houses/')
    ])
      .then(([stuRes, houseRes]) => {
        setStudents(stuRes.data.results || stuRes.data || []);
        const hList = houseRes.data.results || houseRes.data || [];
        setHouses(hList);
        if (hList.length > 0 && !formData.house) {
          setFormData((prev) => ({ ...prev, house: hList[0].id }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/students/', formData);
      setModalOpen(false);
      setFormData({
        admission_number: '',
        first_name: '',
        last_name: '',
        malayalam_name: '',
        class_name: '10',
        division: 'A',
        house: houses[0]?.id || '',
        gender: 'M',
        academic_year: '2025-2026'
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create student record.');
    }
  };

  const filtered = students.filter((s) => {
    const matchesClass = selectedClass ? s.class_name === selectedClass : true;
    const matchesDiv = selectedDivision ? s.division === selectedDivision : true;
    const matchesH = selectedHouse ? s.house_name?.toLowerCase() === selectedHouse.toLowerCase() : true;
    const q = search.toLowerCase();
    const matchesSearch =
      s.full_name?.toLowerCase().includes(q) ||
      s.admission_number?.toLowerCase().includes(q) ||
      s.malayalam_name?.toLowerCase().includes(q);
    return matchesClass && matchesDiv && matchesH && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <GraduationCap className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Records Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Data directory of all enrolled students, assigned houses, and bilingual names. Note: Students have NO login credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalOpen(true);
            setError('');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Student Record</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admission no, student name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="">All Classes</option>
            <option value="5">Class 5 (UP Section)</option>
            <option value="6">Class 6 (UP Section)</option>
            <option value="7">Class 7 (UP Section)</option>
            <option value="8">Class 8 (High School)</option>
            <option value="9">Class 9 (High School)</option>
            <option value="10">Class 10 (High School)</option>
            <option value="11">Class 11 (High School)</option>
            <option value="12">Class 12 (High School)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="">All Divisions</option>
            <option value="A">Division A</option>
            <option value="B">Division B</option>
            <option value="C">Division C</option>
          </select>
        </div>

        <div>
          <select
            value={selectedHouse}
            onChange={(e) => setSelectedHouse(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="">All Houses</option>
            <option value="Orange">Orange House</option>
            <option value="Blue">Blue House</option>
            <option value="Yellow">Yellow House</option>
            <option value="Green">Green House</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Admission No.</th>
                <th className="py-3 px-4">Student Name (English & Malayalam)</th>
                <th className="py-3 px-4">Class & Div</th>
                <th className="py-3 px-4">Assigned House</th>
                <th className="py-3 px-4">Academic Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-800 text-xs">
                    {st.admission_number}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900 block">{st.full_name}</span>
                    {st.malayalam_name && (
                      <span className="text-xs text-slate-500 block">{st.malayalam_name}</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-xs font-bold text-slate-700">
                    Class {st.class_name}-{st.division}
                  </td>
                  <td className="py-4 px-4">
                    <HouseBadge houseName={st.house_name} size="sm" />
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                    {st.academic_year}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Student */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Add Student Record</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admission Number (Unique)
                </label>
                <input
                  type="text"
                  required
                  value={formData.admission_number}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                  placeholder="e.g. ADM-2024-050"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student Name in Malayalam (മലയാളം)
                </label>
                <input
                  type="text"
                  value={formData.malayalam_name}
                  onChange={(e) => setFormData({ ...formData, malayalam_name: e.target.value })}
                  placeholder="e.g. അർജുൻ നായർ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Class
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Division
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    placeholder="A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    House
                  </label>
                  <select
                    required
                    value={formData.house}
                    onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} House
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  Save Student Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
