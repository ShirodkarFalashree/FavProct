import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { ClipboardList, CheckCircle2, User, BookOpen, Layers, ArrowRight } from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ pending: [], evaluated: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const res = await API.get(`/student-exams/teacher-dashboard?teacherId=${user._id}`);
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load teacher stats");
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, [user._id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Teacher Console</h1>
        <p className="text-sm text-slate-400 mt-1">
          Welcome back, {user.name}. Grade submitted student exams and review feedback history.
        </p>
      </div>

      {/* Row 1: Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Pending Grading</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shadow-md">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">{data.pending.length}</span>
            <Link
              to="/teacher/evaluations"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center transition-colors"
            >
              Grade Now
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Grading Completed</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white tracking-tight">{data.evaluated.length}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Assigned Courses</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1">
            {user.subjects && user.subjects.length > 0 ? (
              user.subjects.map((sub, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-400"
                >
                  {sub}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No courses tagged</span>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Recent Pending evaluations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Pending Evaluations</h3>
        {data.pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-8 text-center text-slate-500 text-sm">
            Hooray! No pending student exams to evaluate right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-850">
            {data.pending.slice(0, 5).map((allotment) => (
              <div key={allotment._id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{allotment.examId?.title || "Untitled Exam"}</p>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center">
                      <User className="mr-1 h-3.5 w-3.5 text-indigo-400" />
                      {allotment.studentId?.name || "Student"}
                    </span>
                    <span className="flex items-center">
                      <Layers className="mr-1 h-3.5 w-3.5 text-purple-400" />
                      {allotment.studentId?.cohort || "N/A"}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/teacher/evaluate/${allotment._id}`}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2 px-4 text-xs font-semibold text-white transition-colors"
                >
                  Evaluate
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
