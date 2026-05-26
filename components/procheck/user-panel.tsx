"use client";

import { useMemo } from "react";
import { ChevronDown, Smartphone, Wifi, Layers, Sparkles, Package } from "lucide-react";
import { DRAWER_TYPES, PAPER_TYPES, GLOBAL_FAULT_LIST, GLOBAL_ACCESSORIES_LIST } from "@/lib/constants";
import type { PriceItem, SelectionType, ThemeType, InventoryFilter } from "@/lib/types";
import { PriceResult } from "./price-result";

interface UserPanelProps {
  theme: ThemeType;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectionType: SelectionType;
  setSelectionType: (type: SelectionType) => void;
  selectedItemName: string;
  setSelectedItemName: (name: string) => void;
  selectedSubItem: string;
  setSelectedSubItem: (item: string) => void;
  allModelsList: string[];
  allItems: PriceItem[];
  dynamicFaultsList: string[];
  dynamicAccessoriesList: string[];
  currentMatch: PriceItem | undefined;
  setAiSummary: (summary: string) => void;
  aiSummary: string;
  summaryLoading: boolean;
  onGenerateSummary: () => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
  // פילטר מלאי - טכנאים עם הרשאה בלבד
  canSeeAdvanced?: boolean;
  inventoryFilter?: InventoryFilter;
  setInventoryFilter?: (filter: InventoryFilter) => void;
}

