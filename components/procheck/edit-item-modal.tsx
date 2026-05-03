"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import type { ThemeType, PriceItem } from "@/lib/types";

interface EditItemModalProps {
  theme: ThemeType;
  isOpen: boolean;
  onClose: () => void;
  item: PriceItem | null;
  onSave: (id: string, newName: string, newPrice: number) => void;
}

export function EditItemModal({
  theme,
  isOpen,
  onClose,
  item,
  onSave,
}: EditItemModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.priceExcl.toString());
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    onSave(item.id, name.trim(), parseFloat(price));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade"
        onClick={onClose}
      />
      <div
        className={`rounded-2xl sm:rounded-3xl w-full max-w-md border relative z-10 p-4 sm:p-6 md:p-8 shadow-2xl animate-zoom ${
          theme === "dark"
            ? "bg-slate-900 border-white/10 text-white shadow-black"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black">עריכת פריט</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              theme === "dark" ? "hover:bg-white/10" : "hover:bg-slate-100"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              דגם
            </label>
            <div
              className={`p-4 rounded-xl border ${
                theme === "dark"
                  ? "bg-slate-800 border-white/10 text-slate-300"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              {item.model}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              שם הפריט
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-4 rounded-xl border-2 font-bold outline-none transition-all ${
                theme === "dark"
                  ? "bg-slate-950 border-white/10 text-white focus:border-blue-500/50"
                  : "bg-slate-50 border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {"מחיר (₪ ללא מע\"מ)"}
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`w-full p-4 rounded-xl border-2 font-black text-2xl text-center outline-none transition-all ${
                theme === "dark"
                  ? "bg-slate-950 border-white/10 text-blue-500 focus:border-blue-500/50"
                  : "bg-slate-50 border-slate-200 text-blue-700 focus:border-blue-500"
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-xl hover:bg-blue-700 transition-all"
          >
            <Save className="w-5 h-5" />
            שמור שינויים
          </button>
        </form>
      </div>
    </div>
  );
}
