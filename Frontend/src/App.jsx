import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import Cohorts from "./pages/admin/Cohorts";
import Teachers from "./pages/admin/Teachers";
import QuestionBank from "./pages/admin/QuestionBank";
import ExamCreation from "./pages/admin/ExamCreation";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import Evaluations from "./pages/teacher/Evaluations";
import EvaluateExam from "./pages/teacher/EvaluateExam";
import ResultAnalysis from "./pages/teacher/ResultAnalysis";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import ScheduledExams from "./pages/student/ScheduledExams";
import GradedReports from "./pages/student/GradedReports";
import ExamPortal from "./pages/student/ExamPortal";
import ExamResult from "./pages/student/ExamResult";
import ProfileSettings from "./pages/ProfileSettings";
import LandingPage from "./pages/LandingPage";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles to their dashboard
    if (user.role === "superadmin") return <Navigate to="/superadmin" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher" replace />;
    return <Navigate to="/student" replace />;
  }

  return <DashboardLayout />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #334155"
          }
        }} />
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* SuperAdmin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/cohorts" element={<Cohorts />} />
            <Route path="/admin/teachers" element={<Teachers />} />
            <Route path="/admin/questions" element={<QuestionBank />} />
            <Route path="/admin/exams/create" element={<ExamCreation />} />
          </Route>

          {/* Teacher Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/evaluations" element={<Evaluations />} />
            <Route path="/teacher/evaluate/:studentExamId" element={<EvaluateExam />} />
            <Route path="/teacher/analysis" element={<ResultAnalysis />} />
          </Route>

          {/* Student Protected Routes (Dashboard & Result inside shell) */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/scheduled" element={<ScheduledExams />} />
            <Route path="/student/graded" element={<GradedReports />} />
            <Route path="/student/result/:studentExamId" element={<ExamResult />} />
          </Route>

          {/* Shared Profile Settings Protected Route */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "teacher", "student"]} />}>
            <Route path="/profile" element={<ProfileSettings />} />
          </Route>

          {/* Student Exam Portal (Fullscreen, no shell) */}
          <Route
            path="/student/exam/:studentExamId"
            element={
              <ExamPortalGuard>
                <ExamPortal />
              </ExamPortalGuard>
            }
          />

          {/* Fallback routes */}
          <Route path="*" element={<FallbackRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Special guard to prevent accessing exam portal without student role
const ExamPortalGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "student") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Generic Redirect based on active session
const FallbackRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "superadmin") return <Navigate to="/superadmin" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
};

export default App;
