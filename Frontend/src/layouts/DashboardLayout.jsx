import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileSpreadsheet,
  FileText,
  ClipboardList,
  LogOut,
  Menu,
  X,
  User,
  GraduationCap,
  Award,
  Activity,
  Sun,
  Moon
} from "lucide-react";

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Link to="/login" />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getAdminLinks = () => [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Cohorts & Classes", path: "/admin/cohorts", icon: BookOpen },
    { label: "Teachers", path: "/admin/teachers", icon: Users },
    { label: "Question Banks", path: "/admin/questions", icon: FileSpreadsheet },
    { label: "Create Exam", path: "/admin/exams/create", icon: FileText },
    { label: "Profile Settings", path: "/profile", icon: User }
  ];

  const getTeacherLinks = () => [
    { label: "Dashboard", path: "/teacher", icon: LayoutDashboard },
    { label: "Pending Evaluations", path: "/teacher/evaluations", icon: ClipboardList },
    { label: "Result Analysis", path: "/teacher/analysis", icon: Activity },
    { label: "Profile Settings", path: "/profile", icon: User }
  ];

  const getStudentLinks = () => [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard },
    { label: "Scheduled Exams", path: "/student/scheduled", icon: ClipboardList },
    { label: "Graded Reports", path: "/student/graded", icon: Award },
    { label: "Profile Settings", path: "/profile", icon: User }
  ];

  const getSuperAdminLinks = () => [
    { label: "Dashboard", path: "/superadmin", icon: LayoutDashboard },
    { label: "Profile Settings", path: "/profile", icon: User }
  ];

  const links =
    user.role === "superadmin"
      ? getSuperAdminLinks()
      : user.role === "admin"
      ? getAdminLinks()
      : user.role === "teacher"
      ? getTeacherLinks()
      : getStudentLinks();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 border-r border-slate-800 bg-slate-900/40 backdrop-blur-md md:flex md:flex-col">
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-100 font-bold border border-slate-700 text-xs">
              FAV
            </div>
            <span className="text-base font-bold tracking-wider text-slate-105 uppercase">
              FAVPROCT
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          <nav className="flex-1 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/25"
    : "text-slate-400 hover:bg-slate-100 hover:text-black"
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-black"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-800 pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-slate-400" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <aside className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-900 border-r border-slate-800 pt-5 pb-4 px-4 z-50">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex items-center space-x-2 px-2 pb-6 border-b border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-100 font-bold border border-slate-700 text-xs">
                FAV
              </div>
              <span className="text-base font-bold tracking-wider text-slate-105 uppercase">FAVPROCT</span>
            </div>

            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-xl ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-4 h-6 w-6" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-3 text-base font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl"
              >
                <LogOut className="mr-4 h-6 w-6" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/25 px-6 backdrop-blur-md">
          <button
            type="button"
            className="text-slate-400 focus:outline-none md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="ml-auto flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
              title="Toggle light/dark theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5" />
              ) : (
                <Moon className="h-4.5 w-4.5" />
              )}
            </button>

            <div className="flex items-center space-x-3 rounded-full border border-slate-800 bg-slate-900/60 py-1.5 pl-3 pr-4 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                <User className="h-4.5 w-4.5" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-none mt-0.5">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
