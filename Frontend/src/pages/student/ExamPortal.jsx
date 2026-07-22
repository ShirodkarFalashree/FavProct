import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Clock, Calculator as CalcIcon, Send, ChevronLeft, ChevronRight, AlertCircle, X } from "lucide-react";

const ExamPortal = () => {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allotment, setAllotment] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Testing Flow
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [responses, setResponses] = useState({}); // { questionId: answerString }
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const timerRef = useRef(null);

  // Calculator Toggle
  const [showCalc, setShowCalc] = useState(false);
  const [calcInput, setCalcInput] = useState("");

  useEffect(() => {
    const initializeExam = async () => {
      try {
        const res = await API.post(`/student-exams/${studentExamId}/start`, {
          studentId: user._id
        });
        setAllotment(res.data.allotment);
        setExam(res.data.exam);

        // Prepopulate student's previous answers if any
        const savedResponses = {};
        if (res.data.allotment.answers && res.data.allotment.answers.length > 0) {
          res.data.allotment.answers.forEach((ans) => {
            if (ans.studentAnswer !== null) {
              savedResponses[ans.questionId] = ans.studentAnswer;
            }
          });
        }
        setResponses(savedResponses);

        // Timer setup
        const start = new Date(res.data.allotment.startedAt).getTime();
        const durationMs = res.data.exam.duration * 60 * 1000;
        const end = start + durationMs;
        const now = Date.now();
        const remainingSec = Math.max(Math.floor((end - now) / 1000), 0);

        setTimeLeft(remainingSec);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load exam session");
        navigate("/student");
      } finally {
        setLoading(false);
      }
    };
    initializeExam();
  }, [studentExamId, user._id, navigate]);

  // Countdown timer clock tick
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      toast.error("Time's up! Submitting exam automatically...");
      handleSubmitExam(true);
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  const handleOptionSelect = (qId, option) => {
    setResponses((prev) => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleSubjectiveChange = (qId, val) => {
    setResponses((prev) => ({
      ...prev,
      [qId]: val
    }));
  };

  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmitExam = async (forceSubmit = false) => {
    if (!forceSubmit) {
      const confirm = window.confirm("Are you sure you want to submit your responses? You cannot modify answers after submission.");
      if (!confirm) return;
    }

    // Clear timers
    clearTimeout(timerRef.current);

    const formattedAnswers = (exam.questions || []).map((q) => ({
      questionId: q.questionId,
      studentAnswer: responses[q.questionId] !== undefined ? responses[q.questionId] : null
    }));

    try {
      await API.post(`/student-exams/${studentExamId}/submit`, {
        studentId: user._id,
        answers: formattedAnswers
      });
      toast.success("Exam submitted successfully!");
      navigate("/student");
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred during submission");
    }
  };

  // Calculator widgets operations
  const handleCalcBtn = (val) => {
    if (val === "=") {
      try {
        // Safe evaluation of mathematical expression using Function
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, "");
        const result = Function(`"use strict"; return (${sanitized})`)();
        setCalcInput(String(result));
      } catch (err) {
        setCalcInput("Error");
      }
    } else if (val === "C") {
      setCalcInput("");
    } else {
      setCalcInput((prev) => prev + val);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const questions = exam.questions || [];
  const activeQ = questions[activeQIdx];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Testing Header Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-900 bg-slate-900/60 px-6 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold">
            E
          </div>
          <div>
            <h1 className="font-bold text-white text-sm md:text-base leading-none">{exam.title}</h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-1 inline-block">
              {exam.code}
            </span>
          </div>
        </div>

        {/* Timer status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-indigo-650/15 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
            <Clock className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
            <span className="text-sm font-bold text-indigo-300 font-mono tracking-wide">
              {formatTime(timeLeft)}
            </span>
          </div>

          {exam.settings?.calculatorAllowed && (
            <button
              onClick={() => setShowCalc(!showCalc)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-350 hover:bg-slate-700 hover:text-white transition-colors"
              title="Calculator"
            >
              <CalcIcon className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={() => handleSubmitExam(false)}
            className="flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-2.5 px-4 text-xs font-semibold text-white transition-all shadow-md"
          >
            Submit Assessment
            <Send className="ml-1.5 h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Main Body layout (split screen) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Question Navigator */}
        <aside className="w-64 border-r border-slate-900 bg-slate-900/10 p-6 flex flex-col justify-between overflow-y-auto hidden md:flex">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Grid</h3>
            <div className="grid grid-cols-4 gap-2.5">
              {questions.map((q, idx) => {
                const isSelected = activeQIdx === idx;
                const isAnswered = responses[q.questionId] !== undefined && responses[q.questionId] !== "";
                return (
                  <button
                    key={q.questionId}
                    onClick={() => setActiveQIdx(idx)}
                    className={`h-9 w-9 text-xs font-bold rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                        : isAnswered
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/35"
                        : "bg-slate-900 border border-slate-850 text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/30 p-3.5 border border-slate-850">
            <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider space-x-1">
              <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Guidelines</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
              Do not reload the browser window or close the session. Responses are saved as you interact.
            </p>
          </div>
        </aside>

        {/* Center Panel: Active Question Display */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950 flex flex-col justify-between">
          <div className="mx-auto max-w-2xl w-full space-y-6">
            {/* Question Details header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <span className="text-sm font-extrabold text-white flex items-center">
                Question {activeQIdx + 1} of {questions.length}
              </span>
              <span className="inline-flex items-center rounded-lg bg-slate-900 border border-slate-850 px-2 py-0.5 text-xs font-semibold text-slate-400">
                {activeQ.marks} Marks
              </span>
            </div>

            {/* Question description */}
            <div className="space-y-4">
              <p className="text-lg font-semibold text-white leading-relaxed whitespace-pre-wrap">
                {activeQ.question}
              </p>

              {/* Graphic attachment */}
              {activeQ.imageURL && (
                <div className="relative inline-block max-w-md rounded-lg overflow-hidden border border-slate-850 mt-2">
                  <img src={activeQ.imageURL} alt="Illustration graphic" className="max-w-full h-auto" />
                </div>
              )}
            </div>

            {/* Inputs based on type */}
            <div className="pt-4">
              {activeQ.type === "MCQ" ? (
                <div className="space-y-3">
                  {activeQ.options.map((opt, oIdx) => {
                    const optionChar = String.fromCharCode(65 + oIdx); // A, B, C, D
                    const isSelected = responses[activeQ.questionId] === optionChar;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleOptionSelect(activeQ.questionId, optionChar)}
                        className={`flex w-full items-center p-4 text-left text-sm font-medium rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "bg-indigo-600/10 border-indigo-500 text-white ring-1 ring-indigo-500"
                            : "bg-slate-900/40 border-slate-850 text-slate-350 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border font-bold text-xs mr-3 ${
                          isSelected ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-750 text-slate-400"
                        }`}>
                          {optionChar}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Write your response details
                  </label>
                  <textarea
                    rows="8"
                    value={responses[activeQ.questionId] || ""}
                    onChange={(e) => handleSubjectiveChange(activeQ.questionId, e.target.value)}
                    placeholder="Type your response here..."
                    className="block w-full rounded-xl border border-slate-800 bg-slate-900/40 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                  ></textarea>
                </div>
              )}
            </div>
          </div>

          {/* Bottom navigation buttons */}
          <div className="flex items-center justify-between border-t border-slate-900 pt-6 mt-8 max-w-2xl w-full mx-auto shrink-0">
            <button
              onClick={() => setActiveQIdx(Math.max(activeQIdx - 1, 0))}
              disabled={activeQIdx === 0}
              className="flex items-center rounded-xl bg-slate-900 border border-slate-800 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Previous
            </button>

            <button
              onClick={() => setActiveQIdx(Math.min(activeQIdx + 1, questions.length - 1))}
              disabled={activeQIdx === questions.length - 1}
              className="flex items-center rounded-xl bg-slate-900 border border-slate-800 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </button>
          </div>
        </main>

        {/* Floating CSS Calculator widget */}
        {showCalc && (
          <div className="absolute top-20 right-6 z-30 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center">
                <CalcIcon className="mr-1.5 h-4 w-4 text-indigo-400" />
                Calculator
              </span>
              <button onClick={() => setShowCalc(false)} className="text-slate-500 hover:text-slate-350">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Display */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-right font-mono text-lg font-bold text-white overflow-x-auto min-h-11">
              {calcInput || "0"}
            </div>

            {/* Buttons grid */}
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+", "C"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcBtn(btn)}
                  className={`h-9 font-bold rounded-lg ${
                    btn === "="
                      ? "col-span-1 bg-indigo-650 text-white hover:bg-indigo-750"
                      : btn === "C"
                      ? "col-span-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPortal;
