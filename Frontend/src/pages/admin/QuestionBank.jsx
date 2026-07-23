import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { 
  FileSpreadsheet, Upload, Plus, HelpCircle, Layers, Tag, 
  Image as ImageIcon, X, AlertCircle, FileText, CheckCircle2, Trash2 
} from "lucide-react";

const QuestionBank = () => {
  const { user } = useAuth();
  const [qbs, setQbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQB, setSelectedQB] = useState(null);
  const [viewQBDetails, setViewQBDetails] = useState(null);
  const [loadingQBDetails, setLoadingQBDetails] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  const fetchQuestionBanks = async () => {
    try {
      const res = await API.get(`/question-bank?organizationId=${user.organizationId}`);
      setQbs(res.data);
    } catch (err) {
      toast.error("Failed to load question banks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionBanks();
  }, [user.organizationId]);

  const handleExcelChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleImagesChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleDeleteQB = async (e, qbId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this question bank? This action cannot be undone.")) {
      return;
    }
    try {
      await API.delete(`/question-bank/${qbId}`);
      toast.success("Question bank deleted successfully!");
      fetchQuestionBanks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete question bank");
    }
  };

  const handleViewQB = async (qb) => {
    setSelectedQB(qb);
    setLoadingQBDetails(true);
    try {
      const res = await API.get(`/question-bank/${qb._id}`);
      setViewQBDetails(res.data);
    } catch (err) {
      toast.error("Failed to load question bank details");
      setSelectedQB(null);
    } finally {
      setLoadingQBDetails(false);
    }
  };

  const handleCloseViewModal = () => {
    setSelectedQB(null);
    setViewQBDetails(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code || !excelFile) {
      toast.error("Please provide Name, Code, and the Excel template file");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("code", code.toUpperCase());
    formData.append("organizationId", user.organizationId);
    formData.append("userId", user.userId || user._id);
    formData.append("excel", excelFile);

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    setSubmitting(true);
    try {
      await API.post("/question-bank/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Question bank uploaded and compiled successfully!");
      setName("");
      setCode("");
      setExcelFile(null);
      setImageFiles([]);
      setShowCreateModal(false);
      fetchQuestionBanks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload question bank");
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
    <div className="space-y-8 relative">
      {/* Header section with Create QB Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Question Banks</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage question pools, upload templates, and inspect questions assigned to assessments.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-3 px-4 text-sm font-semibold text-white transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="mr-1.5 h-5 w-5" />
          Create Question Bank
        </button>
      </div>

      {/* Main Grid View */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
        <h3 className="text-lg font-bold text-white flex items-center mb-6">
          <Layers className="mr-2 h-5 w-5 text-indigo-400" />
          Available Question Pools ({qbs.length})
        </h3>

        {qbs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-16 text-center text-slate-500">
            <HelpCircle className="mx-auto h-12 w-12 text-slate-650 mb-3" />
            <p className="font-semibold text-slate-400">No question pools uploaded yet</p>
            <p className="text-xs text-slate-500 mt-1">Click the button above to upload your first question bank.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qbs.map((qb) => (
              <div
                key={qb._id}
                onClick={() => handleViewQB(qb)}
                className="rounded-xl border border-slate-850 bg-slate-900/40 p-5 space-y-4 cursor-pointer hover:border-indigo-500/50 transition-all hover:bg-slate-900/60 hover:-translate-y-0.5 group"
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="font-bold text-white text-base leading-tight group-hover:text-indigo-400 transition-colors">{qb.name}</h4>
                    <span className="text-xs text-slate-500 uppercase font-mono mt-0.5 inline-block">{qb.code}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="inline-flex items-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-400">
                      {qb.totalQuestions} Qs
                    </span>
                    <button
                      onClick={(e) => handleDeleteQB(e, qb._id)}
                      className="rounded-lg p-1 text-slate-500 hover:bg-red-500/15 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Question Bank"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-950/30 border border-slate-850 py-1.5 px-2">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Easy</p>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">{qb.stats?.easy || 0}</p>
                  </div>
                  <div className="rounded-lg bg-slate-950/30 border border-slate-850 py-1.5 px-2">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Medium</p>
                    <p className="text-sm font-bold text-indigo-400 mt-0.5">{qb.stats?.medium || 0}</p>
                  </div>
                  <div className="rounded-lg bg-slate-950/30 border border-slate-850 py-1.5 px-2">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Hard</p>
                    <p className="text-sm font-bold text-rose-400 mt-0.5">{qb.stats?.hard || 0}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Uploaded: {new Date(qb.createdAt).toLocaleDateString()}</span>
                  <span className="text-indigo-400 font-semibold group-hover:underline flex items-center">
                    Inspect Questions →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE QUESTION BANK DIALOGUE / MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Upload className="mr-2 h-5 w-5 text-indigo-400" />
                Upload New Question Bank
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Question Bank Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Term 1 Pool"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Code / Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SCI-T1"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Excel Template File (.xlsx / .xls)
                </label>
                <input
                  type="file"
                  id="excelInput"
                  required
                  accept=".xlsx, .xls"
                  onChange={handleExcelChange}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/25 file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Question Illustration Images (Optional)
                </label>
                <input
                  type="file"
                  id="imagesInput"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/25 file:cursor-pointer"
                />
                {imageFiles.length > 0 && (
                  <p className="text-[10px] text-emerald-400 mt-1">{imageFiles.length} images selected</p>
                )}
              </div>

              {/* Template Columns Guide inside Modal */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-350 flex items-center">
                  <HelpCircle className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
                  Excel Columns Reference
                </h4>
                <ul className="text-[10px] text-slate-500 space-y-1 list-disc list-inside">
                  <li><strong className="text-slate-400">QuestionType</strong>: MCQ or Subjective</li>
                  <li><strong className="text-slate-400">QuestionText</strong>: Core question string</li>
                  <li><strong className="text-slate-400">OptionA - OptionD</strong>: Choices (leave empty if subjective)</li>
                  <li><strong className="text-slate-400">CorrectAnswer</strong>: Option label (A, B, C, D) or subjective answer key</li>
                  <li><strong className="text-slate-400">Marks</strong>: Numeric marks weight (1=easy, 2=med, 3=hard)</li>
                  <li><strong className="text-slate-400">ImageFileName</strong>: Exact filename of uploaded illustrations</li>
                </ul>
              </div>

              <div className="pt-4 flex items-center space-x-3 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-slate-800 hover:bg-slate-850 py-3 text-sm font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Upload className="mr-1.5 h-4 w-4" />
                      Create Bank
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW QUESTIONS LIST DIALOGUE / MODAL */}
      {selectedQB && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <div>
                <h3 className="text-xl font-bold text-white leading-tight flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-indigo-400" />
                  {selectedQB.name}
                </h3>
                <span className="text-xs text-slate-500 uppercase font-mono mt-1 inline-block">Pool Code: {selectedQB.code}</span>
              </div>
              <button
                onClick={handleCloseViewModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Questions list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/20">
              {loadingQBDetails ? (
                <div className="flex h-48 items-center justify-center flex-col space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                  <p className="text-xs text-slate-500">Loading bank questions...</p>
                </div>
              ) : viewQBDetails && viewQBDetails.questions && viewQBDetails.questions.length > 0 ? (
                <div className="space-y-6">
                  {viewQBDetails.questions.map((q, idx) => (
                    <div
                      key={q._id || idx}
                      className="rounded-xl border border-slate-850 bg-slate-900/35 p-5 space-y-4"
                    >
                      {/* Top metadata of question */}
                      <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
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
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/50 max-w-sm max-h-48 flex justify-center items-center">
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
                                    : "bg-slate-950/30 border-slate-850 text-slate-400"
                                }`}
                              >
                                <span className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  isCorrect ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
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
                        <div className="rounded-xl border border-slate-850 bg-slate-950/20 p-3.5 text-xs">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Evaluator Key / Correct Answer</p>
                          <p className="text-slate-350 leading-relaxed">{q.correctAnswer.toString()}</p>
                        </div>
                      )}

                      {/* Group assignment details */}
                      {(q.group || q.order) && (
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-500">
                          {q.group && <span className="bg-slate-950/40 border border-slate-850 px-2 py-0.5 rounded">Group ID: {q.group}</span>}
                          {q.order && <span className="bg-slate-950/40 border border-slate-850 px-2 py-0.5 rounded">Group Order: {q.order}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center flex-col text-slate-500 text-sm">
                  <AlertCircle className="h-10 w-10 text-slate-650 mb-2" />
                  No questions found in this question bank.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 p-6 flex justify-end">
              <button
                onClick={handleCloseViewModal}
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

export default QuestionBank;
