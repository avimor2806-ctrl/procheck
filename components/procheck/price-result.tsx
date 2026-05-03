"use client";

import { useState } from "react";
import { Copy, FileText, Loader2 } from "lucide-react";
import { calculatePrices } from "@/lib/price-utils";
import type { PriceItem, ThemeType } from "@/lib/types";

interface PriceResultProps {
  theme: ThemeType;
  currentMatch: PriceItem;
  selectedModel: string;
  selectedItemName: string;
  selectedSubItem: string;
  aiSummary: string;
  summaryLoading: boolean;
  onGenerateSummary: () => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
}

export function PriceResult({
  theme,
  currentMatch,
  selectedModel,
  selectedItemName,
  selectedSubItem,
  aiSummary,
  summaryLoading,
  onGenerateSummary,
  showNotification,
}: PriceResultProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const prices = calculatePrices(currentMatch.priceExcl);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    setTilt({
      x: ((clientX - left) / width - 0.5) * 10,
      y: -((clientY - top) / height - 0.5) * 10,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiSummary);
    showNotification("הועתק ללוח");
  };

  return (
    <div
      className="relative group animate-zoom"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transformStyle: "preserve-3d",
        perspective: "1500px",
      }}
    >
      <div
        className={`absolute -inset-1 rounded-[3rem] blur-3xl opacity-25 ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-400"
        }`}
      />
      <div
        className={`relative rounded-[3rem] p-10 md:p-16 border overflow-hidden shadow-2xl transition-all duration-500 ${
          theme === "dark"
            ? "bg-slate-900/95 border-white/10"
            : "bg-white border-slate-200"
        }`}
      >
        <div
          className="flex flex-col items-center text-center space-y-12"
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="space-y-3">
            <span
              className={`inline-block px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-4 ${
                theme === "dark"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "bg-blue-50 text-blue-800 border border-blue-100"
              }`}
            >
              מחיר מעודכן לתאריך {currentMatch.updatedAt 
                ? new Date(currentMatch.updatedAt).toLocaleDateString('he-IL')
                : new Date().toLocaleDateString('he-IL')}
            </span>
            <h3
              className={`text-5xl md:text-7xl font-black leading-tight tracking-tighter ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              {selectedSubItem || selectedItemName}
            </h3>
            <p className="font-bold text-xl uppercase tracking-widest text-slate-500">
              {selectedModel}
            </p>
          </div>

          <div className="w-full grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase">
                {"מחיר ללא מע\"מ"}
              </p>
              <p className="text-4xl font-black">₪{prices.excl}</p>
            </div>
            <div className="space-y-1 border-r border-slate-500/10 pr-8">
              <p className="text-[10px] font-black text-slate-500 uppercase">
                {"מע\"מ (18%)"}
              </p>
              <p className="text-4xl font-black italic text-slate-400">
                ₪{prices.diff}
              </p>
            </div>
          </div>

          <div
            className="w-full p-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] shadow-xl text-white transform transition-transform hover:scale-105"
            style={{ transform: "translateZ(100px)" }}
          >
            <span className="text-white/70 text-xs font-black uppercase block mb-4 tracking-widest">
              {"סה\"כ לתשלום כולל מע\"מ"}
            </span>
            <span className="text-7xl md:text-9xl font-black leading-none tracking-tighter shadow-sm">
              ₪{prices.incl}
            </span>
          </div>

          <button
            onClick={onGenerateSummary}
            disabled={summaryLoading}
            className={`w-full py-6 rounded-2xl font-black text-sm border flex items-center justify-center gap-3 transition-all ${
              theme === "dark"
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                : "bg-slate-50 border-slate-100 hover:bg-slate-100"
            }`}
          >
            {summaryLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5 text-blue-500" />
            )}
            הפק סיכום ללקוח
          </button>

          {aiSummary && (
            <div
              className={`w-full p-8 rounded-3xl border text-right relative ${
                theme === "dark"
                  ? "bg-indigo-950/20 border-indigo-500/30 shadow-inner shadow-black"
                  : "bg-indigo-50 border-indigo-200"
              }`}
            >
              <h4 className="text-sm font-black mb-4 text-indigo-500 uppercase tracking-widest">
                AI סיכום לשליחה:
              </h4>
              <p className="text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {aiSummary}
              </p>
              <button
                onClick={handleCopy}
                className="mt-8 flex items-center gap-2 text-sm font-bold text-indigo-500 underline decoration-indigo-200 underline-offset-4"
              >
                <Copy className="w-4 h-4" /> העתק טקסט לשליחה
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
