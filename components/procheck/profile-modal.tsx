"use client";

import { useEffect, useState } from "react";
import {
  X,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import type { ThemeType } from "@/lib/types";
import {
  ROLE_LABELS,
  changePassword,
  getCurrentPassword,
  type SessionUser,
} from "@/lib/users";

interface ProfileModalProps {
  theme: ThemeType;
  isOpen: boolean;
  onClose: () => void;
  currentUser: SessionUser;
  onLogout: () => void;
}

export function ProfileModal({
  theme,
  isOpen,
  onClose,
  currentUser,
  onLogout,
}: ProfileModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // הצגת סיסמה נוכחית (חשיפה במקום שינוי)
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // איפוס שדות בכל פתיחה
  useEffect(() => {
    if (isOpen) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
      setRevealedPassword(null);
      setError("");
      setSuccess("");
      setSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRevealPassword = async () => {
    if (revealedPassword) {
      // טוגל הסתרה
      setRevealedPassword(null);
      return;
    }
    setRevealLoading(true);
    try {
      const pwd = await getCurrentPassword(currentUser.username);
      setRevealedPassword(pwd);
    } catch {
      setError("שגיאה בטעינת הסיסמה הנוכחית");
    } finally {
      setRevealLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("יש למלא את כל השדות");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("הסיסמה החדשה ואימותה אינם תואמים");
      return;
    }
    if (newPassword.length < 4) {
      setError("הסיסמה החדשה חייבת להיות באורך 4 תווים לפחות");
      return;
    }

    setSaving(true);
    try {
      const res = await changePassword(
        currentUser.username,
        oldPassword,
        newPassword
      );
      if (res.ok) {
        setSuccess("הסיסמה שונתה בהצלחה ✔");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setRevealedPassword(null); // לאלץ ריענון בפעם הבאה
      } else {
        setError(res.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    theme === "dark"
      ? "bg-slate-800 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500"
      : "bg-slate-100 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400";

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md bg-black/60"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-lg max-h-[95vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col ${
          theme === "dark"
            ? "bg-slate-900 border-white/10"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            theme === "dark" ? "border-white/10" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500 flex-shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                className={`text-lg sm:text-xl font-black truncate ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                פרופיל אישי
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                {currentUser.displayName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
              theme === "dark"
                ? "hover:bg-white/10 text-slate-400"
                : "hover:bg-slate-100 text-slate-600"
            }`}
            aria-label="סגירה"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* פרטי משתמש */}
          <div
            className={`rounded-2xl border p-4 space-y-2 ${
              theme === "dark"
                ? "bg-slate-800/50 border-white/10"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-slate-500">שם משתמש</span>
              <span
                className={`font-mono font-bold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                {currentUser.username}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-slate-500">תפקיד</span>
              <span
                className={`font-bold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                {ROLE_LABELS[currentUser.role]}
              </span>
            </div>
            {currentUser.role === "technician" && (
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-500">מלאי מתקדם</span>
                <span
                  className={`flex items-center gap-1 font-bold ${
                    currentUser.advancedAccess
                      ? "text-amber-500"
                      : "text-slate-500"
                  }`}
                >
                  {currentUser.advancedAccess ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      מורשה
                    </>
                  ) : (
                    "לא מורשה"
                  )}
                </span>
              </div>
            )}
          </div>

          {/* הצגת סיסמה נוכחית */}
          <div
            className={`rounded-2xl border p-4 space-y-3 ${
              theme === "dark"
                ? "bg-slate-800/50 border-white/10"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-500" />
              <span
                className={`text-sm font-bold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                הסיסמה הנוכחית שלי
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex-1 px-3 py-2.5 rounded-xl border font-mono text-sm select-all ${inputBase}`}
                style={{ minHeight: "42px", display: "flex", alignItems: "center" }}
              >
                {revealedPassword ?? "••••••••"}
              </div>
              <button
                type="button"
                onClick={handleRevealPassword}
                disabled={revealLoading}
                className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                    : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                } ${revealLoading ? "opacity-50 cursor-wait" : ""}`}
                aria-label={revealedPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {revealedPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              ⚠️ אל תשתף את הסיסמה עם אף אחד
            </p>
          </div>

          {/* טופס שינוי סיסמה */}
          <form
            onSubmit={handleChangePassword}
            className={`rounded-2xl border p-4 space-y-3 ${
              theme === "dark"
                ? "bg-slate-800/50 border-white/10"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-blue-500" />
              <span
                className={`text-sm font-bold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                שינוי סיסמה
              </span>
            </div>

            {/* סיסמה ישנה */}
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="סיסמה נוכחית"
                autoComplete="current-password"
                className={`w-full pr-3 pl-10 py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500 ${inputBase}`}
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label={showOld ? "הסתר" : "הצג"}
              >
                {showOld ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* סיסמה חדשה */}
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="סיסמה חדשה (4 תווים לפחות)"
                autoComplete="new-password"
                className={`w-full pr-3 pl-10 py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500 ${inputBase}`}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label={showNew ? "הסתר" : "הצג"}
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* אימות סיסמה חדשה */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="אימות סיסמה חדשה"
                autoComplete="new-password"
                className={`w-full pr-3 pl-10 py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500 ${inputBase}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label={showConfirm ? "הסתר" : "הצג"}
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={
                saving || !oldPassword || !newPassword || !confirmPassword
              }
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                saving || !oldPassword || !newPassword || !confirmPassword
                  ? theme === "dark"
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              }`}
            >
              {saving ? "שומר..." : "עדכן סיסמה"}
            </button>
          </form>
        </div>

        {/* Footer - Logout */}
        <div
          className={`p-3 sm:p-4 border-t ${
            theme === "dark"
              ? "border-white/10 bg-slate-900/50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <button
            onClick={() => {
              if (window.confirm("להתנתק מהמערכת?")) {
                onLogout();
                onClose();
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            התנתק
          </button>
        </div>
      </div>
    </div>
  );
}
