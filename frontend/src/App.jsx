import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './i18n';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import ScoreboardPage from './pages/ScoreboardPage';
import ProjectorScoreboardPage from './pages/ProjectorScoreboardPage';
import RegistrationStatusPage from './pages/RegistrationStatusPage';
import VerifyCertificatePage from './pages/VerifyCertificatePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminStudents from './pages/admin/AdminStudents';
import AdminResults from './pages/admin/AdminResults';
import AdminHouses from './pages/admin/AdminHouses';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminSettings from './pages/admin/AdminSettings';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import EventManagement from './pages/teacher/EventManagement';
import AssignedEvents from './pages/teacher/AssignedEvents';
import ParticipantManagement from './pages/teacher/ParticipantManagement';
import ResultsEntry from './pages/teacher/ResultsEntry';
import StudentManagement from './pages/teacher/StudentManagement';
import CertificateManagement from './pages/teacher/CertificateManagement';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildrenProfiles from './pages/parent/ChildrenProfiles';
import ChildAchievements from './pages/parent/ChildAchievements';
import CertificateGallery from './pages/parent/CertificateGallery';

function LayoutWrapper({ children }) {
  const location = useLocation();
  const isProjector = location.pathname.startsWith('/projector');

  if (isProjector) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <LayoutWrapper>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/scoreboard" element={<ScoreboardPage />} />
            <Route path="/projector/scoreboard" element={<ProjectorScoreboardPage />} />
            <Route path="/registration-status" element={<RegistrationStatusPage />} />
            <Route path="/verify-certificate/:token" element={<VerifyCertificatePage />} />
            <Route path="/verify/:token" element={<VerifyCertificatePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/registrations"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminRegistrations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/results"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/houses"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminHouses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/certificates"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminCertificates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/events"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <EventManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assigned-events"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <AssignedEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/participants"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <ParticipantManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/results"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <ResultsEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <StudentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/certificates"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <CertificateManagement />
                </ProtectedRoute>
              }
            />

            {/* Parent Routes */}
            <Route
              path="/parent/dashboard"
              element={
                <ProtectedRoute allowedRoles={['PARENT']}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/children"
              element={
                <ProtectedRoute allowedRoles={['PARENT']}>
                  <ChildrenProfiles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/child-achievements/:studentId"
              element={
                <ProtectedRoute allowedRoles={['PARENT']}>
                  <ChildAchievements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/certificates"
              element={
                <ProtectedRoute allowedRoles={['PARENT']}>
                  <CertificateGallery />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutWrapper>
      </Router>
    </AuthProvider>
  );
}
