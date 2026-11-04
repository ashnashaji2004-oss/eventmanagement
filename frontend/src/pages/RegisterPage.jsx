import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import SchoolEmblem from '../components/SchoolEmblem';
import {
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Building,
  User,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('teacher'); // 'teacher' | 'parent'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Teacher Form State
  const [teacherForm, setTeacherForm] = useState({
    full_name: '',
    employee_id: '',
    email: '',
    phone_number: '',
    department: '',
    designation: 'Teacher',
    password: '',
    confirm_password: '',
    agree_terms: false
  });

  // Parent Form State
  const [parentForm, setParentForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    relationship: 'Father',
    password: '',
    confirm_password: '',
    children: [
      {
        admission_number: '',
        student_name: '',
        class_name: '10',
        division: 'A',
        relationship_type: 'Father'
      }
    ],
    agree_terms: false
  });

  // Password Strength Meter
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, text: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, text: 'Moderate', color: 'bg-amber-500' };
    return { score, text: 'Strong', color: 'bg-emerald-500' };
  };

  // Add child to parent form
  const handleAddChild = () => {
    setParentForm({
      ...parentForm,
      children: [
        ...parentForm.children,
        {
          admission_number: '',
          student_name: '',
          class_name: '8',
          division: 'A',
          relationship_type: parentForm.relationship
        }
      ]
    });
  };

  // Remove child from parent form
  const handleRemoveChild = (index) => {
    if (parentForm.children.length === 1) return;
    const updated = parentForm.children.filter((_, i) => i !== index);
    setParentForm({ ...parentForm, children: updated });
  };

  // Update specific child field
  const handleChildChange = (index, field, value) => {
    const updated = [...parentForm.children];
    updated[index][field] = value;
    setParentForm({ ...parentForm, children: updated });
  };

  // Submit Teacher Registration
  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (teacherForm.password !== teacherForm.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (!teacherForm.agree_terms) {
      setError('Please acknowledge and agree to the school privacy and data verification terms.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register/teacher/', {
        full_name: teacherForm.full_name,
        employee_id: teacherForm.employee_id,
        email: teacherForm.email,
        phone_number: teacherForm.phone_number,
        department: teacherForm.department,
        designation: teacherForm.designation,
        password: teacherForm.password,
        confirm_password: teacherForm.confirm_password
      });
      setSuccessData(res.data);
    } catch (err) {
      const resData = err.response?.data;
      if (typeof resData === 'object') {
        const firstKey = Object.keys(resData)[0];
        const val = resData[firstKey];
        setError(Array.isArray(val) ? `${firstKey}: ${val[0]}` : val);
      } else {
        setError('Teacher registration failed. Please verify your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit Parent Registration
  const handleParentSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parentForm.password !== parentForm.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (!parentForm.agree_terms) {
      setError('Please acknowledge and agree to the parent-child verification terms.');
      return;
    }

    // Validate that each child has an admission number and name
    for (let i = 0; i < parentForm.children.length; i++) {
      const c = parentForm.children[i];
      if (!c.admission_number.trim() || !c.student_name.trim()) {
        setError(`Child #${i + 1}: Admission number and student full name are required.`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register/parent/', {
        full_name: parentForm.full_name,
        email: parentForm.email,
        phone_number: parentForm.phone_number,
        relationship: parentForm.relationship,
        password: parentForm.password,
        confirm_password: parentForm.confirm_password,
        children: parentForm.children
      });
      setSuccessData(res.data);
    } catch (err) {
      const resData = err.response?.data;
      if (typeof resData === 'object') {
        const firstKey = Object.keys(resData)[0];
        const val = resData[firstKey];
        setError(Array.isArray(val) ? `${firstKey}: ${val[0]}` : val);
      } else {
        setError('Parent registration failed. Please verify your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const teacherStrength = getPasswordStrength(teacherForm.password);
  const parentStrength = getPasswordStrength(parentForm.password);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with Authentic School Emblem */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <SchoolEmblem className="w-16 h-16" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Portal Registration
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            {i18n.language === 'ml' ? t('school_name_ml') : t('school_name')}
          </p>
          <div className="flex justify-center pt-1">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Success Modal Confirmation View */}
        {successData ? (
          <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Application Submitted Successfully!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                {successData.message}
              </p>
            </div>

            {/* Reference Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Official Application Reference Number
              </span>
              <span className="block text-xl sm:text-2xl font-mono font-black text-indigo-700 select-all">
                {successData.application_number}
              </span>
              <span className="block text-xs text-slate-600 font-medium">
                Please save this reference number for your records. Once verified and approved by the Administrator, you can log in to your account.
              </span>
            </div>

            <div className="flex items-center justify-center pt-3">
              <Link
                to="/login"
                className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form Box */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Tab Selection */}
            <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => { setActiveTab('teacher'); setError(''); }}
                className={`py-4 px-4 text-center font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'teacher'
                    ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Teacher Registration</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('parent'); setError(''); }}
                className={`py-4 px-4 text-center font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'parent'
                    ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Parent Registration</span>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Security Banner */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
                <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Administrative Verification Notice:</strong> All registrations undergo mandatory school administrative verification before login access is granted. Student linking requests require school record matching.
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* ================= TEACHER FORM ================= */}
              {activeTab === 'teacher' && (
                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={teacherForm.full_name}
                          onChange={(e) => setTeacherForm({ ...teacherForm, full_name: e.target.value })}
                          placeholder="e.g. Anita George"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Employee ID *
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={teacherForm.employee_id}
                          onChange={(e) => setTeacherForm({ ...teacherForm, employee_id: e.target.value })}
                          placeholder="e.g. CSHSS-T-102"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={teacherForm.email}
                          onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                          placeholder="teacher@example.com"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={teacherForm.phone_number}
                          onChange={(e) => setTeacherForm({ ...teacherForm, phone_number: e.target.value })}
                          placeholder="+91 98470 12345"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Department / Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherForm.department}
                        onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                        placeholder="e.g. Malayalam, Science, Physical Ed."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherForm.designation}
                        onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                        placeholder="e.g. High School Assistant (HSA)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={teacherForm.password}
                          onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                          placeholder="Min 6 characters"
                          className="w-full px-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {teacherForm.password && (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${teacherStrength.color}`}
                              style={{ width: `${(teacherStrength.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{teacherStrength.text}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={teacherForm.confirm_password}
                          onChange={(e) => setTeacherForm({ ...teacherForm, confirm_password: e.target.value })}
                          placeholder="Re-enter password"
                          className="w-full px-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="teacher_terms"
                      checked={teacherForm.agree_terms}
                      onChange={(e) => setTeacherForm({ ...teacherForm, agree_terms: e.target.checked })}
                      className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="teacher_terms" className="text-xs text-slate-600">
                      I declare that I am an authorized faculty member of Chaldean Syrian Higher Secondary School and the submitted Employee ID matches official school records.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Submitting Application...' : 'Submit Teacher Application'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ================= PARENT FORM ================= */}
              {activeTab === 'parent' && (
                <form onSubmit={handleParentSubmit} className="space-y-6">
                  {/* Guardian Details */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Guardian Contact Information</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Guardian Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={parentForm.full_name}
                          onChange={(e) => setParentForm({ ...parentForm, full_name: e.target.value })}
                          placeholder="e.g. Priya Nair"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Relationship with Child *
                        </label>
                        <select
                          value={parentForm.relationship}
                          onChange={(e) => setParentForm({ ...parentForm, relationship: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        >
                          <option value="Father">Father (പിതാവ്)</option>
                          <option value="Mother">Mother (മാതാവ്)</option>
                          <option value="Guardian">Guardian (രക്ഷിതാവ്)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={parentForm.email}
                          onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
                          placeholder="parent@example.com"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={parentForm.phone_number}
                          onChange={(e) => setParentForm({ ...parentForm, phone_number: e.target.value })}
                          placeholder="+91 94470 12345"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={parentForm.password}
                            onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })}
                            placeholder="Min 6 characters"
                            className="w-full px-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {parentForm.password && (
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${parentStrength.color}`}
                                style={{ width: `${(parentStrength.score / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{parentStrength.text}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={parentForm.confirm_password}
                            onChange={(e) => setParentForm({ ...parentForm, confirm_password: e.target.value })}
                            placeholder="Re-enter password"
                            className="w-full px-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Child Linking Request Section */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-emerald-600" />
                          <span>Student Linking Requests ({parentForm.children.length})</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Add all children studying at Chaldean Syrian HSS to link them under this single account.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddChild}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-all shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Another Child</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {parentForm.children.map((child, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                              Child #{index + 1}
                            </span>
                            {parentForm.children.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveChild(index)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                title="Remove child"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Admission Number *
                              </label>
                              <input
                                type="text"
                                required
                                value={child.admission_number}
                                onChange={(e) => handleChildChange(index, 'admission_number', e.target.value)}
                                placeholder="e.g. ADM-2024-001"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Student Full Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={child.student_name}
                                onChange={(e) => handleChildChange(index, 'student_name', e.target.value)}
                                placeholder="e.g. Arjun Nair"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Class Standard *
                              </label>
                              <select
                                value={child.class_name}
                                onChange={(e) => handleChildChange(index, 'class_name', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                              >
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
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Division *
                              </label>
                              <select
                                value={child.division}
                                onChange={(e) => handleChildChange(index, 'division', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                              >
                                <option value="A">Division A</option>
                                <option value="B">Division B</option>
                                <option value="C">Division C</option>
                                <option value="D">Division D</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="parent_terms"
                      checked={parentForm.agree_terms}
                      onChange={(e) => setParentForm({ ...parentForm, agree_terms: e.target.checked })}
                      className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="parent_terms" className="text-xs text-slate-600">
                      I certify that I am the legal parent/guardian of the requested student(s). I understand that child-linking requires separate Administrative verification against official school registers.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Submitting Application...' : 'Submit Parent Application'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Already registered footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Already registered with Chaldean Syrian HSS?</span>
                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
                  Sign In to Account →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

