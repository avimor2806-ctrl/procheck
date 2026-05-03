"use client";

import { useMemo } from "react";
import { ChevronDown, Smartphone, Wifi } from "lucide-react";
import { DRAWER_TYPES, PAPER_TYPES, GLOBAL_FAULT_LIST, GLOBAL_ACCESSORIES_LIST } from "@/lib/constants";
import type { PriceItem, SelectionType, ThemeType } from "@/lib/types";
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
}: UserPanelProps) {
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
    if (!allItems || allItems.length === 0) return [];
    
    // Get all items for the selected model that are faults
    const modelFaults = allItems
      .filter((item) => item.model === selectedModel && isFaultItem(item.name))
      .map((item) => item.name);
    
    // Return unique sorted list - only items with prices for this model
    return [...new Set(modelFaults)].sort();
  }, [selectedModel, allItems]);

  // Filter accessories based on selected model - show ONLY accessories that have prices for this specific model
  const filteredAccessoriesList = useMemo(() => {
    if (!selectedModel) return [];
    if (!allItems || allItems.length === 0) return [];
    
    // Get all items for the selected model that are accessories (not faults)
    const modelAccessories = allItems
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
  }, [selectedModel, allItems]);

  // Filter drawer types based on selected model - show ONLY drawer types with prices for this model
  const filteredDrawerTypes = useMemo(() => {
    if (!selectedModel || !allItems || allItems.length === 0) return [];
    
    const filtered = DRAWER_TYPES.filter((drawerType) =>
      allItems.some((item) => item.model === selectedModel && item.name === drawerType)
    );
    
    return filtered;
  }, [selectedModel, allItems]);

  // Filter paper types based on selected model - show ONLY paper types with prices for this model
  const filteredPaperTypes = useMemo(() => {
    if (!selectedModel || !allItems || allItems.length === 0) return [];
    
    const filtered = PAPER_TYPES.filter((paperType) =>
      allItems.some((item) => item.model === selectedModel && item.name === paperType)
    );
    
    return filtered;
  }, [selectedModel, allItems]);
  return (
    <div className="space-y-8 animate-slide">
      {/* Selection Panel */}
      <div
        className={`rounded-[2.5rem] border p-6 md:p-10 space-y-8 shadow-xl transition-all ${
          theme === "dark"
            ? "bg-slate-800/80 border-white/10 shadow-black/40"
            : "bg-white border-slate-200 shadow-slate-200/50"
        }`}
      >
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase text-blue-500 tracking-widest px-1">
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
              className={`w-full border-2 rounded-2xl px-14 py-5 md:py-6 appearance-none outline-none font-bold text-lg ${
                theme === "dark"
                  ? "bg-slate-900 border-white/5 text-white focus:border-blue-500"
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-600"
              }`}
            >
              <option value="">-- בחר דגם --</option>
              {allModelsList.map((m) => (
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
