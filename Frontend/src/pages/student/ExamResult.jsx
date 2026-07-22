import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { ArrowLeft, Award, CheckCircle, XCircle, AlertCircle, MessageSquare, Tag } from "lucide-react";

const ExamResult = () => {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const [allotment, setAllotment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await API.get(`/student-exams/${studentExamId}/detail`);
        if (res.data.status !== "evaluated") {
          toast.error("This exam has not been evaluated yet.");
          navigate("/student");
          return;
        }
        setAllotment(res.data);
      } catch (err) {
        toast.error("Failed to load exam results");
        navigate("/student");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [studentExamId, navigate]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const exam = allotment.examId || {};
  const evaluator = allotment.evaluatorId || {};
  const questions = exam.questions || [];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate("/student")}
          className="flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Hero Result Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Exam Results Summary</span>
          <h2 className="text-2xl font-black text-white">{exam.title}</h2>
          <p className="text-xs text-slate-400">
            Evaluated by: <strong className="text-slate-200">{evaluator.name || "Teacher"}</strong> ({evaluator.email})
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-950/40 border border-slate-850 p-4 rounded-xl shrink-0">
          <Award className="h-10 w-10 text-amber-400" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Your Score</p>
            <p className="text-3xl font-black text-white mt-0.5">
              {allotment.marksObtained} <span className="text-sm font-bold text-slate-500">/ {exam.totalMarks} Marks</span>
            </p>
          </div>
        </div>
      </div>

      {/* Summative Feedback Card */}
      {allotment.feedback && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 space-y-2.5">
          <h4 className="text-sm font-bold text-white flex items-center">
            <MessageSquare className="mr-1.5 h-4 w-4 text-indigo-400" />
            Evaluator Comments
          </h4>
          <p className="text-sm text-indigo-200 leading-relaxed italic">
            "{allotment.feedback}"
          </p>
        </div>
      )}

      {/* Detailed Review Breakdown */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white">Question Review</h3>

        {questions.map((q, idx) => {
          const studentAnsObj = allotment.answers.find((a) => a.questionId === q.questionId) || {};
          const studentAnswer = studentAnsObj.studentAnswer;
          const marksAwarded = studentAnsObj.marksAwarded || 0;
          const isCorrect = studentAnsObj.isCorrect;

          // Determine color scheme based on correctness
          let borderTheme = "border-slate-850 bg-slate-900/10";
          let badgeText = "Pending";
          let badgeColor = "bg-slate-950/40 border-slate-850 text-slate-400";
          let isCorrectIcon = <AlertCircle className="mr-1 h-3.5 w-3.5" />;

          if (q.type === "MCQ") {
            if (isCorrect) {
              borderTheme = "border-emerald-500/20 bg-emerald-500/5";
              badgeText = "Correct";
              badgeColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
              isCorrectIcon = <CheckCircle className="mr-1 h-3.5 w-3.5" />;
            } else {
              borderTheme = "border-rose-500/20 bg-rose-500/5";
              badgeText = "Incorrect";
              badgeColor = "bg-rose-500/10 border-rose-500/20 text-rose-400";
              isCorrectIcon = <XCircle className="mr-1 h-3.5 w-3.5" />;
            }
          } else {
            // Subjective grading
            const isFullMarks = marksAwarded >= q.marks;
            if (marksAwarded > 0) {
              borderTheme = isFullMarks ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5";
              badgeText = isFullMarks ? "Full Credit" : "Partial Credit";
              badgeColor = isFullMarks ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400";
              isCorrectIcon = isFullMarks ? <CheckCircle className="mr-1 h-3.5 w-3.5" /> : <AlertCircle className="mr-1 h-3.5 w-3.5" />;
            } else {
              borderTheme = "border-rose-500/20 bg-rose-500/5";
              badgeText = "No Marks";
              badgeColor = "bg-rose-500/10 border-rose-500/20 text-rose-400";
              isCorrectIcon = <XCircle className="mr-1 h-3.5 w-3.5" />;
            }
          }

          return (
            <div
              key={q.questionId}
              className={`rounded-2xl border p-6 space-y-4 ${borderTheme}`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center rounded-lg bg-slate-950/40 border border-slate-850 px-2.5 py-1 text-xs font-semibold text-slate-400">
                  Q{idx + 1} ({q.marks} Marks)
                </span>
                <span className="text-xs text-slate-500 uppercase font-semibold">
                  Type: {q.type}
                </span>
              </div>

              {/* Question content */}
              <p className="text-base font-semibold text-white leading-relaxed">{q.question}</p>

              {/* Image Graphic */}
              {q.imageURL && (
                <div className="relative inline-block max-w-sm rounded-lg overflow-hidden border border-slate-850">
                  <img src={q.imageURL} alt="Illustration Graphic" className="max-w-full h-auto" />
                </div>
              )}

              {/* Answers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student answer card */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Your Answer</span>
                  <div className="text-sm font-semibold text-slate-200 mt-1">
                    {studentAnswer === null || studentAnswer === undefined || studentAnswer === "" ? (
                      <span className="text-rose-400 italic">No response submitted.</span>
                    ) : q.type === "MCQ" ? (
                      <span>Option: <strong className="text-white font-bold">{studentAnswer}</strong></span>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed font-medium">{studentAnswer.toString()}</p>
                    )}
                  </div>
                </div>

                {/* Correct answer card */}
                <div className="rounded-xl border border-slate-850 bg-slate-950/30 p-4 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Correct Answer</span>
                  <div className="text-sm font-semibold text-emerald-400 mt-1">
                    {q.type === "MCQ" ? (
                      <span>Option: <strong className="font-bold">{q.correctAnswer}</strong></span>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed font-medium">{q.correctAnswer?.toString() || "Refer to teacher guidelines."}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Score and specific feedback bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-850/50">
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${badgeColor}`}>
                    {isCorrectIcon}
                    {badgeText}
                  </span>
                  <span className="inline-flex items-center rounded-lg bg-slate-950/40 border border-slate-850 px-2.5 py-1 text-xs font-semibold text-slate-350">
                    Score: {marksAwarded} / {q.marks} Marks
                  </span>
                </div>

                {studentAnsObj.feedback && (
                  <p className="text-xs text-indigo-300 italic flex items-center leading-relaxed max-w-md">
                    <Tag className="mr-1 h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    Feedback: "{studentAnsObj.feedback}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamResult;
