"use client";

import { Calculator, LayoutDashboard, Moon, Sparkles, Sun, UserCircle2 } from "lucide-react";
import type { ThemeType, ViewType } from "@/lib/types";

interface HeaderProps {
  theme: ThemeType;
  view: ViewType;
  onThemeToggle: () => void;
  onViewToggle: () => void;
  onOpenAiModal: () => void;
  isAuthenticated?: boolean;
  onOpenProfile?: () => void;
}

export function Header({
  theme,
  view,
  onThemeToggle,
  onViewToggle,
  onOpenAiModal,
  isAuthenticated = false,
  onOpenProfile,
}: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-[100] backdrop-blur-xl border-b p-3 sm:p-4 md:px-8 transition-all ${
        theme === "dark"
          ? "bg-slate-900/90 border-white/10 shadow-2xl"
          : "bg-white/90 border-slate-200 shadow-sm"
      }`}
    >
      <div className="max-w-4xl mx-auto flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30 flex-shrink-0">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-tight leading-none truncate">
            Verifone{" "}
            <span className="text-blue-500 font-bold">
              Check Price
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {isAuthenticated && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              aria-label="פרופיל אישי"
              className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                theme === "dark"
                  ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
                  : "bg-emerald-50 border-emerald-200 text-emerald-600"
              }`}
            >
              <UserCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          <button
            onClick={onOpenAiModal}
            aria-label="AI עוזר"
            className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
              theme === "dark"
                ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-400"
                : "bg-indigo-50 border-indigo-200 text-indigo-600"
            }`}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onThemeToggle}
            aria-label={theme === "dark" ? "עבור למצב בהיר" : "עבור למצב כהה"}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
              theme === "dark"
                ? "bg-slate-800 border-slate-700 text-yellow-400"
                : "bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          <button
            onClick={onViewToggle}
            aria-label={view === "user" ? "ניהול" : "מחשבון"}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs border shadow-sm transition-all ${
              theme === "dark"
                ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                : "bg-blue-600 text-white border-blue-600"
            }`}
          >
            {view === "user" ? (
              <LayoutDashboard className="w-4 h-4" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {view === "user" ? "ניהול" : "מחשבון"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
