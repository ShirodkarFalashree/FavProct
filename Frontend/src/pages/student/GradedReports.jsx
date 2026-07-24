import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Award, Clock, Eye, AlertCircle, Calendar } from "lucide-react";

const GradedReports = () => {
  const { user } = useAuth();
  const [graded, setGraded] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGradedReports = async () => {
    try {
      const res = await API.get(`/student-exams/student-dashboard?studentId=${user._id}`);
      setGraded(res.data.graded || []);
    } catch (err) {
      toast.error("Failed to load graded reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradedReports();
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
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
          <Award className="mr-2.5 h-7 w-7 text-indigo-400" />
          Graded Reports
        </h1>
        <p className="text-sm text-slate-455 mt-1">
          Review your marks, evaluator grades, and detailed answers for completed exams.
        </p>
      </div>

      {/* Grid */}
      {graded.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-16 text-center text-slate-500">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-655 mb-3" />
          <p className="font-semibold text-slate-400">No graded reports available yet</p>
          <p className="text-xs text-slate-500 mt-1">Once you complete a scheduled exam and the teacher submits feedback, your grade report will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {graded.map((allotment) => {
            const exam = allotment.examId || {};
            const scorePercentage = exam.totalMarks 
              ? Math.round((allotment.marksObtained / exam.totalMarks) * 100)
              : 0;

            let badgeColor = "bg-red-500/10 border-red-500/20 text-red-400";
            if (scorePercentage >= 75) {
              badgeColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-450";
            } else if (scorePercentage >= 50) {
              badgeColor = "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
            }

            return (
              <div
                key={allotment._id}
                className="rounded-xl border border-slate-855 bg-slate-900/40 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all hover:bg-slate-900/50"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">{exam.title || "Assessment"}</h4>
                      <span className="text-xs text-slate-500 uppercase font-mono mt-0.5 inline-block">{exam.code}</span>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${badgeColor}`}>
                      {scorePercentage}% Score
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-450 border-t border-slate-850/50 pt-3">
                    <div className="flex items-center">
                      <Clock className="mr-1.5 h-4 w-4 text-indigo-400" />
                      <span>{exam.duration} Mins</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="mr-1.5 h-4 w-4 text-purple-400" />
                      <span>{exam.totalMarks} Max Marks</span>
                    </div>
                    <div className="flex items-center col-span-2">
                      <Calendar className="mr-1.5 h-4 w-4 text-amber-400" />
                      <span className="truncate">
                        Completed: {allotment.submittedAt 
                          ? new Date(allotment.submittedAt).toLocaleDateString()
                          : new Date(allotment.updatedAt).toLocaleDateString()
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Marks Obtained</span>
                    <p className="text-lg font-black text-white leading-none mt-0.5">
                      {allotment.marksObtained} <span className="text-xs text-slate-500 font-medium">/ {exam.totalMarks}</span>
                    </p>
                  </div>

                  <Link
                    to={`/student/result/${allotment._id}`}
                    className="flex items-center rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 py-2 px-4 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                  >
                    Review Results
                    <Eye className="ml-1.5 h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GradedReports;
