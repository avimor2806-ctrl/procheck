"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  X,
  Search,
  Pencil,
  KeyRound,
  RotateCcw,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Shield,
  Trash2,
} from "lucide-react";
import type { ThemeType, Technician } from "@/lib/types";
import {
  ROLE_LABELS,
  listAllUsers,
  getCurrentPassword,
  adminSetPassword,
  adminResetPassword,
  setSystemUserOverride,
  type UserDirectoryEntry,
} from "@/lib/users";

interface UsersManagerProps {
  theme: ThemeType;
  isOpen: boolean;
  onClose: () => void;
  technicians: Technician[]; // לצורך עדכון live של טכנאים
  onUpdateTechnicianUsername: (
    id: string,
    oldUsername: string,
    newUsername: string
  ) => Promise<void>;
  onUpdateTechnicianDisplayName: (id: string, newName: string) => Promise<void>;
  onRemoveTechnician: (id: string) => void;
  onToggleAdvanced: (id: string, value: boolean) => void;
  showNotification: (msg: string, type?: "success" | "error") => void;
}

type EditMode = null | "username" | "displayName" | "password";

export function UsersManager({
  theme,
  isOpen,
  onClose,
  technicians,
  onUpdateTechnicianUsername,
  onUpdateTechnicianDisplayName,
  onRemoveTechnician,
  onToggleAdvanced,
  showNotification,
}: UsersManagerProps) {
  const [users, setUsers] = useState<UserDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [editingUser, setEditingUser] = useState<UserDirectoryEntry | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await listAllUsers();
      setUsers(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setRevealedPasswords({});
      setEditingUser(null);
      setEditMode(null);
      loadUsers();
    }
  }, [isOpen]);

  // עדכון live של טכנאים שהשתנו מבחוץ
  useEffect(() => {
    if (!isOpen) return;
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [technicians.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        ROLE_LABELS[u.role].includes(q)
    );
  }, [users, search]);

  const handleRevealPassword = async (user: UserDirectoryEntry) => {
    const key = user.id;
    if (revealedPasswords[key]) {
      // hide
      const next = { ...revealedPasswords };
      delete next[key];
      setRevealedPasswords(next);
      return;
    }
    try {
      // לפי source: system משתמש ב-id (system username), technician ב-username
      const lookupName = user.source === "system" ? user.id : user.username;
      const pwd = await getCurrentPassword(lookupName);
      setRevealedPasswords((prev) => ({ ...prev, [key]: pwd }));
    } catch {
      showNotification("שגיאה בטעינת סיסמה", "error");
    }
  };

  const handleResetPassword = async (user: UserDirectoryEntry) => {
    if (
      !window.confirm(
        `לאפס את הסיסמה של "${user.displayName}" לברירת המחדל (1234)?`
      )
    )
      return;
    const lookupName = user.source === "system" ? user.id : user.username;
    const res = await adminResetPassword(lookupName);
    if (res.ok) {
      showNotification(`הסיסמה של "${user.displayName}" אופסה ל-1234`);
      // הסר מהחשיפה אם הייתה
      const next = { ...revealedPasswords };
      delete next[user.id];
      setRevealedPasswords(next);
      loadUsers();
    } else {
      showNotification(res.error, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md bg-black/60"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full sm:max-w-4xl h-[95vh] sm:max-h-[90vh] sm:h-auto overflow-hidden rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col ${
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
              <div className="p-2 rounded-xl bg-purple-600/20 text-purple-500 flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2
                  className={`text-lg sm:text-xl font-black truncate ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}
                >
                  ניהול משתמשים
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                  {users.length} משתמשים · הצגה, עריכה, איפוס סיסמאות
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

          {/* Search */}
          <div
            className={`p-3 sm:p-4 border-b ${
              theme === "dark" ? "border-white/10" : "border-slate-200"
            }`}
          >
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש לפי שם משתמש, שם תצוגה או תפקיד..."
                className={`w-full pr-10 pl-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 text-sm ${
                  theme === "dark"
                    ? "bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2">
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                טוען משתמשים...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                לא נמצאו משתמשים תואמים.
              </div>
            ) : (
              filtered.map((user) => {
                const revealed = revealedPasswords[user.id];
                return (
                  <div
                    key={user.id}
                    className={`rounded-2xl border p-3 sm:p-4 transition-all ${
                      theme === "dark"
                        ? "bg-slate-800/50 border-white/5"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    {/* Row top: identity */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`p-2 rounded-xl flex-shrink-0 ${
                            user.role === "admin"
                              ? "bg-red-500/20 text-red-500"
                              : user.role === "warehouse_manager"
                              ? "bg-blue-500/20 text-blue-500"
                              : user.role === "warehouse"
                              ? "bg-emerald-500/20 text-emerald-500"
                              : "bg-amber-500/20 text-amber-500"
                          }`}
                        >
                          {user.role === "technician" && user.advancedAccess ? (
                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-sm sm:text-base font-bold truncate ${
                              theme === "dark" ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {user.displayName}
                          </div>
                          <div className="text-[10px] sm:text-xs text-slate-500 truncate flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono">@{user.username}</span>
                            <span>·</span>
                            <span>{ROLE_LABELS[user.role]}</span>
                            {user.source === "system" && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-slate-500/20 text-slate-500">
                                מערכת
                              </span>
                            )}
                            {user.hasCustomPassword && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-blue-500/20 text-blue-500">
                                סיסמה מותאמת
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Toggle advanced for technicians */}
                      {user.source === "technician" && (
                        <button
                          role="switch"
                          aria-checked={user.advancedAccess}
                          aria-label="גישה למלאי מתקדם"
                          onClick={() =>
                            onToggleAdvanced(user.id, !user.advancedAccess)
                          }
                          title="גישה למלאי מתקדם"
                          className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                            user.advancedAccess
                              ? "bg-amber-500"
                              : theme === "dark"
                              ? "bg-slate-700"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                              user.advancedAccess
                                ? "right-0.5"
                                : "right-[1.15rem]"
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Password reveal row */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`flex-1 px-3 py-2 rounded-lg border font-mono text-xs select-all min-h-[34px] flex items-center ${
                          theme === "dark"
                            ? "bg-slate-900 border-slate-700 text-slate-300"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        {revealed ?? "••••••••"}
                      </div>
                      <button
                        onClick={() => handleRevealPassword(user)}
                        title={revealed ? "הסתר" : "הצג סיסמה"}
                        className={`p-2 rounded-lg border transition-all flex-shrink-0 ${
                          theme === "dark"
                            ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                            : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        {revealed ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setEditMode("username");
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          theme === "dark"
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        שם משתמש
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setEditMode("displayName");
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          theme === "dark"
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        שם תצוגה
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setEditMode("password");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        שנה סיסמה
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        title="אפס סיסמה ל-1234"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        איפוס
                      </button>
                      {user.source === "technician" && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `למחוק את הטכנאי "${user.displayName}"?`
                              )
                            ) {
                              onRemoveTechnician(user.id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 mr-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          מחק
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            className={`p-3 border-t text-[10px] sm:text-xs text-slate-500 text-center ${
              theme === "dark"
                ? "border-white/10 bg-slate-900/50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            🔒 פעולות אלו זמינות למנהל מערכת בלבד · איפוס מחזיר את הסיסמה ל-1234
          </div>
        </div>
      </div>

      {editingUser && editMode && (
        <EditUserFieldModal
          theme={theme}
          user={editingUser}
          mode={editMode}
          onClose={() => {
            setEditingUser(null);
            setEditMode(null);
          }}
          onSaved={() => {
            loadUsers();
          }}
          onUpdateTechnicianUsername={onUpdateTechnicianUsername}
          onUpdateTechnicianDisplayName={onUpdateTechnicianDisplayName}
          showNotification={showNotification}
        />
      )}
    </>
  );
}

// ============================================================
// Edit field modal
// ============================================================

interface EditModalProps {
  theme: ThemeType;
  user: UserDirectoryEntry;
  mode: "username" | "displayName" | "password";
  onClose: () => void;
  onSaved: () => void;
  onUpdateTechnicianUsername: (
    id: string,
    oldUsername: string,
    newUsername: string
  ) => Promise<void>;
  onUpdateTechnicianDisplayName: (id: string, newName: string) => Promise<void>;
  showNotification: (msg: string, type?: "success" | "error") => void;
}

function EditUserFieldModal({
  theme,
  user,
  mode,
  onClose,
  onSaved,
  onUpdateTechnicianUsername,
  onUpdateTechnicianDisplayName,
  showNotification,
}: EditModalProps) {
  const [value, setValue] = useState<string>(() => {
    if (mode === "username") return user.username;
    if (mode === "displayName") return user.displayName;
    return "";
  });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title =
    mode === "username"
      ? "עריכת שם משתמש"
      : mode === "displayName"
      ? "עריכת שם תצוגה"
      : "שינוי סיסמה";

  const placeholder =
    mode === "username"
      ? "שם משתמש חדש"
      : mode === "displayName"
      ? "שם תצוגה חדש"
      : "סיסמה חדשה (4 תווים לפחות)";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = value.trim();
    if (!trimmed) {
      setError("הערך לא יכול להיות ריק");
      return;
    }

    setSaving(true);
    try {
      if (mode === "password") {
        if (trimmed.length < 4) {
          setError("הסיסמה חייבת להיות באורך 4 תווים לפחות");
          return;
        }
        // לפי source: system משתמש ב-id, technician ב-username
        const lookupName =
          user.source === "system" ? user.id : user.username;
        const res = await adminSetPassword(lookupName, trimmed);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        showNotification(
          `הסיסמה של "${user.displayName}" עודכנה בהצלחה`
        );
      } else if (mode === "username") {
        if (user.source === "system") {
          const res = await setSystemUserOverride(user.id, {
            username: trimmed,
          });
          if (!res.ok) {
            setError(res.error);
            return;
          }
          showNotification(`שם המשתמש עודכן ל-${trimmed}`);
        } else {
          // technician
          await onUpdateTechnicianUsername(user.id, user.username, trimmed);
        }
      } else if (mode === "displayName") {
        if (user.source === "system") {
          const res = await setSystemUserOverride(user.id, {
            displayName: trimmed,
          });
          if (!res.ok) {
            setError(res.error);
            return;
          }
          showNotification(`שם התצוגה עודכן`);
        } else {
          await onUpdateTechnicianDisplayName(user.id, trimmed);
        }
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Edit user error:", err);
      setError("שגיאה בשמירה. נסה שוב.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/70"
      onClick={onClose}
    >
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl border shadow-2xl ${
          theme === "dark"
            ? "bg-slate-900 border-white/10"
            : "bg-white border-slate-200"
        }`}
      >
        <div
          className={`p-4 border-b flex items-center justify-between gap-3 ${
            theme === "dark" ? "border-white/10" : "border-slate-200"
          }`}
        >
          <div>
            <h3
              className={`text-base font-black ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              {title}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {user.displayName} · @{user.username}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              theme === "dark"
                ? "hover:bg-white/10 text-slate-400"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <input
              type={mode === "password" && !showPwd ? "password" : "text"}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              placeholder={placeholder}
              autoFocus
              autoComplete="off"
              className={`w-full pr-3 ${
                mode === "password" ? "pl-10" : "pl-3"
              } py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500 ${
                theme === "dark"
                  ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  : "bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400"
              }`}
            />
            {mode === "password" && (
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div
          className={`p-4 border-t flex gap-2 ${
            theme === "dark" ? "border-white/10" : "border-slate-200"
          }`}
        >
          <button
            type="submit"
            disabled={saving || !value.trim()}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              saving || !value.trim()
                ? theme === "dark"
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? "שומר..." : "שמור"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              theme === "dark"
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
