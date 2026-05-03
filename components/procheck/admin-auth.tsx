"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import type { ThemeType } from "@/lib/types";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

interface AdminAuthProps {
  theme: ThemeType;
  onAuthenticated: () => void;
  onCancel: () => void;
}

export function AdminAuth({ theme, onAuthenticated, onCancel }: AdminAuthProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attempts >= 5) {
      setError("נחסמת זמנית. נסה שוב מאוחר יותר.");
      return;
    }

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuth", "true");
      onAuthenticated();
    } else {
      setAttempts((prev) => prev + 1);
      setError(`סיסמה שגויה. נותרו ${5 - attempts - 1} ניסיונות.`);
      setPassword("");
    }
  };

  return (
    <div className="space-y-8 animate-fade">
      <div
        className={`p-8 md:p-12 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
          theme === "dark"
            ? "bg-slate-900 border-white/10 shadow-black/50"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="max-w-md mx-auto text-center">
          <div
            className={`w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center ${
              theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"
            }`}
          >
            <ShieldCheck className="w-10 h-10 text-blue-500" />
          </div>

          <h2
            className={`text-3xl font-black mb-4 ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            כניסה לממשק ניהול
          </h2>
          <p
            className={`text-sm mb-8 ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            הזן את סיסמת המנהל כדי לגשת לניהול המחירון
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="סיסמת מנהל"
                disabled={attempts >= 5}
                className={`w-full pr-12 pl-12 py-4 rounded-2xl text-lg font-bold transition-all outline-none ${
                  theme === "dark"
                    ? "bg-slate-800 border-2 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500"
                    : "bg-slate-100 border-2 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                } ${error ? "border-red-500" : ""} ${
                  attempts >= 5 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                autoFocus
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
                disabled={!password || attempts >= 5}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                  password && attempts < 5
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-xl"
                    : theme === "dark"
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                כניסה
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
        </div>
      </div>
    </div>
  );
}
