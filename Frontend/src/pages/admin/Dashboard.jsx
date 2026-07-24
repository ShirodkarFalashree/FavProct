import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Users, GraduationCap, ClipboardList, Layers, FileText, CheckCircle, Clock } from "lucide-react";
import { DoughnutChart, BarChart } from "../../components/DashboardCharts";
import { CalendarView } from "../../components/CalendarView";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    cohortsCount: 0,
    examsCount: 0,
    totalAllotments: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0
  });
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatsAndExams = async () => {
      try {
        const statsRes = await API.get(`/admin/stats?organizationId=${user.organizationId}`);
        setStats(statsRes.data);
        
        const examsRes = await API.get(`/exam?organizationId=${user.organizationId}`);
        setExams(examsRes.data);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStatsAndExams();
  }, [user.organizationId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats.studentsCount, icon: GraduationCap, color: "from-blue-500 to-indigo-500" },
    { label: "Total Teachers", value: stats.teachersCount, icon: Users, color: "from-indigo-500 to-purple-500" },
    { label: "Cohorts/Grades", value: stats.cohortsCount, icon: Layers, color: "from-purple-500 to-pink-500" },
    { label: "Exams Configured", value: stats.examsCount, icon: FileText, color: "from-pink-500 to-rose-500" },
    { label: "Total Allotments", value: stats.totalAllotments, icon: ClipboardList, color: "from-amber-500 to-orange-500" },
    { label: "Pending Reviews", value: stats.pendingEvaluations, icon: Clock, color: "from-orange-500 to-red-500" },
    { label: "Completed Reviews", value: stats.completedEvaluations, icon: CheckCircle, color: "from-emerald-500 to-teal-500" }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Control Panel</h1>
          <p className="text-sm text-indigo-400 mt-1">Welcome back, <strong className="text-white font-bold">{user.name}</strong></p>
        </div>
        <div className="text-left md:text-right">
          <span className="inline-flex items-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-300">
            {user.organizationName || "Institution Admin"}
          </span>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Org ID: {user.organizationId}</p>
        </div>
      </div>

      {/* Grid containing Calendar (top-left) and Statistics Cards (top-right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Left: Calendar View */}
        <div className="lg:col-span-1">
          <CalendarView exams={exams} title="Scheduled Exams" />
        </div>

        {/* Top Right: Stat Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400 truncate pr-2">{card.label}</span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr ${card.color} text-white shadow-md shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold text-white tracking-tight">{card.value}</span>
                </div>
                {/* Subtle background glow */}
                <div className={`absolute bottom-0 right-0 h-10 w-10 bg-gradient-to-tr ${card.color} opacity-5 blur-md rounded-full`}></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChart
          title="Evaluation Status Breakdown"
          data={[
            { label: "Completed", value: stats.completedEvaluations, color: "#10b981" },
            { label: "Pending", value: stats.pendingEvaluations, color: "#f97316" },
            { label: "Unsubmitted/Allotted", value: Math.max(0, stats.totalAllotments - stats.pendingEvaluations - stats.completedEvaluations), color: "#6366f1" }
          ]}
        />
        <BarChart
          title="Institution Directory Stats"
          data={[
            { label: "Students", value: stats.studentsCount, color: "from-blue-500 to-indigo-500" },
            { label: "Teachers", value: stats.teachersCount, color: "from-indigo-500 to-purple-500" },
            { label: "Cohorts", value: stats.cohortsCount, color: "from-purple-500 to-pink-500" },
            { label: "Exams", value: stats.examsCount, color: "from-pink-500 to-rose-500" }
          ]}
        />
      </div>

      {/* Overview Block */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-4">Quick Operations Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
          <div className="space-y-2">
            <h4 className="font-semibold text-indigo-400">1. Setup Structure</h4>
            <p className="text-slate-400 leading-relaxed">
              Go to <strong>Cohorts & Classes</strong> to define your academic grades and add subjects. This forms the basis of courses.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-purple-400">2. Prepare Exams</h4>
            <p className="text-slate-400 leading-relaxed">
              Upload your question bank via Excel in <strong>Question Banks</strong>, then go to <strong>Create Exam</strong> to select random questions.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-amber-400">3. Register & Allot</h4>
            <p className="text-slate-400 leading-relaxed">
              Upload your student Excel sheet in <strong>Allot Exams</strong>. The system will automatically create student/teacher accounts and send email invitations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
