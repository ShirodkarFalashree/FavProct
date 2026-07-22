import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { GraduationCap, Clock, Award, PlayCircle, Eye, AlertCircle, Calendar } from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ available: [], pending: [], graded: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    const fetchStudentDashboard = async () => {
      try {
        const res = await API.get(`/student-exams/student-dashboard?studentId=${user._id}`);
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load student dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStudentDashboard();
  }, [user._id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const getTabCount = (tab) => {
    if (tab === "available") return data.available.length;
    if (tab === "pending") return data.pending.length;
    return data.graded.length;
  };

  const getActiveList = () => {
    if (activeTab === "available") return data.available;
    if (activeTab === "pending") return data.pending;
    return data.graded;
  };

  const list = getActiveList();

  return (
    <div className="space-y-8">
      {/* Student Profile Overview banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-tr from-slate-900/60 to-indigo-950/20 p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">Student Dashboard</h2>
            <p className="text-sm text-slate-400 mt-1">
              Registered Cohort: <strong className="text-slate-200">{user.cohort || "Not Assigned"}</strong>
            </p>
          </div>
        </div>
        <div className="text-left md:text-right text-xs text-slate-500">
          <p>Student Identifier: {user.email}</p>
          <p className="mt-0.5">Organization ID: {user.organizationId}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {[
          { id: "available", label: "Available Exams", icon: PlayCircle },
          { id: "pending", label: "Pending Evaluation", icon: Clock },
          { id: "graded", label: "Graded & Results", icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center pb-4 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-indigo-500 text-white font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="mr-2 h-4 w-4" />
              {tab.label} ({getTabCount(tab.id)})
            </button>
          );
        })}
      </div>

      {/* List content */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center text-slate-500">
            No exams in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((allotment) => {
              const exam = allotment.examId || {};
              return (
                <div
                  key={allotment._id}
                  className="rounded-xl border border-slate-850 bg-slate-900/40 p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-white text-base leading-tight">{exam.title || "Assessment"}</h4>
                      <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-950/40 border border-slate-850 px-2 py-0.5 rounded-md">
                        {exam.code}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3.5 w-3.5 text-indigo-400" />
                        {exam.duration} Mins
                      </span>
                      <span className="flex items-center">
                        <Award className="mr-1 h-3.5 w-3.5 text-purple-400" />
                        {exam.totalMarks} Marks
                      </span>
                    </div>
                  </div>

                  {activeTab === "available" && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-850">
                      <div className="text-[10px] text-slate-500 flex items-center">
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        Allotted: {new Date(allotment.createdAt).toLocaleDateString()}
                      </div>
                      <Link
                        to={`/student/exam/${allotment._id}`}
                        className="flex items-center rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2 px-4 text-xs font-semibold text-white transition-colors"
                      >
                        Start Exam
                        <PlayCircle className="ml-1.5 h-4 w-4" />
                      </Link>
                    </div>
                  )}

                  {activeTab === "pending" && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-850 text-xs">
                      <span className="text-amber-400 flex items-center font-medium">
                        <AlertCircle className="mr-1 h-3.5 w-3.5" />
                        Awaiting Teacher Evaluation
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Submitted: {allotment.submittedAt ? new Date(allotment.submittedAt).toLocaleDateString() : "Pending"}
                      </span>
                    </div>
                  )}

                  {activeTab === "graded" && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-850">
                      <div className="text-left">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Your Grade</p>
                        <p className="text-base font-black text-emerald-400 mt-0.5">
                          {allotment.marksObtained} <span className="text-[10px] text-slate-500">/ {exam.totalMarks}</span>
                        </p>
                      </div>
                      <Link
                        to={`/student/result/${allotment._id}`}
                        className="flex items-center rounded-xl bg-slate-850 border border-slate-700 hover:bg-slate-800 py-2 px-4 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        Review Results
                        <Eye className="ml-1.5 h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
