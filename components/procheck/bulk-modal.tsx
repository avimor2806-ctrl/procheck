"use client";

import { useMemo } from "react";
import type { ThemeType, PriceItem } from "@/lib/types";
import { DRAWER_TYPES, PAPER_TYPES } from "@/lib/constants";

export interface DrawerPrices {
  dk70: string;
  dk80: string;
  dk100: string;
}

export interface PaperPrices {
  small: string;
  medium: string;
  large: string;
}

interface BulkModalProps {
  theme: ThemeType;
  isOpen: boolean;
  onClose: () => void;
  bulkModels: string[];
  setBulkModels: React.Dispatch<React.SetStateAction<string[]>>;
  customModel: string;
  setCustomModel: (model: string) => void;
  bulkItemName: string;
  setBulkItemName: (name: string) => void;
  customItemName: string;
  setCustomItemName: (name: string) => void;
  bulkPrice: string;
  setBulkPrice: (price: string) => void;
  drawerPrices: DrawerPrices;
  setDrawerPrices: (prices: DrawerPrices) => void;
  paperPrices: PaperPrices;
  setPaperPrices: (prices: PaperPrices) => void;
  allModelsList: string[];
  allItems: PriceItem[];
  dynamicFaultsList: string[];
  dynamicAccessoriesList: string[];
  onSubmit: (e: React.FormEvent) => void;
}

