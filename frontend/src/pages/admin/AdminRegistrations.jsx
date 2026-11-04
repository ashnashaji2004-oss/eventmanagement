import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  KeyRound,
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function AdminRegistrations() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('teachers_pending');
  // 'teachers_pending' | 'parents_pending' | 'child_links' | 'approved' | 'rejected_suspended'

  const [users, setUsers] = useState([]);
  const [childLinks, setChildLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Rejection modal state
  const [rejectModal, setRejectModal] = useState({ open: false, type: 'user', id: null, name: '', reason: '' });
  // Password reset modal state
  const [resetModal, setResetModal] = useState({ open: false, user: null, tempPassword: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (activeTab === 'child_links') {
        const res = await api.get('/admin/child-link-requests/');
        const list = res.data?.results || (Array.isArray(res.data) ? res.data : []);
        setChildLinks(list);
      } else {
        let role = '';
        let status = '';

        if (activeTab === 'teachers_pending') {
          role = 'TEACHER';
          status = 'PENDING';
        } else if (activeTab === 'parents_pending') {
          role = 'PARENT';
          status = 'PENDING';
        } else if (activeTab === 'approved') {
          status = 'APPROVED';
        } else if (activeTab === 'rejected_suspended') {
          status = '';
        }

        const params = {};
        if (role) params.role = role;
        if (status) params.status = status;
        if (search) params.search = search;

        const res = await api.get('/admin/users/', { params });
        let list = res.data?.results || (Array.isArray(res.data) ? res.data : []);
        if (activeTab === 'rejected_suspended') {
          list = list.filter(u => u.verification_status === 'REJECTED' || u.verification_status === 'SUSPENDED');
        }
        setUsers(list);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch registration records.');
    } finally {
      setLoading(false);
    }
  };

  // User Actions: Approve, Suspend, Reactivate
  const handleUserAction = async (userId, actionType, rejectionReason = '') => {
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post(`/admin/users/${userId}/verify/`, {
        action: actionType,
        rejection_reason: rejectionReason
      });
      setMessage(res.data.message || `Action ${actionType} completed successfully.`);
      setRejectModal({ open: false, type: 'user', id: null, name: '', reason: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to perform ${actionType}.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Password reset for account
  const handleResetPassword = async (userId) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/users/${userId}/reset-password/`);
      setResetModal({
        open: true,
        user: users.find(u => u.id === userId),
        tempPassword: res.data.temporary_password
      });
    } catch (err) {
      setError('Failed to initiate password reset.');
    } finally {
      setActionLoading(false);
    }
  };

  // Child Link Request Actions
  const handleChildLinkAction = async (linkId, actionType, rejectionReason = '') => {
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      if (actionType === 'APPROVE') {
        const res = await api.post(`/admin/child-link-requests/${linkId}/approve_link/`);
        setMessage(res.data.message);
      } else {
        const res = await api.post(`/admin/child-link-requests/${linkId}/reject_link/`, {
          rejection_reason: rejectionReason
        });
        setMessage(res.data.message);
      }
      setRejectModal({ open: false, type: 'link', id: null, name: '', reason: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update child link status.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredChildLinks = (Array.isArray(childLinks) ? childLinks : []).filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.student_admission_number?.toLowerCase().includes(s) ||
      l.student_name?.toLowerCase().includes(s) ||
      l.parent_name?.toLowerCase().includes(s) ||
      l.parent_email?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-purple-700" />
            <span>Registration & Verification Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review and authenticate teacher faculty registrations, parent access requests, and parent-child linking validations.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            placeholder="Search name, email, employee ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Alert Banners */}
      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-800">
          <XCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('teachers_pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'teachers_pending'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Teacher Requests</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('parents_pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'parents_pending'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Parent Requests</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'approved'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Approved Accounts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('child_links')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'child_links'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Child Linking Requests</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rejected_suspended')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'rejected_suspended'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          <UserX className="w-4 h-4 text-red-500" />
          <span>Rejected & Suspended</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <span className="text-xs text-slate-400">Loading registration records...</span>
          </div>
        ) : activeTab === 'child_links' ? (
          /* ================= CHILD LINK REQUESTS TABLE ================= */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Parent Details</th>
                  <th className="py-3.5 px-4">Requested Student</th>
                  <th className="py-3.5 px-4">Class & Division</th>
                  <th className="py-3.5 px-4">Status & Matched Record</th>
                  <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(filteredChildLinks) && filteredChildLinks.length > 0 ? (
                  filteredChildLinks.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="block font-bold text-slate-900">{req.parent_name}</span>
                        <span className="text-slate-500 text-[11px]">{req.parent_email} • {req.parent_phone}</span>
                        <span className="block text-[10px] text-indigo-600">Relation: {req.relationship_type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="block font-bold text-slate-900">{req.student_name}</span>
                        <span className="font-mono text-purple-700 text-[11px]">Adm: {req.student_admission_number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          Class {req.class_name}-{req.division}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {req.status === 'APPROVED' && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Approved & Linked
                            </span>
                          )}
                          {req.status === 'PENDING' && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Pending Match
                            </span>
                          )}
                          {req.status === 'REJECTED' && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                              Rejected
                            </span>
                          )}
                          {req.matched_student_name && (
                            <span className="block text-[10px] text-emerald-700">
                              ✓ Matched: {req.matched_student_name} ({req.matched_student_house})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleChildLinkAction(req.id, 'APPROVE')}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-2xs transition-all"
                            >
                              Approve Link
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectModal({ open: true, type: 'link', id: req.id, name: `${req.student_name} (${req.student_admission_number})`, reason: '' })}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs transition-all"
                            >
                              Reject Link
                            </button>
                          </>
                        )}
                        {req.status !== 'PENDING' && (
                          <span className="text-[11px] text-slate-400">
                            Verified by {req.verified_by_name || 'Admin'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                      No child-linking requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ================= USER ACCOUNTS TABLE ================= */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Applicant / User</th>
                  <th className="py-3.5 px-4">Role & Reference</th>
                  <th className="py-3.5 px-4">Role Details</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="block font-bold text-slate-900 text-sm">
                          {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}
                        </span>
                        <span className="text-slate-500 text-[11px] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {u.email}
                        </span>
                        {u.phone_number && (
                          <span className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {u.phone_number}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${u.role === 'TEACHER' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                          {u.role}
                        </span>
                        <span className="block text-[11px] font-mono text-slate-500 pt-0.5">
                          {u.application_number || `UID-${u.id}`}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {u.role === 'TEACHER' && u.teacher_profile && (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900">
                              ID: {u.teacher_profile.employee_id}
                            </span>
                            <span className="block text-slate-500 text-[11px]">
                              {u.teacher_profile.department} ({u.teacher_profile.designation})
                            </span>
                          </div>
                        )}
                        {u.role === 'PARENT' && (
                          <div className="space-y-0.5">
                            <span className="text-slate-700">
                              {u.parent_profile?.children?.length || 0} Linked Children
                            </span>
                            {u.child_requests?.length > 0 && (
                              <span className="block text-[10px] text-amber-600 font-semibold">
                                {u.child_requests.length} link requests pending
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          {u.verification_status === 'APPROVED' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Approved
                            </span>
                          )}
                          {u.verification_status === 'PENDING' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Pending Review
                            </span>
                          )}
                          {u.verification_status === 'REJECTED' && (
                            <div>
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                Rejected
                              </span>
                              {u.rejection_reason && (
                                <p className="text-[10px] text-red-600 max-w-xs truncate pt-0.5">
                                  {u.rejection_reason}
                                </p>
                              )}
                            </div>
                          )}
                          {u.verification_status === 'SUSPENDED' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                              Suspended
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Pending Approvals */}
                        {u.verification_status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUserAction(u.id, 'APPROVE')}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-2xs transition-all"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectModal({ open: true, type: 'user', id: u.id, name: u.get_full_name || u.username, reason: '' })}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Approved Accounts Management */}
                        {u.verification_status === 'APPROVED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleResetPassword(u.id)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-xs transition-all inline-flex items-center gap-1"
                              title="Reset password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Reset Password</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUserAction(u.id, 'SUSPEND')}
                              disabled={actionLoading}
                              className="px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 font-semibold rounded-lg text-xs transition-all inline-flex items-center gap-1"
                              title="Suspend account access"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </button>
                          </>
                        )}

                        {/* Suspended or Rejected Reactivation */}
                        {(u.verification_status === 'SUSPENDED' || u.verification_status === 'REJECTED') && (
                          <button
                            type="button"
                            onClick={() => handleUserAction(u.id, 'REACTIVATE')}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-all inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reactivate Account</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                      No accounts found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal with Mandatory Reason */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Reject {rejectModal.type === 'user' ? 'Application' : 'Link Request'}
                </h3>
                <span className="text-xs text-slate-500">{rejectModal.name}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              In accordance with school policy, you must provide a valid official reason for rejection that will be visible to the applicant.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Rejection Reason *
              </label>
              <textarea
                required
                rows={3}
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="e.g. Employee ID not found in faculty register / Admission number does not match student name..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal({ open: false, type: 'user', id: null, name: '', reason: '' })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectModal.reason.trim() || actionLoading}
                onClick={() => {
                  if (rejectModal.type === 'user') {
                    handleUserAction(rejectModal.id, 'REJECT', rejectModal.reason);
                  } else {
                    handleChildLinkAction(rejectModal.id, 'REJECT', rejectModal.reason);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-slate-900">
                Password Reset Successfully
              </h3>
              <p className="text-xs text-slate-500">
                A temporary password has been generated for {resetModal.user?.username}.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-base text-indigo-700 select-all">
              {resetModal.tempPassword}
            </div>

            <button
              type="button"
              onClick={() => setResetModal({ open: false, user: null, tempPassword: '' })}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

