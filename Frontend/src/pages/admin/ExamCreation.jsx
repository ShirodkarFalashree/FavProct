import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import {
  FilePlus2,
  AlertCircle,
  Sparkles,
  Settings,
  Calculator,
  HelpCircle,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ClipboardList,
  Calendar,
  Award,
  Clock,
  X,
  Eye,
  FileText
} from "lucide-react";

const ExamCreation = () => {
  const { user } = useAuth();
  const [qbs, setQbs] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal for viewing exam questions
  const [selectedExam, setSelectedExam] = useState(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [questionBankId, setQuestionBankId] = useState("");
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(10);
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  
  // Settings
  const [calculatorAllowed, setCalculatorAllowed] = useState(false);
  const [negativeMarking, setNegativeMarking] = useState(0);

  // Difficulty Counts
  const [easyCount, setEasyCount] = useState(4);
  const [mediumCount, setMediumCount] = useState(3);
  const [hardCount, setHardCount] = useState(0);

  // Excel Allotment during creation
  const [excelFile, setExcelFile] = useState(null);
  const [resultSummary, setResultSummary] = useState(null);

  const fetchExams = async () => {
    try {
      const res = await API.get(`/exam?organizationId=${user.organizationId}`);
      setExams(res.data);
    } catch (err) {
      toast.error("Failed to load exams list");
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const qbRes = await API.get(`/question-bank?organizationId=${user.organizationId}`);
        setQbs(qbRes.data);
        if (qbRes.data.length > 0) {
          setQuestionBankId(qbRes.data[0]._id);
        }
        
        const examRes = await API.get(`/exam?organizationId=${user.organizationId}`);
        setExams(examRes.data);
      } catch (err) {
        toast.error("Failed to load initial page data");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user.organizationId]);

  // Real-time calculation of marks based on difficulty counts
  const computedEasyMarks = easyCount * 1;
  const computedMediumMarks = mediumCount * 2;
  const computedHardMarks = hardCount * 3;
  const computedTotalMarks = computedEasyMarks + computedMediumMarks + computedHardMarks;
  const marksMatch = computedTotalMarks === Number(totalMarks);

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam? This will also delete all student allotments for this exam!")) {
      return;
    }
    try {
      await API.delete(`/exam/${examId}`);
      toast.success("Exam deleted successfully!");
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete exam");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !code || !questionBankId) {
      toast.error("Please fill in Title, Code, and select a Question Bank");
      return;
    }

    if (!marksMatch) {
      toast.error(`The sum of difficulty marks (${computedTotalMarks}) does not equal the target Total Marks (${totalMarks})!`);
      return;
    }

    setSubmitting(true);
    setResultSummary(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("code", code.toUpperCase());
      formData.append("questionBankId", questionBankId);
      formData.append("organizationId", user.organizationId);
      formData.append("userId", user.userId || user._id);
      formData.append("duration", Number(duration));
      formData.append("totalMarks", Number(totalMarks));
      formData.append("scheduledDateTime", scheduledDateTime || "");
      formData.append("settings", JSON.stringify({
        calculatorAllowed,
        negativeMarking: Number(negativeMarking)
      }));
      formData.append("difficultyDistribution", JSON.stringify({
        easy: Number(easyCount),
        medium: Number(mediumCount),
        hard: Number(hardCount)
      }));

      if (excelFile) {
        formData.append("excel", excelFile);
      }

      const res = await API.post("/exam/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      toast.success("Exam generated successfully!");
      fetchExams(); // Refresh list

      if (res.data.allotmentSummary) {
        setResultSummary(res.data.allotmentSummary);
        toast.success("Allotment Excel parsed successfully!");
      }

      // Reset Form fields
      setTitle("");
      setCode("");
      setDuration(60);
      setTotalMarks(10);
      setScheduledDateTime("");
      setEasyCount(4);
      setMediumCount(3);
      setHardCount(0);
      setCalculatorAllowed(false);
      setNegativeMarking(0);
      setExcelFile(null);
      
      const fileInput = document.getElementById("excelCreateInput");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create exam. Verify you have enough questions in the selected pool.");
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

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Exams Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review all configured assessments or use the automated randomizer matrix below to create new exams.
        </p>
      </div>

      {/* 1. Configured Exams List Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
        <h3 className="text-lg font-bold text-white flex items-center mb-6">
          <ClipboardList className="mr-2 h-5 w-5 text-indigo-400" />
          Configured Assessments ({exams.length})
        </h3>

        {exams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-16 text-center text-slate-500">
            <HelpCircle className="mx-auto h-12 w-12 text-slate-655 mb-3" />
            <p className="font-semibold text-slate-400">No exams configured yet</p>
            <p className="text-xs text-slate-500 mt-1">Fill out the generator matrix below to generate your first exam.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam._id}
                onClick={() => setSelectedExam(exam)}
                className="rounded-xl border border-slate-855 bg-slate-900/40 p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all hover:bg-slate-900/60 hover:-translate-y-0.5 group cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight group-hover:text-indigo-400 transition-colors">{exam.title}</h4>
                      <span className="text-xs text-slate-500 uppercase font-mono mt-0.5 inline-block">{exam.code}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExam(exam._id);
                      }}
                      className="rounded-lg p-1.5 text-slate-550 hover:bg-red-500/15 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      title="Delete Exam"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-400 pt-2">
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
                        {exam.scheduledDateTime 
                          ? new Date(exam.scheduledDateTime).toLocaleString() 
                          : "On-Demand Allotment"
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges / Settings */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-855">
                  {exam.settings?.calculatorAllowed && (
                    <span className="inline-flex items-center rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                      Calculator
                    </span>
                  )}
                  <span className="inline-flex items-center rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    Neg Marking: {exam.settings?.negativeMarking ? `-${exam.settings.negativeMarking * 100}%` : "None"}
                  </span>
                  <span className="inline-flex items-center rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    Questions: {exam.questions ? exam.questions.length : 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Create Exam Form Builder */}
      <div>
        <div className="mb-6 border-t border-slate-800 pt-8">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FilePlus2 className="mr-2.5 h-6 w-6 text-indigo-400" />
            Automated Exam Builder
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Choose a question pool and define difficulty counts to auto-select and randomize questions.
          </p>
        </div>

        {qbs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center text-slate-500">
            You must upload a Question Bank pool before creating exams. Go to "Question Banks" first.
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Exam Configuration */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center mb-2">
                    <Settings className="mr-2 h-5 w-5 text-indigo-400" />
                    Exam Parameters
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Exam Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Science Midterm 2026"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Exam Code
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MID-SCI-10"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Question Bank Pool
                      </label>
                      <select
                        value={questionBankId}
                        onChange={(e) => setQuestionBankId(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3 px-4 text-white focus:border-indigo-500 focus:outline-none text-sm cursor-pointer"
                      >
                        {qbs.map((qb) => (
                          <option key={qb._id} value={qb._id} className="bg-slate-900 text-white">
                            {qb.name} ({qb.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Target Total Marks
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Scheduled Start Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3 px-4 text-white focus:border-indigo-500 focus:outline-none text-sm cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Negative Marking Ratio
                      </label>
                      <select
                        value={negativeMarking}
                        onChange={(e) => setNegativeMarking(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3.5 px-4 text-white focus:border-indigo-500 focus:outline-none text-sm cursor-pointer"
                      >
                        <option value="0" className="bg-slate-900">None (0%)</option>
                        <option value="0.25" className="bg-slate-900">Quarter (-25%)</option>
                        <option value="0.33" className="bg-slate-900">One Third (-33%)</option>
                        <option value="0.5" className="bg-slate-900">Half (-50%)</option>
                        <option value="1" className="bg-slate-900">Full (-100%)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center">
                      <Calculator className="mr-1.5 h-4.5 w-4.5 text-indigo-400" />
                      Calculator Setting
                    </h4>
                    <label className="flex items-center space-x-3 rounded-xl border border-slate-800 bg-slate-955/25 p-3.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calculatorAllowed}
                        onChange={(e) => setCalculatorAllowed(e.target.checked)}
                        className="rounded border-slate-750 bg-slate-900 text-indigo-650 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">Allow Calculator</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Students can open an onscreen calculator.</p>
                      </div>
                    </label>
                  </div>

                  {/* Allotment section inside exam parameters */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center">
                      <Upload className="mr-1.5 h-4.5 w-4.5 text-indigo-400" />
                      Allot Students (Optional)
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Upload student Excel list to register accounts and allot this exam immediately upon creation.
                    </p>
                    <input
                      type="file"
                      id="excelCreateInput"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/25 file:cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 leading-none">
                      Requires headers: StudentName, StudentEmail, Cohort, Class, EvaluatorName, EvaluatorEmail
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Difficulty distribution calculator */}
              <div className="lg:col-span-1 space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-indigo-400" />
                    Randomizer Matrix
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-400 uppercase">Easy (1 Mark each)</span>
                        <span className="font-bold text-emerald-400">{easyCount} Qs ({easyCount * 1} Marks)</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={easyCount}
                        onChange={(e) => setEasyCount(Number(e.target.value))}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-2 px-3.5 text-white text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-400 uppercase">Medium (2 Marks each)</span>
                        <span className="font-bold text-indigo-400">{mediumCount} Qs ({mediumCount * 2} Marks)</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={mediumCount}
                        onChange={(e) => setMediumCount(Number(e.target.value))}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-2 px-3.5 text-white text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-400 uppercase">Hard (3 Marks each)</span>
                        <span className="font-bold text-rose-400">{hardCount} Qs ({hardCount * 3} Marks)</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={hardCount}
                        onChange={(e) => setHardCount(Number(e.target.value))}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-2 px-3.5 text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Real-time feedback status */}
                  <div className={`rounded-xl border p-4 flex items-start space-x-3 text-xs ${
                    marksMatch
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      : "bg-red-500/10 border-red-500/20 text-red-300"
                  }`}>
                    {marksMatch ? (
                      <>
                        <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Matrix Aligned!</p>
                          <p className="mt-0.5 opacity-90">Difficulty configuration sums up to exactly {totalMarks} marks.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Sum Mismatch!</p>
                          <p className="mt-0.5 opacity-90">
                            Current sum is {computedTotalMarks} marks. Adjust easy/medium/hard values to match your target of {totalMarks} marks.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !marksMatch}
                    className="w-full flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                  >
                    {submitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FilePlus2 className="mr-2 h-4 w-4" />
                        Generate Exam
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
        
          </div>
        )}
      </div>

      {/* VIEW EXAM QUESTIONS MODAL */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <div>
                <h3 className="text-xl font-bold text-white leading-tight flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-indigo-400" />
                  {selectedExam.title}
                </h3>
                <span className="text-xs text-slate-500 uppercase font-mono mt-1 inline-block">Exam Code: {selectedExam.code}</span>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Questions list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/20">
              {selectedExam.questions && selectedExam.questions.length > 0 ? (
                <div className="space-y-6">
                  {selectedExam.questions.map((q, idx) => (
                    <div
                      key={q._id || idx}
                      className="rounded-xl border border-slate-850 bg-slate-900/35 p-5 space-y-4"
                    >
                      {/* Top metadata of question */}
                      <div className="flex items-center justify-between text-xs border-b border-slate-855 pb-2">
                        <span className="font-bold text-indigo-400">Question {idx + 1}</span>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-950/40 border border-slate-800 text-[10px] text-slate-400 font-semibold uppercase">
                            {q.type}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-950/40 border border-slate-800 text-[10px] text-slate-400 font-semibold uppercase">
                            {q.marks || 1} Marks
                          </span>
                        </div>
                      </div>

                      {/* Core question body */}
                      <div className="space-y-3">
                        <p className="text-white text-sm leading-relaxed font-medium">{q.question}</p>
                        
                        {q.imageURL && (
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-955/50 max-w-sm max-h-48 flex justify-center items-center">
                            <img src={q.imageURL} alt="Illustration" className="max-w-full max-h-48 object-contain" />
                          </div>
                        )}
                      </div>

                      {/* Options breakdown */}
                      {q.type === "MCQ" && q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                          {q.options.map((opt, optIdx) => {
                            const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D
                            const isCorrect = q.correctAnswer?.toString().toUpperCase() === optionLabel;

                            return (
                              <div
                                key={optIdx}
                                className={`rounded-xl border p-3 flex items-center space-x-2 ${
                                  isCorrect
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                    : "bg-slate-955/30 border-slate-855 text-slate-400"
                                }`}
                              >
                                <span className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  isCorrect ? "bg-emerald-500 text-slate-955" : "bg-slate-800 text-slate-400"
                                }`}>
                                  {optionLabel}
                                </span>
                                <span className="font-medium truncate">{opt}</span>
                                {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 ml-auto shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Subjective answer info */}
                      {q.type !== "MCQ" && q.correctAnswer && (
                        <div className="rounded-xl border border-slate-850 bg-slate-955/20 p-3.5 text-xs">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Evaluator Key / Correct Answer</p>
                          <p className="text-slate-350 leading-relaxed">{q.correctAnswer.toString()}</p>
                        </div>
                      )}

                      {/* Group assignment details */}
                      {(q.group || q.order) && (
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-500">
                          {q.group && <span className="bg-slate-955/40 border border-slate-855 px-2 py-0.5 rounded">Group ID: {q.group}</span>}
                          {q.order && <span className="bg-slate-955/40 border border-slate-855 px-2 py-0.5 rounded">Group Order: {q.order}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center flex-col text-slate-500 text-sm">
                  <AlertCircle className="h-10 w-10 text-slate-655 mb-2" />
                  No questions found in this exam configuration.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 p-6 flex justify-end">
              <button
                onClick={() => setSelectedExam(null)}
                className="rounded-xl bg-slate-850 border border-slate-700 hover:bg-slate-800 py-2.5 px-6 text-sm font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCreation;