export function BulkModal({
  theme,
  isOpen,
  onClose,
  bulkModels,
  setBulkModels,
  customModel,
  setCustomModel,
  bulkItemName,
  setBulkItemName,
  customItemName,
  setCustomItemName,
  bulkPrice,
  setBulkPrice,
  drawerPrices,
  setDrawerPrices,
  paperPrices,
  setPaperPrices,
  allModelsList,
  allItems,
  dynamicFaultsList,
  dynamicAccessoriesList,
  onSubmit,
}: BulkModalProps) {
  const isDrawerSelected = bulkItemName === "מגירות";
  const isPaperSelected = bulkItemName === "נייר";
  
  // Check for existing assignments - must be before conditional return
  const existingAssignments = useMemo(() => {
    if (bulkModels.length === 0 || !bulkItemName) return {};
    
    const assignments: { [model: string]: { exists: boolean; price: number | null } } = {};
    
    bulkModels.forEach((model) => {
      if (isDrawerSelected) {
        // Check each drawer type
        DRAWER_TYPES.forEach((drawerType) => {
          const existing = allItems.find((i) => i.model === model && i.name === drawerType);
          assignments[`${model}|${drawerType}`] = {
            exists: !!existing,
            price: existing?.priceExcl || null,
          };
        });
      } else if (isPaperSelected) {
        // Check each paper type
        PAPER_TYPES.forEach((paperType) => {
          const existing = allItems.find((i) => i.model === model && i.name === paperType);
          assignments[`${model}|${paperType}`] = {
            exists: !!existing,
            price: existing?.priceExcl || null,
          };
        });
      } else {
        const itemName = bulkItemName === "CUSTOM" ? customItemName.trim() : bulkItemName;
        if (itemName) {
          const existing = allItems.find((i) => i.model === model && i.name === itemName);
          assignments[model] = {
            exists: !!existing,
            price: existing?.priceExcl || null,
          };
        }
      }
    });
    
    return assignments;
  }, [bulkModels, bulkItemName, customItemName, allItems, isDrawerSelected, isPaperSelected]);

  // Count existing vs new
  const existingCount = useMemo(() => {
    return Object.values(existingAssignments).filter((a) => a.exists).length;
  }, [existingAssignments]);

  if (!isOpen) return null;

  const toggleModel = (m: string) => {
    setBulkModels((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade"
        onClick={onClose}
      />
      <div
        className={`rounded-2xl sm:rounded-[3rem] w-full max-w-3xl border relative z-10 p-4 sm:p-6 md:p-10 shadow-2xl animate-zoom max-h-[95vh] overflow-hidden ${
          theme === "dark"
            ? "bg-slate-900 border-white/10 text-white shadow-black"
            : "bg-white border-slate-200"
        }`}
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-4 sm:mb-6 md:mb-10 tracking-tight text-center">
          ניהול מחירון גלובלי
        </h2>

        <form
          onSubmit={onSubmit}
          className="space-y-6 sm:space-y-8 md:space-y-10 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto px-1 sm:pr-4 custom-scrollbar"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">
                1. בחירת דגמים קיימים / הוספת דגם חדש
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBulkModels([...allModelsList])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === "dark"
                      ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  בחר הכל
                </button>
                <button
                  type="button"
                  onClick={() => setBulkModels([])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === "dark"
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  בטל בחירה
                </button>
              </div>
            </div>
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-5 rounded-xl sm:rounded-2xl border max-h-48 sm:max-h-64 overflow-y-auto ${
                theme === "dark"
                  ? "bg-slate-950/60 border-white/5 shadow-inner"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              {allModelsList.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleModel(m)}
                  className={`p-3.5 rounded-xl text-[11px] font-bold border transition-all ${
                    bulkModels.includes(m)
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "opacity-40 hover:opacity-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="שם דגם חדש לגמרי..."
              className={`w-full p-5 border-2 rounded-2xl font-bold outline-none ${
                theme === "dark"
                  ? "bg-slate-950 border-white/5 text-white"
                  : "bg-white border-slate-100"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest block">
                2. בחר תקלה / אביזר
              </label>
              <select
                value={bulkItemName}
                onChange={(e) => setBulkItemName(e.target.value)}
                className={`w-full p-6 border-2 rounded-2xl font-black text-sm outline-none ${
                  theme === "dark" ? "bg-slate-950 border-white/5" : "bg-slate-50"
                }`}
              >
                <option value="">-- בחר פריט --</option>
                <option value="CUSTOM">-- הוסף סוג חדש --</option>
                {dynamicFaultsList.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
                {dynamicAccessoriesList.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {bulkItemName === "CUSTOM" && (
                <input
                  type="text"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="שם חדש..."
                  className="w-full p-5 mt-2 border-2 rounded-2xl font-bold"
                />
              )}
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest block">
                {"3. מחיר (₪ ללא מע\"מ)"}
              </label>
              {isDrawerSelected ? (
                <div className="space-y-4">
                  {DRAWER_TYPES.map((drawerType, index) => {
                    const key = index === 0 ? "dk70" : index === 1 ? "dk80" : "dk100";
                    return (
                      <div key={drawerType} className="flex items-center gap-4">
                        <span className={`text-sm font-bold min-w-[140px] ${
                          theme === "dark" ? "text-slate-300" : "text-slate-700"
                        }`}>
                          {drawerType}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={drawerPrices[key as keyof DrawerPrices]}
                          onChange={(e) => setDrawerPrices({
                            ...drawerPrices,
                            [key]: e.target.value
                          })}
                          placeholder="מחיר"
                          className={`flex-1 p-4 border-2 rounded-xl font-black text-2xl text-center outline-none ${
                            theme === "dark"
                              ? "bg-slate-950 border-white/5 text-blue-500"
                              : "bg-slate-50 border-slate-200 text-blue-700"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : isPaperSelected ? (
                <div className="space-y-4">
                  {PAPER_TYPES.map((paperType, index) => {
                    const key = index === 0 ? "small" : index === 1 ? "medium" : "large";
                    return (
                      <div key={paperType} className="flex items-center gap-4">
                        <span className={`text-sm font-bold min-w-[140px] ${
                          theme === "dark" ? "text-slate-300" : "text-slate-700"
                        }`}>
                          {paperType}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={paperPrices[key as keyof PaperPrices]}
                          onChange={(e) => setPaperPrices({
                            ...paperPrices,
                            [key]: e.target.value
                          })}
                          placeholder="מחיר"
                          className={`flex-1 p-4 border-2 rounded-xl font-black text-2xl text-center outline-none ${
                            theme === "dark"
                              ? "bg-slate-950 border-white/5 text-blue-500"
                              : "bg-slate-50 border-slate-200 text-blue-700"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="number"
                  step="0.01"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  required={!isDrawerSelected && !isPaperSelected}
                  className={`w-full p-6 border-2 rounded-2xl font-black text-4xl text-center outline-none ${
                    theme === "dark"
                      ? "bg-slate-950 border-white/5 text-blue-500"
                      : "bg-slate-50 border-slate-200 text-blue-700"
                  }`}
                />
              )}
            </div>
          </div>

          {/* Existing assignments info */}
          {bulkModels.length > 0 && bulkItemName && existingCount > 0 && (
            <div className={`p-4 rounded-xl border-2 ${
              theme === "dark" 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              <p className="text-sm font-bold text-center">
                {existingCount} שיוכים קיימים יעודכנו (לא ייווצרו כפילויות)
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 sm:py-6 md:py-8 rounded-xl sm:rounded-2xl md:rounded-[2rem] font-black text-base sm:text-xl md:text-2xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:bg-blue-700 active:scale-95 transition-all"
          >
            {existingCount > 0 ? "עדכון שיוכים קיימים" : "שמירת שינויים במערכת"}
          </button>
        </form>
      </div>
    </div>
  );
}
