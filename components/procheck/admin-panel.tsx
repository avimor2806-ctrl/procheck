"use client";

import { useState } from "react";
import { Database, Trash2, Settings, Pencil, ChevronDown, ChevronUp, Users, Sparkles, UserCog } from "lucide-react";
import type { GroupedByName, ThemeType, PriceItem } from "@/lib/types";

interface AdminPanelProps {
  theme: ThemeType;
  groupedByName: GroupedByName[];
  allItems: PriceItem[];
  onOpenBulkModal: () => void;
  onOpenItemsManager: () => void;
  onOpenTechniciansManager?: () => void;
  onOpenUsersManager?: () => void;
  onDeleteGroup: (ids: string[]) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: PriceItem) => void;
  onToggleAdvancedItem?: (id: string, value: boolean) => void;
  canManageTechs?: boolean;
  canManageUsers?: boolean;
}

export function AdminPanel({
  theme,
  groupedByName,
  allItems,
  onOpenBulkModal,
  onOpenItemsManager,
  onOpenTechniciansManager,
  onOpenUsersManager,
  onDeleteGroup,
  onDeleteItem,
  onEditItem,
  onToggleAdvancedItem,
  canManageTechs = false,
  canManageUsers = false,
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
        className={`p-4 sm:p-8 md:p-12 rounded-3xl sm:rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
          theme === "dark"
            ? "bg-slate-900 border-white/10 shadow-black/50"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-8 mb-6 md:mb-12">
          <div className="w-full md:w-auto">
            <h2
              className={`text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-3 md:gap-4 ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              <Database className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-500 flex-shrink-0" />
              <span className="truncate">ניהול המחירון</span>
            </h2>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-1 sm:mt-2">
              {"סה\"כ אביזרים/תקלות:"} {groupedByName.length}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
            {canManageUsers && onOpenUsersManager && (
              <button
                onClick={onOpenUsersManager}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all hover:scale-105 ${
                  theme === "dark"
                    ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                }`}
              >
                <UserCog className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">משתמשים</span>
              </button>
            )}
            {canManageTechs && onOpenTechniciansManager && (
              <button
                onClick={onOpenTechniciansManager}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all hover:scale-105 ${
                  theme === "dark"
                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">טכנאים</span>
              </button>
            )}
            <button
              onClick={onOpenItemsManager}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all hover:scale-105 ${
                theme === "dark"
                  ? "bg-slate-800 text-white hover:bg-slate-700 border border-white/10"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300"
              }`}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">ניהול פריטים</span>
            </button>
            <button
              onClick={onOpenBulkModal}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-3 sm:px-8 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl hover:bg-blue-700 transition-all hover:scale-105"
            >
              עדכון קבוצתי
            </button>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 sm:pr-4">
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
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest border-b border-blue-500/20 pb-1 mb-2 inline-block break-words">
                        {group.name}
                      </span>
                      <div className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter break-words">
                        {getPriceRange(group)}
                      </div>
                      <div className="mt-2 sm:mt-4 flex items-center gap-2 sm:gap-4 flex-wrap">
                        <span className="text-[10px] sm:text-xs text-slate-500">
                          {getUniqueModelsCount(group)} דגמים משויכים
                        </span>
                        {latestUpdate && (
                          <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-lg ${
                            theme === "dark" 
                              ? "bg-green-500/10 text-green-400" 
                              : "bg-green-50 text-green-600"
                          }`}>
                            עדכון אחרון: {latestUpdate.toLocaleDateString('he-IL')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className={`p-2 sm:p-3 rounded-xl transition-colors ${
                          theme === "dark"
                            ? "hover:bg-white/10 text-slate-400"
                            : "hover:bg-slate-200 text-slate-600"
                        }`}
                        title={isExpanded ? "סגור" : "הרחב לעריכה"}
                        aria-label={isExpanded ? "סגור" : "הרחב לעריכה"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteGroup(allIds)}
                        className="p-2 sm:p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="מחק את כל המחירים לפריט זה"
                        aria-label="מחק קבוצה"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3">
                      <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 sm:mb-4">
                        מחירים לפי דגם ({group.items.length})
                      </div>
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl transition-all ${
                            theme === "dark"
                              ? "bg-slate-900/50 hover:bg-slate-900"
                              : "bg-white hover:bg-slate-100 border border-slate-100"
                          } ${
                            item.isAdvanced
                              ? theme === "dark"
                                ? "ring-1 ring-amber-500/40"
                                : "ring-1 ring-amber-400/60"
                              : ""
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <span
                                className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold break-all ${
                                  theme === "dark"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {item.model}
                              </span>
                              <span className="text-base sm:text-lg font-black text-blue-500">
                                ₪{item.priceExcl.toLocaleString()}
                              </span>
                              {item.isAdvanced && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black bg-amber-500/20 text-amber-500 whitespace-nowrap">
                                  <Sparkles className="w-3 h-3" />
                                  מתקדם
                                </span>
                              )}
                              {item.updatedAt && (
                                <span
                                  className={`text-[9px] sm:text-[10px] font-medium hidden sm:inline ${
                                    theme === "dark" ? "text-slate-500" : "text-slate-400"
                                  }`}
                                >
                                  עודכן: {new Date(item.updatedAt).toLocaleDateString('he-IL')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {onToggleAdvancedItem && (
                              <button
                                role="switch"
                                aria-checked={!!item.isAdvanced}
                                aria-label={
                                  item.isAdvanced
                                    ? "הסר תיוג מלאי מתקדם"
                                    : "סמן כמלאי מתקדם"
                                }
                                onClick={() =>
                                  onToggleAdvancedItem(item.id, !item.isAdvanced)
                                }
                                title={
                                  item.isAdvanced
                                    ? "הסר תיוג מלאי מתקדם"
                                    : "סמן כמלאי מתקדם"
                                }
                                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                                  item.isAdvanced
                                    ? "bg-amber-500"
                                    : theme === "dark"
                                    ? "bg-slate-700"
                                    : "bg-slate-300"
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                                    item.isAdvanced ? "right-0.5" : "right-5"
                                  }`}
                                />
                              </button>
                            )}
                            <button
                              onClick={() => onEditItem(item)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === "dark"
                                  ? "hover:bg-white/10 text-slate-400 hover:text-blue-400"
                                  : "hover:bg-slate-200 text-slate-500 hover:text-blue-600"
                              }`}
                              title="ערוך מחיר"
                              aria-label="ערוך מחיר"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="מחק"
                              aria-label="מחק פריט"
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
