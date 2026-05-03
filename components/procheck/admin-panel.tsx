"use client";

import { useState } from "react";
import { Database, Trash2, Settings, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import type { GroupedByName, ThemeType, PriceItem } from "@/lib/types";

interface AdminPanelProps {
  theme: ThemeType;
  groupedByName: GroupedByName[];
  allItems: PriceItem[];
  onOpenBulkModal: () => void;
  onOpenItemsManager: () => void;
  onDeleteGroup: (ids: string[]) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: PriceItem) => void;
}

export function AdminPanel({
  theme,
  groupedByName,
  allItems,
  onOpenBulkModal,
  onOpenItemsManager,
  onDeleteGroup,
  onDeleteItem,
  onEditItem,
}: AdminPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const getUniqueModelsCount = (group: GroupedByName) => {
    return new Set(group.items.map((item) => item.model)).size;
  };

  const getPriceRange = (group: GroupedByName) => {
    const prices = group.items.map((item) => item.priceExcl);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `₪${min.toLocaleString()}`;
    return `₪${min.toLocaleString()} - ₪${max.toLocaleString()}`;
  };

  const getLatestUpdateDate = (group: GroupedByName) => {
    const dates = group.items
      .filter((item) => item.updatedAt)
      .map((item) => new Date(item.updatedAt!).getTime());
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates));
  };

  // Sort groups by latest update date (newest first)
  const sortedGroups = [...groupedByName].sort((a, b) => {
    const dateA = getLatestUpdateDate(a);
    const dateB = getLatestUpdateDate(b);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.getTime() - dateA.getTime();
  });
  return (
    <div className="space-y-8 animate-fade">
      <div
        className={`p-8 md:p-12 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
          theme === "dark"
            ? "bg-slate-900 border-white/10 shadow-black/50"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div>
            <h2
              className={`text-3xl font-black flex items-center gap-4 ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              <Database className="w-8 h-8 text-blue-500" /> ניהול המחירון
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-2">
              {"סה\"כ אביזרים/תקלות:"} {groupedByName.length}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={onOpenItemsManager}
              className={`flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-105 ${
                theme === "dark"
                  ? "bg-slate-800 text-white hover:bg-slate-700 border border-white/10"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300"
              }`}
            >
              <Settings className="w-5 h-5" />
              ניהול פריטים
            </button>
            <button
              onClick={onOpenBulkModal}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all hover:scale-105"
            >
              עדכון קבוצתי
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
          {sortedGroups.map((group, idx) => {
            const groupKey = group.name;
            const isExpanded = expandedGroups.has(groupKey);
            const allIds = group.items.map((item) => item.id);
            const latestUpdate = getLatestUpdateDate(group);

            return (
              <div
                key={idx}
                className={`rounded-3xl border transition-all overflow-hidden ${
                  theme === "dark"
                    ? "bg-slate-800/40 border-white/5 hover:border-blue-500/40"
                    : "bg-slate-50 border-slate-200 hover:border-blue-500 shadow-sm"
                }`}
              >
                {/* Group Header */}
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest border-b border-blue-500/20 pb-1 mb-2 inline-block">
                        {group.name}
                      </span>
                      <div className="text-2xl sm:text-3xl font-black tracking-tighter">
                        {getPriceRange(group)}
                      </div>
                      <div className="mt-4 flex items-center gap-4 flex-wrap">
                        <span className="text-xs text-slate-500">
                          {getUniqueModelsCount(group)} דגמים משויכים
                        </span>
                        {latestUpdate && (
                          <span className={`text-xs px-2 py-1 rounded-lg ${
                            theme === "dark" 
                              ? "bg-green-500/10 text-green-400" 
                              : "bg-green-50 text-green-600"
                          }`}>
                            עדכון אחרון: {latestUpdate.toLocaleDateString('he-IL')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className={`p-3 rounded-xl transition-colors ${
                          theme === "dark"
                            ? "hover:bg-white/10 text-slate-400"
                            : "hover:bg-slate-200 text-slate-600"
                        }`}
                        title={isExpanded ? "סגור" : "הרחב לעריכה"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteGroup(allIds)}
                        className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="מחק את כל המחירים לפריט זה"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Items - Shows each model with its price */}
                {isExpanded && (
                  <div
                    className={`border-t ${
                      theme === "dark" ? "border-white/5" : "border-slate-200"
                    }`}
                  >
                    <div className="p-4 sm:p-6 space-y-3">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                        מחירים לפי דגם ({group.items.length})
                      </div>
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                            theme === "dark"
                              ? "bg-slate-900/50 hover:bg-slate-900"
                              : "bg-white hover:bg-slate-100 border border-slate-100"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                  theme === "dark"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {item.model}
                              </span>
                              <span className="text-lg font-black text-blue-500">
                                ₪{item.priceExcl.toLocaleString()}
                              </span>
                              {item.updatedAt && (
                                <span
                                  className={`text-[10px] font-medium ${
                                    theme === "dark" ? "text-slate-500" : "text-slate-400"
                                  }`}
                                >
                                  עודכן: {new Date(item.updatedAt).toLocaleDateString('he-IL')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEditItem(item)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === "dark"
                                  ? "hover:bg-white/10 text-slate-400 hover:text-blue-400"
                                  : "hover:bg-slate-200 text-slate-500 hover:text-blue-600"
                              }`}
                              title="ערוך מחיר"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="מחק"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
