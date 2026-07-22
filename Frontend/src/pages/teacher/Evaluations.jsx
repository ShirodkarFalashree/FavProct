import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { ClipboardList, CheckCircle, User, Layers, Calendar, ChevronRight } from "lucide-react";

const Evaluations = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ pending: [], evaluated: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await API.get(`/student-exams/teacher-dashboard?teacherId=${user._id}`);
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load evaluations");
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, [user._id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const list = activeTab === "pending" ? data.pending : data.evaluated;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Evaluations Center</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review and grade student responses, view automatic MCQ scores, and write constructive feedback comments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center pb-4 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "pending"
              ? "border-indigo-500 text-white font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          Pending Grading ({data.pending.length})
        </button>
        <button
          onClick={() => setActiveTab("evaluated")}
          className={`flex items-center pb-4 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "evaluated"
              ? "border-indigo-500 text-white font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Evaluated ({data.evaluated.length})
        </button>
      </div>

      {/* List Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center text-slate-500">
            No items found under this tab.
          </div>
        ) : (
          <div className="divide-y divide-slate-850">
            {list.map((allotment) => (
              <div key={allotment._id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base leading-tight">
                    {allotment.examId?.title || "Untitled Exam"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center">
                      <User className="mr-1 h-3.5 w-3.5 text-indigo-400" />
                      {allotment.studentId?.name || "Student"}
                    </span>
                    <span className="flex items-center">
                      <Layers className="mr-1 h-3.5 w-3.5 text-purple-400" />
                      {allotment.studentId?.cohort || "Cohort"}
                    </span>
                    {allotment.submittedAt && (
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3.5 w-3.5 text-slate-500" />
                        Submitted: {new Date(allotment.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {activeTab === "evaluated" && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Score Awarded</p>
                      <p className="text-sm font-bold text-emerald-400 mt-0.5">
                        {allotment.marksObtained} / {allotment.examId?.totalMarks}
                      </p>
                    </div>
                  )}
                  <Link
                    to={`/teacher/evaluate/${allotment._id}`}
                    className={`inline-flex items-center rounded-xl py-2 px-4 text-xs font-semibold text-white transition-colors ${
                      activeTab === "pending"
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                    }`}
                  >
                    {activeTab === "pending" ? "Start Grading" : "Review Grade"}
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Evaluations;
