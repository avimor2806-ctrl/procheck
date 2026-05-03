"use client";

import { Loader2, Send, Sparkles } from "lucide-react";
import type { ThemeType } from "@/lib/types";

interface AIModalProps {
  theme: ThemeType;
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (query: string) => void;
  response: string | null;
  loading: boolean;
  onSubmit: () => void;
}

export function AIModal({
  theme,
  isOpen,
  onClose,
  query,
  setQuery,
  response,
  loading,
  onSubmit,
}: AIModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade"
        onClick={onClose}
      />
      <div
        className={`rounded-2xl sm:rounded-[3rem] w-full max-w-2xl border relative z-10 p-4 sm:p-6 md:p-10 shadow-2xl animate-zoom max-h-[95vh] overflow-y-auto ${
          theme === "dark"
            ? "bg-slate-900 border-white/10 text-white shadow-black"
            : "bg-white border-slate-200 shadow-slate-300"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 text-indigo-500 mb-6 sm:mb-10">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">עוזר טכני AI</h2>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="תאר את התקלה במילים חופשיות..."
          className={`w-full p-4 sm:p-6 border-2 rounded-2xl sm:rounded-3xl font-bold outline-none h-32 sm:h-40 mb-4 sm:mb-6 text-base sm:text-lg transition-all ${
            theme === "dark"
              ? "bg-slate-950 border-white/5 text-white focus:border-indigo-500/50 shadow-inner"
              : "bg-slate-50 border-slate-100 focus:border-indigo-600"
          }`}
        />

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 sm:py-6 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:bg-indigo-700 transition-all"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
          ) : (
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
          נתח תקלה במערכת
        </button>

        {response && (
          <div
            className={`p-4 sm:p-6 md:p-8 mt-4 sm:mt-8 rounded-2xl sm:rounded-3xl border-2 animate-zoom ${
              theme === "dark"
                ? "bg-indigo-950/20 border-indigo-500/30 text-indigo-50"
                : "bg-indigo-50 border-indigo-200 text-indigo-950"
            }`}
          >
            <h4 className="text-xs font-black uppercase mb-3 sm:mb-4 text-indigo-500 tracking-widest border-b border-indigo-500/20 pb-2">
              ניתוח המומחה הדיגיטלי:
            </h4>
            <p className="leading-relaxed font-medium text-base sm:text-lg">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
