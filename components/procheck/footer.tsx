"use client";

import type { ThemeType } from "@/lib/types";

interface FooterProps {
  theme: ThemeType;
}

export function Footer({ theme }: FooterProps) {
  return (
    <footer
      className={`mt-auto py-6 px-4 border-t text-center transition-all ${
        theme === "dark"
          ? "bg-slate-900/50 border-white/5 text-slate-400"
          : "bg-white/50 border-slate-200 text-slate-500"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-sm font-medium">
          powered by{" "}
          <span
            className={`font-bold ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          >
            Avi Marueli
          </span>
        </p>
      </div>
    </footer>
  );
}
