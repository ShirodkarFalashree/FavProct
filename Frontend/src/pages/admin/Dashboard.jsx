import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Users, GraduationCap, ClipboardList, Layers, FileText, CheckCircle, Clock } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get(`/admin/stats?organizationId=${user.organizationId}`);
        setStats(res.data);
      } catch (err) {
        toast.error("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
    { label: "Total Exam Allotments", value: stats.totalAllotments, icon: ClipboardList, color: "from-amber-500 to-orange-500" },
    { label: "Pending Evaluations", value: stats.pendingEvaluations, icon: Clock, color: "from-orange-500 to-red-500" },
    { label: "Evaluations Completed", value: stats.completedEvaluations, icon: CheckCircle, color: "from-emerald-500 to-teal-500" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Control Panel</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review overall registration levels and evaluation activities across your institution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">{card.label}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white tracking-tight">{card.value}</span>
              </div>
              {/* Subtle background glow */}
              <div className={`absolute bottom-0 right-0 h-16 w-16 bg-gradient-to-tr ${card.color} opacity-5 blur-xl rounded-full`}></div>
            </div>
          );
        })}
      </div>

      {/* Overview Block */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-4">Quick Operations Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
          <div className="space-y-2">
            <h4 className="font-semibold text-indigo-400">1. Setup Structure</h4>
            <p className="text-slate-400 leading-relaxed">
              Go to <strong>Cohorts & Classes</strong> to define your academic grades and add subjects. This forms the basis of your courses.
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
