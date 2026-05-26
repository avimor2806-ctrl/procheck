"use client";

import { useState, useMemo } from "react";
import { Users, X, Plus, Trash2, ShieldCheck, Shield, Search } from "lucide-react";
import type { ThemeType, Technician } from "@/lib/types";

interface TechniciansManagerProps {
  theme: ThemeType;
  isOpen: boolean;
  onClose: () => void;
  technicians: Technician[];
  onAddTechnician: (displayName: string, username: string, advancedAccess: boolean) => void;
  onRemoveTechnician: (id: string) => void;
  onToggleAdvanced: (id: string, value: boolean) => void;
}

export function TechniciansManager({
  theme,
  isOpen,
  onClose,
  technicians,
  onAddTechnician,
  onRemoveTechnician,
  onToggleAdvanced,
}: TechniciansManagerProps) {
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newAdvancedAccess, setNewAdvancedAccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTechs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = [...technicians].sort((a, b) =>
      a.displayName.localeCompare(b.displayName, "he")
    );
    if (!q) return list;
    return list.filter(
      (t) =>
        t.displayName.toLowerCase().includes(q) ||
        t.username.toLowerCase().includes(q)
    );
  }, [technicians, searchQuery]);

  if (!isOpen) return null;

  const handleAdd = () => {
    const name = newName.trim();
    const user = newUsername.trim();
    if (!name) return;
    onAddTechnician(name, user || name, newAdvancedAccess);
    setNewName("");
    setNewUsername("");
    setNewAdvancedAccess(false);
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md bg-black/60"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-3xl h-[95vh] sm:max-h-[90vh] sm:h-auto overflow-hidden rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col ${
          theme === "dark"
            ? "bg-slate-900 border-white/10"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-6 border-b flex items-center justify-between gap-3 ${
            theme === "dark" ? "border-white/10" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500 flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2
                className={`text-lg sm:text-xl font-black truncate ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                ניהול טכנאים
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
                {technicians.length} טכנאים · סמן גישה למלאי מתקדם
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

        {/* Add new tech */}
        <div
          className={`p-3 sm:p-5 border-b ${
            theme === "dark"
              ? "border-white/10 bg-slate-900/50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="שם הטכנאי"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className={`flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                  theme === "dark"
                    ? "bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                }`}
              />
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="שם משתמש (אופציונלי)"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className={`flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                  theme === "dark"
                    ? "bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                }`}
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                הוסף
              </button>
            </div>

            {/* Toggle לגישה למלאי מתקדם בעת יצירה */}
            <button
              type="button"
              onClick={() => setNewAdvancedAccess((v) => !v)}
              className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                newAdvancedAccess
                  ? theme === "dark"
                    ? "bg-amber-500/10 border-amber-500/40"
                    : "bg-amber-50 border-amber-300"
                  : theme === "dark"
                  ? "bg-slate-800/50 border-white/10 hover:border-white/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                  className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                    newAdvancedAccess
                      ? "bg-amber-500/20 text-amber-500"
                      : theme === "dark"
                      ? "bg-slate-700 text-slate-400"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {newAdvancedAccess ? (
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <div className="text-right min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-bold truncate ${
                      newAdvancedAccess
                        ? "text-amber-500"
                        : theme === "dark"
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    גישה למלאי מתקדם
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 truncate">
                    מאפשר טיפול בקופות/מסופים/אביזרים מתקדמים
                  </div>
                </div>
              </div>
              <div
                role="switch"
                aria-checked={newAdvancedAccess}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  newAdvancedAccess
                    ? "bg-amber-500"
                    : theme === "dark"
                    ? "bg-slate-700"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    newAdvancedAccess ? "right-0.5" : "right-[1.4rem]"
                  }`}
                />
              </div>
            </button>
          </div>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש טכנאי..."
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
          {filteredTechs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              {technicians.length === 0
                ? "אין טכנאים. הוסף טכנאי ראשון מלמעלה."
                : "לא נמצאו טכנאים תואמים לחיפוש."}
            </div>
          ) : (
            filteredTechs.map((tech) => (
              <div
                key={tech.id}
                className={`flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border transition-all ${
                  theme === "dark"
                    ? "bg-slate-800/50 border-white/5 hover:border-blue-500/30"
                    : "bg-white border-slate-200 hover:border-blue-400"
                } ${
                  tech.advancedAccess
                    ? theme === "dark"
                      ? "ring-1 ring-amber-500/30"
                      : "ring-1 ring-amber-400/50"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 ${
                      tech.advancedAccess
                        ? "bg-amber-500/20 text-amber-500"
                        : theme === "dark"
                        ? "bg-slate-700 text-slate-400"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tech.advancedAccess ? (
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm sm:text-base font-bold truncate ${
                        theme === "dark" ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {tech.displayName}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500 truncate flex items-center gap-1.5 flex-wrap">
                      <span className="truncate">@{tech.username}</span>
                      {tech.advancedAccess && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black bg-amber-500/20 text-amber-500 whitespace-nowrap">
                          מלאי מתקדם
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  {/* Toggle for advanced access */}
                  <span
                    className={`text-xs font-bold hidden md:inline ${
                      tech.advancedAccess ? "text-amber-500" : "text-slate-500"
                    }`}
                  >
                    מלאי מתקדם
                  </span>
                  <button
                    role="switch"
                    aria-checked={tech.advancedAccess}
                    aria-label={`החלף גישה למלאי מתקדם ל${tech.displayName}`}
                    onClick={() =>
                      onToggleAdvanced(tech.id, !tech.advancedAccess)
                    }
                    className={`relative w-11 h-6 sm:w-12 sm:h-6 rounded-full transition-colors flex-shrink-0 ${
                      tech.advancedAccess
                        ? "bg-amber-500"
                        : theme === "dark"
                        ? "bg-slate-700"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        tech.advancedAccess ? "right-0.5" : "right-[1.4rem] sm:right-6"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(`למחוק את הטכנאי "${tech.displayName}"?`)
                      ) {
                        onRemoveTechnician(tech.id);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                    title="מחק"
                    aria-label={`מחק את ${tech.displayName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div
          className={`p-3 sm:p-4 border-t text-[10px] sm:text-xs text-slate-500 ${
            theme === "dark"
              ? "border-white/10 bg-slate-900/50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          💡 טכנאים עם מלאי מתקדם רואים פריטים שתויגו כ"מלאי מתקדם" ויכולים להזמין מקטגוריית "אנליזה".
        </div>
      </div>
    </div>
  );
}
