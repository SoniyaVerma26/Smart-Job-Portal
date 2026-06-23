import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import JobListingsPage from './pages/JobListingsPage';
import JobDetailPage from './pages/JobDetailPage';
import ProfilePage from './pages/ProfilePage';

import SeekerDashboard from './pages/seeker/SeekerDashboard';
import AppliedJobsPage from './pages/seeker/AppliedJobsPage';
import MyApplicationsPage from './pages/seeker/MyApplicationsPage';
import SavedJobsPage from './pages/seeker/SavedJobsPage';

import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJobPage from './pages/recruiter/PostJobPage';
import MyJobsPage from './pages/recruiter/MyJobsPage';
import ApplicantsPage from './pages/recruiter/ApplicantsPage';

function ProfileRedirect() {
  const { profile } = useAuth();
  if (!profile) return null;
  return <ProfilePage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/jobs" element={<JobListingsPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />

      {/* Job Seeker Routes */}
      <Route element={<DashboardLayout requiredRole="job_seeker" />}>
        <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
        <Route path="/seeker/applied" element={<AppliedJobsPage />} />
        <Route path="/seeker/applications" element={<MyApplicationsPage />} />
        <Route path="/seeker/saved" element={<SavedJobsPage />} />
      </Route>

      {/* Recruiter Routes */}
      <Route element={<DashboardLayout requiredRole="recruiter" />}>
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/post-job" element={<PostJobPage />} />
        <Route path="/recruiter/my-jobs" element={<MyJobsPage />} />
        <Route path="/recruiter/applicants" element={<ApplicantsPage />} />
      </Route>

      {/* Profile (accessible by both roles) */}
      <Route path="/profile" element={<ProfileRedirect />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
