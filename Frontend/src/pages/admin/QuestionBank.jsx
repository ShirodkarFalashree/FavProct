import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { FileSpreadsheet, Upload, Plus, HelpCircle, Layers, Tag, Image as ImageIcon } from "lucide-react";

const QuestionBank = () => {
  const { user } = useAuth();
  const [qbs, setQbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      // Clear file inputs manually
      document.getElementById("excelInput").value = "";
      document.getElementById("imagesInput").value = "";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Question Banks</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload question templates containing questions, choices, answers, marks, groups, and matching images.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Upload Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center mb-4">
              <Upload className="mr-2 h-5 w-5 text-indigo-400" />
              Upload Question Bank
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    Upload & Compile
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Template Info Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
            <h4 className="text-sm font-semibold text-white flex items-center mb-3">
              <HelpCircle className="mr-1.5 h-4 w-4 text-indigo-400" />
              Excel Columns Reference
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-350">QuestionType</strong>: MCQ, Subjective</li>
              <li><strong className="text-slate-350">QuestionText</strong>: The question text</li>
              <li><strong className="text-slate-350">OptionA - OptionD</strong>: Options for MCQs</li>
              <li><strong className="text-slate-350">CorrectAnswer</strong>: Option label (e.g. A, B)</li>
              <li><strong className="text-slate-350">Marks</strong>: Mark weight (1=easy, 2=med, 3=hard)</li>
              <li><strong className="text-slate-350">ImageFileName</strong>: Filename matching uploaded images</li>
            </ul>
          </div>
        </div>

        {/* Right: Question Banks List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
            <h3 className="text-lg font-bold text-white flex items-center mb-4">
              <Layers className="mr-2 h-5 w-5 text-indigo-400" />
              Available Question Pools ({qbs.length})
            </h3>

            {qbs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center text-slate-500">
                No question pools uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qbs.map((qb) => (
                  <div
                    key={qb._id}
                    className="rounded-xl border border-slate-850 bg-slate-900/40 p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight">{qb.name}</h4>
                        <span className="text-xs text-slate-500 uppercase font-mono mt-0.5 inline-block">{qb.code}</span>
                      </div>
                      <span className="inline-flex items-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 text-xs font-semibold text-indigo-400">
                        {qb.totalQuestions} Questions
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-slate-950/30 border border-slate-850 py-1.5 px-2">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Easy</p>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">{qb.stats.easy}</p>
                      </div>
                      <div className="rounded-lg bg-slate-950/30 border border-slate-850 py-1.5 px-2">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Medium</p>
                        <p className="text-sm font-bold text-indigo-400 mt-0.5">{qb.stats.medium}</p>
                      </div>
                      <div className="rounded-lg bg-slate-950/30 border border-slate-850 py-1.5 px-2">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Hard</p>
                        <p className="text-sm font-bold text-rose-400 mt-0.5">{qb.stats.hard}</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 text-right">
                      Uploaded on: {new Date(qb.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
