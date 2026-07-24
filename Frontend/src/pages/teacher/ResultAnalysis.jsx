import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Award, TrendingUp, AlertCircle, User, FileText, Activity } from "lucide-react";
import { DoughnutChart } from "../../components/DashboardCharts";

const ResultAnalysis = () => {
  const { user } = useAuth();
  const [evaluated, setEvaluated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const res = await API.get(`/student-exams/teacher-dashboard?teacherId=${user._id}`);
        setEvaluated(res.data.evaluated || []);
      } catch (err) {
        toast.error("Failed to load evaluation results");
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

  // --- RESULTS PERFORMANCE ANALYSIS CALCULATIONS ---
  const evaluatedAllotments = evaluated.filter(a => a.examId && a.studentId);
  const totalEvaluated = evaluatedAllotments.length;

  let highestScorePercent = 0;
  let lowestScorePercent = 100;
  let sumScorePercent = 0;
  let outstandingCount = 0; // >= 75%
  let averageCount = 0; // 50% - 74%
  let belowAverageCount = 0; // < 50%

  evaluatedAllotments.forEach(a => {
    const maxMarks = a.examId.totalMarks || 1;
    const obtained = a.marksObtained || 0;
    const percent = Math.round((obtained / maxMarks) * 100);
    
    sumScorePercent += percent;
    if (percent > highestScorePercent) highestScorePercent = percent;
    if (percent < lowestScorePercent) lowestScorePercent = percent;

    if (percent >= 75) {
      outstandingCount++;
    } else if (percent >= 50) {
      averageCount++;
    } else {
      belowAverageCount++;
    }
  });

  const averageScorePercent = totalEvaluated > 0 ? Math.round(sumScorePercent / totalEvaluated) : 0;
  const actualLowest = totalEvaluated > 0 ? lowestScorePercent : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
          <Activity className="mr-2.5 h-7 w-7 text-indigo-400" />
          Result Analysis
        </h1>
        <p className="text-sm text-slate-450 mt-1">
          Review the performance trends, grade metrics, and historical scores of students evaluated by you.
        </p>
      </div>

      {totalEvaluated === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-16 text-center text-slate-500">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-655 mb-3" />
          <p className="font-semibold text-slate-400">No evaluated records found</p>
          <p className="text-xs text-slate-500 mt-1">Once you complete grading student exam submissions, detailed statistics will populate here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Split layout: Score Distribution Chart & Statistics list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (Chart) */}
            <div className="lg:col-span-1">
              <DoughnutChart
                title="Score Band Distribution"
                data={[
                  { label: "Outstanding (>=75%)", value: outstandingCount, color: "#10b981" },
                  { label: "Average (50%-74%)", value: averageCount, color: "#6366f1" },
                  { label: "Below Average (<50%)", value: belowAverageCount, color: "#ef4444" }
                ]}
              />
            </div>

            {/* Right Column (Metrics List) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
              
              <div className="rounded-xl border border-slate-850 bg-slate-950/20 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span>Average Class Score</span>
                </div>
                <p className="text-2xl font-black text-white">{averageScorePercent}%</p>
                <p className="text-[10px] text-slate-500">Across all exams evaluated by you.</p>
              </div>

              <div className="rounded-xl border border-slate-850 bg-slate-955/20 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Award className="h-4 w-4 text-indigo-400" />
                  <span>Highest Percentage Graded</span>
                </div>
                <p className="text-2xl font-black text-indigo-400">{highestScorePercent}%</p>
                <p className="text-[10px] text-slate-500">Top-performing student score.</p>
              </div>

              <div className="rounded-xl border border-slate-850 bg-slate-955/20 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  <span>Lowest Percentage Graded</span>
                </div>
                <p className="text-2xl font-black text-rose-400">{actualLowest}%</p>
                <p className="text-[10px] text-slate-500">Minimum scored evaluated sheet.</p>
              </div>

              <div className="rounded-xl border border-slate-855 bg-slate-955/20 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <User className="h-4 w-4 text-purple-400" />
                  <span>Total Students Graded</span>
                </div>
                <p className="text-2xl font-black text-purple-400">{totalEvaluated}</p>
                <p className="text-[10px] text-slate-500">Assessed answer submissions.</p>
              </div>

            </div>
          </div>

          {/* Graded Audit Log Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center">
              <FileText className="mr-1.5 h-4 w-4 text-indigo-400" />
              Graded Result Log
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-850">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-bold">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Cohort</th>
                    <th className="p-3">Exam Name</th>
                    <th className="p-3 text-center">Marks Obtained</th>
                    <th className="p-3 text-center">Percentage</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-955/10">
                  {evaluatedAllotments.map((allotment) => {
                    const exam = allotment.examId || {};
                    const student = allotment.studentId || {};
                    const percent = Math.round(((allotment.marksObtained || 0) / (exam.totalMarks || 1)) * 100);

                    let pillColor = "bg-red-500/10 border-red-500/20 text-red-400";
                    if (percent >= 75) pillColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-450";
                    else if (percent >= 50) pillColor = "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";

                    return (
                      <tr key={allotment._id} className="hover:bg-slate-900/20">
                        <td className="p-3 text-white font-semibold">{student.name}</td>
                        <td className="p-3 text-slate-400">{student.cohort || "N/A"}</td>
                        <td className="p-3 text-slate-300">
                          {exam.title} <span className="text-[10px] text-slate-500 font-mono">({exam.code})</span>
                        </td>
                        <td className="p-3 text-center font-bold text-white">
                          {allotment.marksObtained} <span className="text-slate-500 font-normal">/ {exam.totalMarks}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 border text-[10px] font-bold ${pillColor}`}>
                            {percent}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Link
                            to={`/teacher/evaluate/${allotment._id}`}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultAnalysis;
