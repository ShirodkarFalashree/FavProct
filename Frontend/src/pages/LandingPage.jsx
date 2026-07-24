import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Shield, Award, Activity, FileSpreadsheet, Lock, 
  ArrowRight, CheckCircle2, ChevronRight, Monitor, Building, Sparkles, Sun, Moon 
} from "lucide-react";

const LandingPage = () => {
  const { user } = useAuth();

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

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "superadmin") return "/superadmin";
    if (user.role === "admin") return "/admin";
    if (user.role === "teacher") return "/teacher";
    return "/student";
  };

  const features = [
    {
      title: "Automated Randomizer Matrix",
      description: "Define exam rules, choose question pools, and let the algorithm auto-select questions based on precise difficulty levels.",
      icon: Sparkles,
      iconClass: "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/30"
    },
    {
      title: "Proctored Exam Portal",
      description: "Secure fullscreen testing environment preventing tabs shifting, keyboard copy-paste hacks, and unauthorized exits.",
      icon: Lock,
      iconClass: "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-900/30"
    },
    {
      title: "Teacher Evaluation Suite",
      description: "Comprehensive console to review subjective answers, allocate partial marks, and append descriptive evaluator feedback.",
      icon: Shield,
      iconClass: "bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-900/30"
    },
    {
      title: "Real-time Result Analytics",
      description: "Dynamic visual dashboards with doughnut, line, and bar charts plotting class score bands and cohort performance trends.",
      icon: Activity,
      iconClass: "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30"
    },
    {
      title: "Question Pool Grid View",
      description: "Grid lists of all question banks with modals to inspect MCQ keys, illustrations, and subjective evaluation rubrics.",
      icon: FileSpreadsheet,
      iconClass: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30"
    },
    {
      title: "Multi-Tenant Operations",
      description: "Super Admin panel to instantly register institutions, configure license plans, and provision administrator credentials via email.",
      icon: Building,
      iconClass: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30"
    }
  ];

  const stats = [
    { value: "50+", label: "Registered Institutes" },
    { value: "10k+", label: "Assessments Conducted" },
    { value: "99.9%", label: "Platform Uptime" },
    { value: "0", label: "Proctor Exits Allowed" }
  ];

  return (
    <div className="min-h-screen bg-slate-955 text-slate-350 flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-300">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900/30 text-xs">
              FAV
            </div>
            <span className="text-lg font-bold tracking-wider text-slate-350 uppercase">
              FAVPROCT
            </span>
          </div>

          <nav className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
              title="Toggle light/dark theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {user ? (
              <Link
                to={getDashboardPath()}
                className="flex items-center text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl transition-all duration-200"
              >
                Go to Console
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4.5 rounded-xl transition-all duration-200"
                >
                  Register Portal
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative max-w-7xl mx-auto px-6 py-24 lg:py-36 flex flex-col items-center text-center space-y-8">
          
          {/* Minimalist Pastel Indigo Badge */}
          <div className="inline-flex items-center space-x-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" />
            <span>Next-Generation Proctoring Platform</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-300 tracking-tight leading-none max-w-4xl">
            Automated Exam Delivery & <span className="text-indigo-600 dark:text-indigo-300">Proctored Evaluations</span>
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-slate-450 max-w-2xl leading-relaxed">
            Provision multi-tenant academic environments, randomize complex question pools, monitor exam integrity, and plot advanced grade metrics in a secure pastel-accented dashboard.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to={getDashboardPath()}
              className="flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3.5 px-8 text-sm font-semibold text-white transition-all cursor-pointer"
            >
              {user ? "Enter Your Dashboard" : "Get Started Now"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            {!user && (
              <Link
                to="/register"
                className="flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 py-3.5 px-8 text-sm font-semibold text-slate-350 transition-colors cursor-pointer"
              >
                Register Institute
              </Link>
            )}
          </div>
        </section>

        {/* Stats Grid */}
        <section className="border-y border-slate-800 bg-slate-900/10 py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-300 tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-slate-550 uppercase font-semibold tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 lg:py-36 space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-300 uppercase tracking-wider">Full-Suite Academic Features</h2>
            <p className="text-xs text-slate-450 max-w-xl mx-auto leading-relaxed">
              Every tool required to organize course structures, build test modules, proctor students, and compile grading evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-850 bg-slate-900/20 p-6 space-y-4 hover:border-slate-700 transition-all duration-300 group"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feat.iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-snug">{feat.title}</h3>
                  <p className="text-xs text-slate-450 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Integration spotlight */}
        <section className="max-w-5xl mx-auto px-6 pb-24 lg:pb-36">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 max-w-lg">
              <h3 className="text-lg font-bold text-slate-300 uppercase tracking-wide">Ready to streamline examinations?</h3>
              <p className="text-xs text-slate-450 leading-relaxed">
                Connect your academic cohort list today. Register your institute code, allot students via Excel, and receive detailed grade feedback logs automatically.
              </p>
            </div>
            <Link
              to={getDashboardPath()}
              className="flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 text-xs font-semibold transition-all shrink-0 cursor-pointer"
            >
              {user ? "Open Workspace" : "Access Portal Console"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-550">
          <p>© {new Date().getFullYear()} FAVPROCT assessment portal. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 mr-1 shrink-0" />
              Secure Proctor Active
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
