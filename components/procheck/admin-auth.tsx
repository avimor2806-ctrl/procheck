"use client";

import { useState } from "react";
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import type { ThemeType } from "@/lib/types";
import {
  authenticate,
  authenticateAsync,
  saveSession,
  ROLE_LABELS,
  type SessionUser,
} from "@/lib/users";

interface AdminAuthProps {
  theme: ThemeType;
  onAuthenticated: (user: SessionUser) => void;
  onCancel: () => void;
}

export function AdminAuth({ theme, onAuthenticated, onCancel }: AdminAuthProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (attempts >= 5) {
      setError("נחסמת זמנית. נסה שוב מאוחר יותר.");
      return;
    }

    setLoading(true);
    try {
      const user = await authenticateAsync(username, password);
      if (user) {
        saveSession(user);
        onAuthenticated(user);
      } else {
        setAttempts((prev) => prev + 1);
        setError(`פרטי כניסה שגויים. נותרו ${5 - attempts - 1} ניסיונות.`);
        setPassword("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade">
      <div
        className={`p-4 sm:p-8 md:p-12 rounded-3xl sm:rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
          theme === "dark"
            ? "bg-slate-900 border-white/10 shadow-black/50"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="max-w-md mx-auto text-center">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 rounded-full flex items-center justify-center ${
              theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"
            }`}
          >
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
          </div>

          <h2
            className={`text-2xl sm:text-3xl font-black mb-3 sm:mb-4 ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            כניסה למערכת
          </h2>
          <p
            className={`text-xs sm:text-sm mb-6 sm:mb-8 ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            הזן שם משתמש וסיסמה
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* שדה שם משתמש */}
            <div className="relative">
              <div
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                  theme === "dark" ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="שם משתמש"
                disabled={attempts >= 5}
                autoComplete="username"
                className={`w-full pr-12 pl-4 py-4 rounded-2xl text-lg font-bold transition-all outline-none ${
                  theme === "dark"
                    ? "bg-slate-800 border-2 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500"
                    : "bg-slate-100 border-2 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                } ${error ? "border-red-500" : ""} ${
                  attempts >= 5 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                autoFocus
              />
            </div>

            {/* שדה סיסמה */}
            <div className="relative">
              <div
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                  theme === "dark" ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="סיסמה"
                disabled={attempts >= 5}
                autoComplete="current-password"
                className={`w-full pr-12 pl-12 py-4 rounded-2xl text-lg font-bold transition-all outline-none ${
                  theme === "dark"
                    ? "bg-slate-800 border-2 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500"
                    : "bg-slate-100 border-2 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                } ${error ? "border-red-500" : ""} ${
                  attempts >= 5 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  theme === "dark"
                    ? "text-slate-500 hover:text-slate-300"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-bold animate-zoom">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={!username || !password || attempts >= 5 || loading}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                  username && password && attempts < 5 && !loading
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-xl"
                    : theme === "dark"
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {loading ? "מתחבר..." : "כניסה"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  theme === "dark"
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                }`}
              >
                <span>חזרה למחירון</span>
              </button>
            </div>
          </form>

          {/* רמז לפיתוח */}
          <div
            className={`mt-8 p-4 rounded-2xl text-xs text-right space-y-1 ${
              theme === "dark"
                ? "bg-slate-800/50 text-slate-400 border border-slate-700"
                : "bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            <div className="font-bold mb-2">משתמשים לפיתוח (סיסמה: 1234):</div>
            <div>• <code className="font-mono">admin</code> — {ROLE_LABELS.admin}</div>
            <div>• <code className="font-mono">manager</code> — {ROLE_LABELS.warehouse_manager}</div>
            <div>• <code className="font-mono">warehouse</code> — {ROLE_LABELS.warehouse}</div>
            <div>• <code className="font-mono">tech</code> — {ROLE_LABELS.technician}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
