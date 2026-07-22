import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { ClipboardList, Upload, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

const ExamAllotment = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.get(`/exam?organizationId=${user.organizationId}`);
        setExams(res.data);
        if (res.data.length > 0) {
          setSelectedExamId(res.data[0]._id);
        }
      } catch (err) {
        toast.error("Failed to load exams list");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [user.organizationId]);

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExamId || !excelFile) {
      toast.error("Please pick an Exam and select the Excel student list");
      return;
    }

    const formData = new FormData();
    formData.append("examId", selectedExamId);
    formData.append("organizationId", user.organizationId);
    formData.append("excel", excelFile);

    setSubmitting(true);
    setResultSummary(null);
    try {
      const res = await API.post("/admin/allot-exam", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Excel processed successfully!");
      setResultSummary(res.data.summary);
      setExcelFile(null);
      document.getElementById("excelAllotInput").value = "";
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to allot exams");
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
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Exam Allotment & Onboarding</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload a student/teacher matrix spreadsheet. The system automatically creates student & teacher accounts, assigns evaluators, and allots the exam.
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center text-slate-500">
          No generated exams found. Create an exam in "Create Exam" before attempting allotments.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center">
                <ClipboardList className="mr-2 h-5 w-5 text-indigo-400" />
                Allotment Panel
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Select Exam
                  </label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white focus:border-indigo-500 focus:outline-none text-sm"
                  >
                    {exams.map((ex) => (
                      <option key={ex._id} value={ex._id} className="bg-slate-900 text-white">
                        {ex.title} ({ex.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Upload Students Excel Sheet (.xlsx / .xls)
                  </label>
                  <input
                    type="file"
                    id="excelAllotInput"
                    required
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/25 file:cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Allot & Onboard
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results Display */}
            {resultSummary && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-400" />
                  Processing Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">New Students</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">{resultSummary.studentsCreated}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Updated Students</p>
                    <p className="text-xl font-bold text-indigo-400 mt-1">{resultSummary.studentsUpdated}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Teachers Created</p>
                    <p className="text-xl font-bold text-purple-400 mt-1">{resultSummary.teachersCreated}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Exams Allotted</p>
                    <p className="text-xl font-bold text-amber-400 mt-1">{resultSummary.examsAllotted}</p>
                  </div>
                </div>

                {resultSummary.errors && resultSummary.errors.length > 0 && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                    <div className="flex items-center text-xs font-bold text-red-400">
                      <AlertTriangle className="mr-1.5 h-4 w-4" />
                      Parsing logs / Warnings:
                    </div>
                    <ul className="list-disc list-inside text-xs text-red-300 space-y-1 max-h-40 overflow-y-auto">
                      {resultSummary.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Template Guide */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
              <h4 className="text-sm font-semibold text-white flex items-center">
                <HelpCircle className="mr-1.5 h-4 w-4 text-indigo-400" />
                Template Specifications
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create an Excel file with the following headers (case and space insensitive):
              </p>
              <div className="space-y-3 text-xs">
                <div className="border-l-2 border-indigo-500 pl-3">
                  <p className="font-semibold text-slate-200">StudentEmail & StudentName</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">Registers student accounts and tags them.</p>
                </div>
                <div className="border-l-2 border-indigo-500 pl-3">
                  <p className="font-semibold text-slate-200">Cohort & Class</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">e.g. Batch of 2026, Section B.</p>
                </div>
                <div className="border-l-2 border-indigo-500 pl-3">
                  <p className="font-semibold text-slate-200">EvaluatorEmail & EvaluatorName</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">Teacher assigned to evaluate this student's exam.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamAllotment;
