import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { ClipboardList, CheckCircle, AlertTriangle, ArrowLeft, Send, MessageSquare } from "lucide-react";

const EvaluateExam = () => {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const [allotment, setAllotment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Grading states
  const [answersScores, setAnswersScores] = useState({}); // { questionId: { marksAwarded, feedback } }
  const [overallFeedback, setOverallFeedback] = useState("");

  useEffect(() => {
    const fetchAttemptDetail = async () => {
      try {
        const res = await API.get(`/student-exams/${studentExamId}/detail`);
        setAllotment(res.data);
        
        // Pre-populate scores with existing auto-graded values or zeroes
        const initialScores = {};
        res.data.answers.forEach((ans) => {
          initialScores[ans.questionId] = {
            marksAwarded: ans.marksAwarded || 0,
            feedback: ans.feedback || ""
          };
        });
        setAnswersScores(initialScores);
        setOverallFeedback(res.data.feedback || "");
      } catch (err) {
        toast.error("Failed to load student exam details");
        navigate("/teacher/evaluations");
      } finally {
        setLoading(false);
      }
    };
    fetchAttemptDetail();
  }, [studentExamId, navigate]);

  const handleScoreChange = (qId, val, maxMarks) => {
    const parsed = Math.min(Math.max(Number(val) || 0, -maxMarks), maxMarks); // clamp score
    setAnswersScores((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], marksAwarded: parsed }
    }));
  };

  const handleQFeedbackChange = (qId, val) => {
    setAnswersScores((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], feedback: val }
    }));
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const scoresPayload = Object.keys(answersScores).map((qId) => ({
      questionId: qId,
      marksAwarded: answersScores[qId].marksAwarded,
      feedback: answersScores[qId].feedback
    }));

    try {
      await API.post(`/student-exams/${studentExamId}/evaluate`, {
        answersScores: scoresPayload,
        overallFeedback
      });
      toast.success("Evaluation compiled and graded successfully!");
      navigate("/teacher/evaluations");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const student = allotment.studentId || {};
  const exam = allotment.examId || {};
  const questions = exam.questions || [];

  // Calculate total marks awarded in real-time
  const computedTotal = Object.values(answersScores).reduce((sum, score) => sum + (Number(score.marksAwarded) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/teacher/evaluations")}
          className="flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Evaluations
        </button>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
          allotment.status === "evaluated"
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
        }`}>
          {allotment.status === "evaluated" ? "Graded" : "Needs Evaluation"}
        </span>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Student Name</p>
          <p className="text-lg font-bold text-white mt-0.5">{student.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{student.email}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Exam Title</p>
          <p className="text-lg font-bold text-white mt-0.5">{exam.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">Code: {exam.code}</p>
        </div>
        <div className="md:border-l md:border-slate-850 md:pl-6">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Evaluation Status</p>
          <p className="text-2xl font-black text-white mt-1">
            {computedTotal} <span className="text-xs text-slate-500 font-bold">/ {exam.totalMarks} Marks</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitEvaluation} className="space-y-6">
        {/* Questions Loop */}
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const studentAnsObj = allotment.answers.find((a) => a.questionId === q.questionId) || {};
            const studentAnswer = studentAnsObj.studentAnswer;
            
            // Grading parameters
            const scoreState = answersScores[q.questionId] || { marksAwarded: 0, feedback: "" };

            return (
              <div
                key={q.questionId}
                className="rounded-2xl border border-slate-850 bg-slate-900/20 p-6 space-y-4"
              >
                {/* Question Info */}
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center rounded-lg bg-slate-950/40 border border-slate-850 px-2.5 py-1 text-xs font-semibold text-slate-400">
                    Q{idx + 1} ({q.marks} Marks)
                  </span>
                  <span className="text-xs text-slate-500 uppercase font-semibold">
                    Type: {q.type} | Difficulty: {q.difficulty}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-base font-semibold text-white leading-relaxed">{q.question}</p>

                {/* Question Image */}
                {q.imageURL && (
                  <div className="relative inline-block max-w-sm rounded-lg overflow-hidden border border-slate-850">
                    <img src={q.imageURL} alt="Question Graphic" className="max-w-full h-auto object-cover" />
                  </div>
                )}

                {/* Student's Answer panel */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Student Response</span>
                    <div className="mt-1 text-sm font-medium text-slate-200">
                      {studentAnswer === null || studentAnswer === undefined || studentAnswer === "" ? (
                        <span className="text-rose-400 italic">No response submitted.</span>
                      ) : q.type === "MCQ" ? (
                        <span>Selected Option: <strong className="text-white font-bold">{studentAnswer}</strong></span>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{studentAnswer.toString()}</p>
                      )}
                    </div>
                  </div>

                  {q.type === "MCQ" && (
                    <div className="border-t border-slate-900 pt-3 flex flex-wrap gap-4 text-xs">
                      <div>
                        <span className="text-slate-500">Correct Choice:</span>
                        <strong className="ml-1 text-emerald-400">{q.correctAnswer}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Auto-Grade Result:</span>
                        {studentAnsObj.isCorrect ? (
                          <span className="ml-1 text-emerald-400 font-semibold">Correct (+{q.marks})</span>
                        ) : (
                          <span className="ml-1 text-rose-400 font-semibold">
                            Incorrect ({studentAnsObj.marksAwarded < 0 ? studentAnsObj.marksAwarded : 0})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Teacher Grading Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-850">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Score Awarded
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min={-q.marks}
                      max={q.marks}
                      disabled={q.type === "MCQ" && allotment.status !== "evaluated"} // Lock MCQ scores unless reviewing
                      value={scoreState.marksAwarded}
                      onChange={(e) => handleScoreChange(q.questionId, e.target.value, q.marks)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Max limit: {q.marks} marks</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Question Feedback (Optional)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MessageSquare className="h-4 w-4 text-slate-650" />
                      </div>
                      <input
                        type="text"
                        placeholder="Write dynamic feedback for this answer..."
                        value={scoreState.feedback}
                        onChange={(e) => handleQFeedbackChange(q.questionId, e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 pl-10 pr-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Evaluation Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center">
            <ClipboardList className="mr-1.5 h-4.5 w-4.5 text-indigo-400" />
            Overall Assessment Evaluation
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Summative Feedback & Comments
            </label>
            <textarea
              rows="4"
              placeholder="Provide summary notes or constructive performance analysis for the student..."
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
            ></textarea>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-3 border-t border-slate-850">
            <span className="text-sm font-semibold text-slate-400">
              Total Grade Sum: <strong className="text-white text-base font-bold">{computedTotal} / {exam.totalMarks}</strong>
            </span>

            {allotment.status === "submitted" && (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-3 px-6 text-sm font-semibold text-white transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Evaluation
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EvaluateExam;
