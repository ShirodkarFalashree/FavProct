import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Users, Plus, Mail, BookOpen, UserPlus, Tag } from "lucide-react";

const Teachers = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subjectsRaw, setSubjectsRaw] = useState("");

  const fetchTeachers = async () => {
    try {
      const res = await API.get(`/admin/teachers?organizationId=${user.organizationId}`);
      setTeachers(res.data);
    } catch (err) {
      toast.error("Failed to load teachers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [user.organizationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    const subjects = subjectsRaw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    setSubmitting(true);
    try {
      await API.post("/admin/teachers", {
        name,
        email: email.trim().toLowerCase(),
        organizationId: user.organizationId,
        subjects
      });
      toast.success("Teacher account created. Welcome email dispatched!");
      setName("");
      setEmail("");
      setSubjectsRaw("");
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add teacher");
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
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Teacher Accounts</h1>
        <p className="text-sm text-slate-400 mt-1">
          Create teacher accounts manually. On creation, the system triggers a welcome email containing login credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center mb-4">
              <UserPlus className="mr-2 h-5 w-5 text-indigo-400" />
              Onboard Teacher
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Professor Richard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="richard@institute.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-10 pr-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Assigned Subjects
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Science, Physics, Chemistry"
                    value={subjectsRaw}
                    onChange={(e) => setSubjectsRaw(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-10 pr-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Separate multiple subjects with commas.</p>
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
                    <Plus className="mr-2 h-4 w-4" />
                    Onboard Teacher
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Teachers List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
            <h3 className="text-lg font-bold text-white flex items-center mb-4">
              <Users className="mr-2 h-5 w-5 text-indigo-400" />
              Registered Teachers ({teachers.length})
            </h3>

            {teachers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center text-slate-500">
                No teachers registered yet. Onboard one on the left.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-850">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Assigned Subjects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-sm">
                    {teachers.map((teacher) => (
                      <tr key={teacher._id} className="text-slate-300">
                        <td className="py-4 font-semibold text-white">{teacher.name}</td>
                        <td className="py-4">{teacher.email}</td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {teacher.subjects && teacher.subjects.length > 0 ? (
                              teacher.subjects.map((sub, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-400"
                                >
                                  <Tag className="mr-1 h-3.5 w-3.5" />
                                  {sub}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 italic">None assigned</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teachers;
