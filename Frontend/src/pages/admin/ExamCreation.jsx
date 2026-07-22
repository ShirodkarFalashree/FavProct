import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { FilePlus2, AlertCircle, Sparkles, Settings, Calculator, HelpCircle } from "lucide-react";

const ExamCreation = () => {
  const { user } = useAuth();
  const [qbs, setQbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  const [easyCount, setEasyCount] = useState(4); // 4 * 1 = 4
  const [mediumCount, setMediumCount] = useState(3); // 3 * 2 = 6
  const [hardCount, setHardCount] = useState(0); // 0 * 3 = 0
  // total = 10 marks

  useEffect(() => {
    const fetchQBs = async () => {
      try {
        const res = await API.get(`/question-bank?organizationId=${user.organizationId}`);
        setQbs(res.data);
        if (res.data.length > 0) {
          setQuestionBankId(res.data[0]._id);
        }
      } catch (err) {
        toast.error("Failed to load question banks");
      } finally {
        setLoading(false);
      }
    };
    fetchQBs();
  }, [user.organizationId]);

  // Real-time calculation of marks based on difficulty counts
  const computedEasyMarks = easyCount * 1;
  const computedMediumMarks = mediumCount * 2;
  const computedHardMarks = hardCount * 3;
  const computedTotalMarks = computedEasyMarks + computedMediumMarks + computedHardMarks;
  const marksMatch = computedTotalMarks === Number(totalMarks);

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
    try {
      const payload = {
        title,
        code: code.toUpperCase(),
        questionBankId,
        organizationId: user.organizationId,
        userId: user.userId || user._id,
        duration: Number(duration),
        totalMarks: Number(totalMarks),
        scheduledDateTime: scheduledDateTime || null,
        settings: {
          calculatorAllowed,
          negativeMarking: Number(negativeMarking)
        },
        difficultyDistribution: {
          easy: Number(easyCount),
          medium: Number(mediumCount),
          hard: Number(hardCount)
        }
      };

      await API.post("/exam/create", payload);
      toast.success("Exam generated successfully using random distribution!");
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
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Automated Exam</h1>
        <p className="text-sm text-slate-400 mt-1">
          Define exam rules, choose a question bank, set the difficulty distribution, and compile an exam randomly.
        </p>
      </div>

      {qbs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center text-slate-500">
          You must upload a Question Bank pool before creating exams. Go to "Question Banks" first.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: General Configuration */}
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
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
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
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm uppercase"
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
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white focus:border-indigo-500 focus:outline-none text-sm"
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
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
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
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Scheduled Start Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center">
                  <Calculator className="mr-1.5 h-4.5 w-4.5 text-indigo-400" />
                  Exam Policy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 rounded-xl border border-slate-800 bg-slate-950/20 p-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calculatorAllowed}
                      onChange={(e) => setCalculatorAllowed(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">Allow Calculator</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Students can open an onscreen calculator.</p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Negative Marking Ratio
                    </label>
                    <select
                      value={negativeMarking}
                      onChange={(e) => setNegativeMarking(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white focus:border-indigo-500 focus:outline-none text-sm"
                    >
                      <option value="0" className="bg-slate-900">None (0%)</option>
                      <option value="0.25" className="bg-slate-900">Quarter (-25%)</option>
                      <option value="0.33" className="bg-slate-900">One Third (-33%)</option>
                      <option value="0.5" className="bg-slate-900">Half (-50%)</option>
                      <option value="1" className="bg-slate-900">Full (-100%)</option>
                    </select>
                  </div>
                </div>
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
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 px-3.5 text-white text-sm"
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
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 px-3.5 text-white text-sm"
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
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 px-3.5 text-white text-sm"
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
                className="w-full flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
      )}
    </div>
  );
};

export default ExamCreation;
