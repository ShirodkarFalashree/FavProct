import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { Building, Plus, X, Tag, Mail, User, Shield, HelpCircle } from "lucide-react";

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [plan, setPlan] = useState("free");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const fetchOrganizations = async () => {
    try {
      const res = await API.get("/org");
      setOrgs(res.data);
    } catch (err) {
      toast.error("Failed to load institutions list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !code.trim() || !adminName.trim() || !adminEmail.trim()) {
      toast.error("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/org", {
        name: name.trim(),
        organizationCode: code.trim(),
        plan,
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim()
      });

      toast.success("Institution configured and Admin email sent!");
      setShowModal(false);

      // Reset fields
      setName("");
      setCode("");
      setPlan("free");
      setAdminName("");
      setAdminEmail("");

      fetchOrganizations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create organization");
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
            <Shield className="mr-2.5 h-7 w-7 text-indigo-400" />
            Super Admin Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System Platform Management. Welcome back, <strong className="text-white">{user.name}</strong>.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-3 px-5 text-sm font-semibold text-white transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="mr-1.5 h-5 w-5" />
          Add Institution
        </button>
      </div>

      {/* Organizations Directory Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
        <h3 className="text-lg font-bold text-white flex items-center mb-6">
          <Building className="mr-2 h-5 w-5 text-indigo-400" />
          Configured Institutes ({orgs.length})
        </h3>

        {orgs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-16 text-center text-slate-500">
            <HelpCircle className="mx-auto h-12 w-12 text-slate-655 mb-3" />
            <p className="font-semibold text-slate-400">No institutions registered yet</p>
            <p className="text-xs text-slate-500 mt-1">Click the button above to register the first institute.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgs.map((org) => (
              <div
                key={org._id}
                className="rounded-xl border border-slate-855 bg-slate-900/40 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all hover:bg-slate-900/50"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">{org.name}</h4>
                      <span className="text-xs text-slate-500 uppercase font-mono mt-0.5 inline-block">Code: {org.organizationCode}</span>
                    </div>
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold uppercase border ${
                      org.plan === "pro" 
                        ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
                        : org.plan === "standard"
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}>
                      {org.plan}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 pt-2 space-y-1">
                    <p>Register Date: {new Date(org.createdAt).toLocaleDateString()}</p>
                    <p className="font-mono text-[10px]">ID: {org._id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD INSTITUTION DIALOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Building className="mr-2 h-5 w-5 text-indigo-400" />
                Register New Institution
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                
                {/* Org Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Institution Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Building className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stanford University"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Org Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Org Code (Unique)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Tag className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. STAN"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm uppercase font-mono"
                      />
                    </div>
                  </div>

                  {/* Plan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      License Plan
                    </label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3 px-4 text-white focus:border-indigo-500 focus:outline-none text-sm cursor-pointer"
                    >
                      <option value="free" className="bg-slate-900 text-white">Free Plan</option>
                      <option value="standard" className="bg-slate-900 text-white">Standard</option>
                      <option value="pro" className="bg-slate-900 text-white">Pro Plan</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Configure Admin Account</h4>
                  
                  {/* Admin Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Admin Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Professor Smith"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Admin Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Admin Email (Credentials Mail Target)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="e.g. smith@stanford.edu"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                  Note: A login email will automatically be sent to the administrator with the temporary password generated as <strong>[OrgCode]@2026</strong>.
                </p>

              </div>

              {/* Footer */}
              <div className="border-t border-slate-800 p-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl bg-slate-850 border border-slate-700 hover:bg-slate-800 py-2.5 px-5 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-2.5 px-6 text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                >
                  {submitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "Register & Invite"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
