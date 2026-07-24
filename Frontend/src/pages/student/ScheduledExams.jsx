import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { ClipboardList, Clock, Award, PlayCircle, Lock, Calendar, AlertCircle } from "lucide-react";

const ScheduledExams = () => {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const fetchScheduledExams = async () => {
    try {
      const res = await API.get(`/student-exams/student-dashboard?studentId=${user._id}`);
      setAvailable(res.data.available || []);
    } catch (err) {
      toast.error("Failed to load scheduled exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledExams();

    // Set up timer to refresh the current time every second so button state dynamically updates
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
              <ClipboardList className="mr-2.5 h-7 w-7 text-indigo-400" />
              Scheduled Exams
            </h1>
            <p className="text-sm text-slate-450 mt-1">
              Your allotted assessments. Exams will automatically unlock at their scheduled start times.
            </p>
          </div>
          <div className="text-left md:text-right">
            <span className="inline-flex items-center rounded-xl bg-slate-850 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-350">
              Current Time: {now.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {available.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-16 text-center text-slate-500">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-655 mb-3" />
          <p className="font-semibold text-slate-400">No scheduled exams right now</p>
          <p className="text-xs text-slate-500 mt-1">You will be notified once a teacher schedules an exam for you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {available.map((allotment) => {
            const exam = allotment.examId || {};
            const scheduledTime = exam.scheduledDateTime ? new Date(exam.scheduledDateTime) : null;
            const isReady = !scheduledTime || now >= scheduledTime;

            return (
              <div
                key={allotment._id}
                className={`rounded-xl border p-5 flex flex-col justify-between space-y-4 transition-all duration-300 ${
                  isReady 
                    ? "border-indigo-500/30 bg-slate-900/40 shadow-lg shadow-indigo-500/5 hover:-translate-y-0.5" 
                    : "border-slate-850 bg-slate-950/20 opacity-75"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">{exam.title || "Assessment"}</h4>
                      <span className="text-xs text-slate-500 uppercase font-mono mt-0.5 inline-block">{exam.code}</span>
                    </div>
                    {isReady ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-450 border border-emerald-500/20">
                        Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-850 px-2.5 py-0.5 text-xs font-semibold text-slate-450 border border-slate-800">
                        <Lock className="mr-1 h-3 w-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-400 border-t border-slate-850/50 pt-3">
                    <div className="flex items-center">
                      <Clock className="mr-1.5 h-4 w-4 text-indigo-400" />
                      <span>{exam.duration} Mins</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="mr-1.5 h-4 w-4 text-purple-400" />
                      <span>{exam.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center col-span-2">
                      <Calendar className="mr-1.5 h-4 w-4 text-amber-400" />
                      <span className="truncate">
                        {scheduledTime 
                          ? scheduledTime.toLocaleString() 
                          : "On-Demand (Always Available)"
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500">
                    {scheduledTime && now < scheduledTime ? (
                      <span className="text-amber-500/90 font-medium">
                        Unlocks in {Math.ceil((scheduledTime - now) / 1000 / 60)} mins
                      </span>
                    ) : (
                      <span>Allotted: {new Date(allotment.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  {isReady ? (
                    <Link
                      to={`/student/exam/${allotment._id}`}
                      className="flex items-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-2.5 px-5 text-xs font-semibold text-white transition-all shadow-md cursor-pointer"
                    >
                      Start Exam
                      <PlayCircle className="ml-1.5 h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex items-center rounded-xl bg-slate-850 border border-slate-800 py-2.5 px-5 text-xs font-semibold text-slate-500 cursor-not-allowed"
                    >
                      Locked
                      <Lock className="ml-1.5 h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduledExams;
