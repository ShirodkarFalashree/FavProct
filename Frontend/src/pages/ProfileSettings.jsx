import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { toast } from "react-hot-toast";
import { User, Lock, Mail, Shield, Building, Save } from "lucide-react";

const ProfileSettings = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (password) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await API.put("/auth/update-profile", {
        userId: user.userId || user._id,
        name,
        password: password || undefined
      });

      // Update user in context and localStorage
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
          <User className="mr-2.5 h-7 w-7 text-indigo-400" />
          Profile Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account information and update your password here.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-850">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Account Parameters</h3>
              <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider font-semibold font-mono">
                System Role: {user.role}
              </p>
            </div>
          </div>

          {/* Org details */}
          <div className="flex items-center text-xs text-slate-450 space-x-2">
            <Building className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Institution:</span>
            <span className="font-semibold text-slate-200">{user.organizationName || "Institution Panel"}</span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Email (Disabled) */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email Address (Cannot be modified)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="block w-full rounded-xl border border-slate-850 bg-slate-950/20 py-3 pl-10 pr-4 text-slate-500 text-sm cursor-not-allowed select-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security / Password section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-850">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Change Password</h3>
              <p className="text-xs text-slate-400 mt-0.5">Leave blank if you do not want to change it.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="Match password above"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-955/50 py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          {submitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
