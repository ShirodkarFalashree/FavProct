import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Layers, Plus, BookOpen, ChevronRight, Tag } from "lucide-react";

const Cohorts = () => {
  const { user } = useAuth();
  const [cohorts, setCohorts] = useState([]);
  const [cohortName, setCohortName] = useState("");
  const [loading, setLoading] = useState(true);

  // Forms for classes/subjects
  const [activeCohortForm, setActiveCohortForm] = useState(null); // cohortId
  const [className, setClassName] = useState("");

  const [activeClassForm, setActiveClassForm] = useState(null); // classId
  const [subjectName, setSubjectName] = useState("");

  const fetchCohorts = async () => {
    try {
      const res = await API.get(`/cohorts?organizationId=${user.organizationId}`);
      setCohorts(res.data);
    } catch (err) {
      toast.error("Failed to load cohorts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohorts();
  }, [user.organizationId]);

  const handleCreateCohort = async (e) => {
    e.preventDefault();
    if (!cohortName.trim()) return;

    try {
      await API.post("/cohorts", {
        name: cohortName.trim(),
        organizationId: user.organizationId
      });
      toast.success("Cohort created successfully!");
      setCohortName("");
      fetchCohorts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create cohort");
    }
  };

  const handleAddClass = async (cohortId) => {
    if (!className.trim()) return;
    try {
      await API.post(`/cohorts/${cohortId}/classes`, {
        className: className.trim()
      });
      toast.success("Class added successfully!");
      setClassName("");
      setActiveCohortForm(null);
      fetchCohorts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add class");
    }
  };

  const handleAddSubject = async (cohortId, classId) => {
    if (!subjectName.trim()) return;
    try {
      await API.post(`/cohorts/${cohortId}/classes/${classId}/subjects`, {
        subjectName: subjectName.trim()
      });
      toast.success("Subject added successfully!");
      setSubjectName("");
      setActiveClassForm(null);
      fetchCohorts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add subject");
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
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Academic Structure</h1>
        <p className="text-sm text-slate-400 mt-1">
          Set up cohorts (batches/years), split them into classes (sections), and allocate subjects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Cohort */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center mb-4">
              <Layers className="mr-2 h-5 w-5 text-indigo-400" />
              Add Cohort
            </h3>
            <form onSubmit={handleCreateCohort} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Cohort / Batch Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch of 2026, Grade 10"
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-semibold text-white transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Cohort
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List Cohorts, Classes, Subjects */}
        <div className="lg:col-span-2 space-y-6">
          {cohorts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center text-slate-500">
              No cohorts defined yet. Start by adding one on the left.
            </div>
          ) : (
            cohorts.map((cohort) => (
              <div
                key={cohort._id}
                className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-extrabold text-white flex items-center">
                    <Layers className="mr-2 h-5 w-5 text-indigo-400" />
                    {cohort.name}
                  </h3>
                  <button
                    onClick={() => setActiveCohortForm(activeCohortForm === cohort._id ? null : cohort._id)}
                    className="flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Class
                  </button>
                </div>

                {/* Add Class Inline Form */}
                {activeCohortForm === cohort._id && (
                  <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <input
                      type="text"
                      placeholder="Class name (e.g. Class 10-A)"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-950/50 py-1.5 px-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-xs"
                    />
                    <button
                      onClick={() => handleAddClass(cohort._id)}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}

                {/* Classes Grid */}
                <div className="space-y-4">
                  {cohort.classes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No classes defined in this cohort.</p>
                  ) : (
                    cohort.classes.map((classItem) => (
                      <div
                        key={classItem._id}
                        className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-200 flex items-center">
                            <ChevronRight className="mr-1.5 h-4 w-4 text-indigo-400" />
                            {classItem.name}
                          </h4>
                          {/* <button
                            onClick={() => setActiveClassForm(activeClassForm === classItem._id ? null : classItem._id)}
                            className="flex items-center text-[10px] uppercase font-bold text-slate-400 hover:text-slate-300 transition-colors"
                          >
                            <Plus className="mr-0.5 h-3 w-3" />
                            Add Subject
                          </button> */}
                        </div>

                        {/* Add Subject Inline Form */}
                        {activeClassForm === classItem._id && (
                          <div className="flex items-center space-x-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                            <input
                              type="text"
                              placeholder="Subject name (e.g. Physics)"
                              value={subjectName}
                              onChange={(e) => setSubjectName(e.target.value)}
                              className="flex-1 rounded-lg border border-slate-800 bg-slate-950/50 py-1 px-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-xs"
                            />
                            <button
                              onClick={() => handleAddSubject(cohort._id, classItem._id)}
                              className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        )}

                        {/* Subjects badges */}
                        {/* <div className="flex flex-wrap gap-2">
                          {classItem.subjects.length === 0 ? (
                            <span className="text-[10px] text-slate-500 italic">No subjects added.</span>
                          ) : (
                            classItem.subjects.map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-400"
                              >
                                <Tag className="mr-1 h-3 w-3" />
                                {sub}
                              </span>
                            ))
                          )}
                        </div> */}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Cohorts;