export function UserPanel({
  theme,
  selectedModel,
  setSelectedModel,
  selectionType,
  setSelectionType,
  selectedItemName,
  setSelectedItemName,
  selectedSubItem,
  setSelectedSubItem,
  allModelsList,
  allItems,
  dynamicFaultsList,
  dynamicAccessoriesList,
  currentMatch,
  setAiSummary,
  aiSummary,
  summaryLoading,
  onGenerateSummary,
  showNotification,
  canSeeAdvanced = false,
  inventoryFilter = "all",
  setInventoryFilter,
}: UserPanelProps) {
  // סינון פריטים לפי הפילטר:
  // - טכנאי ללא הרשאה: תמיד רואה רק רגיל (לא מתקדם)
  // - טכנאי עם הרשאה: לפי הבחירה (all/regular/advanced)
  const filteredByInventory = useMemo(() => {
    if (!canSeeAdvanced) {
      // ללא הרשאה - מסנן רגיל בלבד
      return allItems.filter((i) => !i.isAdvanced);
    }
    if (inventoryFilter === "regular") {
      return allItems.filter((i) => !i.isAdvanced);
    }
    if (inventoryFilter === "advanced") {
      return allItems.filter((i) => i.isAdvanced);
    }
    return allItems; // all
  }, [allItems, canSeeAdvanced, inventoryFilter]);
  // Helper to check if item is a fault
  const isFaultItem = (name: string) => {
    return (
      GLOBAL_FAULT_LIST.includes(name) ||
      name.includes("נזק") ||
      name.includes("שבר") ||
      name.includes("תקלה") ||
      name.includes("החלפ") ||
      name.includes("תיקון")
    );
  };

  // Filter faults based on selected model - show ONLY faults that have prices for this specific model
  const filteredFaultsList = useMemo(() => {
    if (!selectedModel) return [];
    if (!filteredByInventory || filteredByInventory.length === 0) return [];
    
    // Get all items for the selected model that are faults
    const modelFaults = filteredByInventory
      .filter((item) => item.model === selectedModel && isFaultItem(item.name))
      .map((item) => item.name);
    
    // Return unique sorted list - only items with prices for this model
    return [...new Set(modelFaults)].sort();
  }, [selectedModel, filteredByInventory]);

  // Filter accessories based on selected model - show ONLY accessories that have prices for this specific model
  const filteredAccessoriesList = useMemo(() => {
    if (!selectedModel) return [];
    if (!filteredByInventory || filteredByInventory.length === 0) return [];
    
    // Get all items for the selected model that are accessories (not faults)
    const modelAccessories = filteredByInventory
      .filter((item) => item.model === selectedModel && !isFaultItem(item.name))
      .map((item) => item.name);
    
    // Check if any drawer types exist for this model
    const hasDrawers = modelAccessories.some((name) => DRAWER_TYPES.includes(name));
    // Check if any paper types exist for this model
    const hasPaper = modelAccessories.some((name) => PAPER_TYPES.includes(name));
    
    // Filter out individual drawer and paper types and add grouped options
    const accessories = modelAccessories.filter((name) => 
      !DRAWER_TYPES.includes(name) && !PAPER_TYPES.includes(name)
    );
    if (hasDrawers) {
      accessories.push("מגירות");
    }
    if (hasPaper) {
      accessories.push("נייר");
    }
    
    // Return unique sorted list - only items with prices for this model
    return [...new Set(accessories)].sort();
  }, [selectedModel, filteredByInventory]);

  // Filter drawer types based on selected model - show ONLY drawer types with prices for this model
  const filteredDrawerTypes = useMemo(() => {
    if (!selectedModel || !filteredByInventory || filteredByInventory.length === 0) return [];
    
    const filtered = DRAWER_TYPES.filter((drawerType) =>
      filteredByInventory.some((item) => item.model === selectedModel && item.name === drawerType)
    );
    
    return filtered;
  }, [selectedModel, filteredByInventory]);

  // Filter paper types based on selected model - show ONLY paper types with prices for this model
  const filteredPaperTypes = useMemo(() => {
    if (!selectedModel || !filteredByInventory || filteredByInventory.length === 0) return [];
    
    const filtered = PAPER_TYPES.filter((paperType) =>
      filteredByInventory.some((item) => item.model === selectedModel && item.name === paperType)
    );
    
    return filtered;
  }, [selectedModel, filteredByInventory]);

  // סינון רשימת דגמים - להציג רק דגמים שיש להם פריטים זמינים בפילטר הנוכחי
  const visibleModelsList = useMemo(() => {
    // אם אין סינון (all + canSeeAdvanced) - מציג הכל
    if (canSeeAdvanced && inventoryFilter === "all") {
      return allModelsList;
    }
    // אחרת - הצג רק דגמים שיש להם פריטים תואמים לפילטר
    const modelsWithItems = new Set(filteredByInventory.map((i) => i.model));
    return allModelsList.filter((m) => modelsWithItems.has(m));
  }, [allModelsList, filteredByInventory, canSeeAdvanced, inventoryFilter]);
  return (
    <div className="space-y-6 sm:space-y-8 animate-slide">
      {/* Inventory Filter Toggle - מוצג רק לטכנאים עם הרשאה */}
      {canSeeAdvanced && setInventoryFilter && (
        <div
          className={`rounded-2xl sm:rounded-3xl border p-3 sm:p-4 shadow-lg transition-all ${
            theme === "dark"
              ? "bg-slate-800/80 border-white/10 shadow-black/40"
              : "bg-white border-slate-200 shadow-slate-200/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Layers className="w-4 h-4 text-amber-500" />
            <span
              className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              תצוגת מלאי
            </span>
          </div>
          <div
            className={`grid grid-cols-3 gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border ${
              theme === "dark"
                ? "bg-slate-900 border-white/5"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <button
              onClick={() => {
                setInventoryFilter("all");
                setSelectedModel("");
                setSelectedItemName("");
                setSelectedSubItem("");
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-3 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm transition-all ${
                inventoryFilter === "all"
                  ? "bg-blue-600 text-white shadow-md"
                  : theme === "dark"
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>הכל</span>
            </button>
            <button
              onClick={() => {
                setInventoryFilter("regular");
                setSelectedModel("");
                setSelectedItemName("");
                setSelectedSubItem("");
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-3 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm transition-all ${
                inventoryFilter === "regular"
                  ? "bg-blue-600 text-white shadow-md"
                  : theme === "dark"
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>רגיל</span>
            </button>
            <button
              onClick={() => {
                setInventoryFilter("advanced");
                setSelectedModel("");
                setSelectedItemName("");
                setSelectedSubItem("");
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-3 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm transition-all ${
                inventoryFilter === "advanced"
                  ? "bg-amber-500 text-white shadow-md"
                  : theme === "dark"
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>מתקדם</span>
            </button>
          </div>
          {inventoryFilter === "advanced" && (
            <p className="text-[10px] sm:text-xs text-amber-500 mt-2 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              מציג רק פריטי מלאי מתקדם
            </p>
          )}
        </div>
      )}

      {/* Selection Panel */}
      <div
        className={`rounded-3xl sm:rounded-[2.5rem] border p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 shadow-xl transition-all ${
          theme === "dark"
            ? "bg-slate-800/80 border-white/10 shadow-black/40"
            : "bg-white border-slate-200 shadow-slate-200/50"
        }`}
      >
        <div className="space-y-3 sm:space-y-4">
          <label className="text-[10px] sm:text-[11px] font-black uppercase text-blue-500 tracking-widest px-1">
            01. בחר דגם מכשיר / קופה
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              {selectedModel.includes("נתב") ? (
                <Wifi className="w-5 h-5 text-blue-500" />
              ) : (
                <Smartphone className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setSelectedItemName("");
                setSelectedSubItem("");
                setAiSummary("");
              }}
              className={`w-full border-2 rounded-2xl px-12 sm:px-14 py-4 sm:py-5 md:py-6 appearance-none outline-none font-bold text-base sm:text-lg ${
                theme === "dark"
                  ? "bg-slate-900 border-white/5 text-white focus:border-blue-500"
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-600"
              }`}
            >
              <option value="">
                {visibleModelsList.length === 0 ? "-- אין דגמים זמינים בתצוגה זו --" : "-- בחר דגם --"}
              </option>
              {visibleModelsList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <div
          className={`space-y-6 transition-all duration-500 ${
            !selectedModel
              ? "opacity-25 grayscale pointer-events-none"
              : "opacity-100"
          }`}
        >
          <div
            className={`flex p-1.5 rounded-2xl border ${
              theme === "dark"
                ? "bg-slate-900 border-white/5"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <button
              onClick={() => {
                setSelectionType("fault");
                setSelectedItemName("");
              }}
              className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${
                selectionType === "fault"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-500"
              }`}
            >
              דיווח תקלה
            </button>
            <button
              onClick={() => {
                setSelectionType("accessory");
                setSelectedItemName("");
              }}
              className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${
                selectionType === "accessory"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-500"
              }`}
            >
              אביזר נלווה
            </button>
          </div>

          <select
            value={selectedItemName}
            onChange={(e) => {
              setSelectedItemName(e.target.value);
              setSelectedSubItem("");
            }}
            disabled={selectionType === "fault" ? filteredFaultsList.length === 0 : filteredAccessoriesList.length === 0}
            className={`w-full border-2 rounded-2xl px-14 py-5 md:py-6 appearance-none outline-none font-bold text-lg ${
              theme === "dark"
                ? "bg-slate-900 border-white/5 text-white focus:border-blue-500"
                : "bg-white border-slate-200 text-slate-900 focus:border-blue-600"
            } ${(selectionType === "fault" ? filteredFaultsList.length === 0 : filteredAccessoriesList.length === 0) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <option value="">
              {selectionType === "fault" 
                ? (filteredFaultsList.length === 0 ? "-- אין תקלות משויכות לדגם זה --" : "-- בחר תקלה --")
                : (filteredAccessoriesList.length === 0 ? "-- אין אביזרים משויכים לדגם זה --" : "-- בחר אביזר --")
              }
            </option>
            {selectionType === "fault"
              ? filteredFaultsList.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))
              : filteredAccessoriesList.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
          </select>

          {selectionType === "accessory" && selectedItemName === "מגירות" && filteredDrawerTypes.length > 0 && (
            <div className={`grid gap-3 animate-zoom ${
              filteredDrawerTypes.length === 1 
                ? "grid-cols-1" 
                : filteredDrawerTypes.length === 2 
                ? "grid-cols-1 md:grid-cols-2" 
                : "grid-cols-1 md:grid-cols-3"
            }`}>
              {filteredDrawerTypes.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedSubItem(d)}
                  className={`p-5 rounded-2xl border-2 font-bold text-sm transition-all ${
                    selectedSubItem === d
                      ? "bg-blue-600 border-blue-600 text-white shadow-xl scale-105"
                      : theme === "dark"
                      ? "bg-slate-900 border-white/10 text-slate-300"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {selectionType === "accessory" && selectedItemName === "נייר" && filteredPaperTypes.length > 0 && (
            <div className={`grid gap-3 animate-zoom ${
              filteredPaperTypes.length === 1 
                ? "grid-cols-1" 
                : filteredPaperTypes.length === 2 
                ? "grid-cols-1 md:grid-cols-2" 
                : "grid-cols-1 md:grid-cols-3"
            }`}>
              {filteredPaperTypes.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedSubItem(p)}
                  className={`p-5 rounded-2xl border-2 font-bold text-sm transition-all ${
                    selectedSubItem === p
                      ? "bg-blue-600 border-blue-600 text-white shadow-xl scale-105"
                      : theme === "dark"
                      ? "bg-slate-900 border-white/10 text-slate-300"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {currentMatch && (
        <PriceResult
          theme={theme}
          currentMatch={currentMatch}
          selectedModel={selectedModel}
          selectedItemName={selectedItemName}
          selectedSubItem={selectedSubItem}
          aiSummary={aiSummary}
          summaryLoading={summaryLoading}
          onGenerateSummary={onGenerateSummary}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}
