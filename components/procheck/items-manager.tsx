"use client";

import { useState, useMemo } from "react";
import { Plus, X, Trash2, Tag, Wrench, Smartphone, Pencil, Check, Search } from "lucide-react";
import type { ThemeType } from "@/lib/types";
import { DEFAULT_MODELS, GLOBAL_FAULT_LIST, GLOBAL_ACCESSORIES_LIST } from "@/lib/constants";

interface ItemsManagerProps {
  theme: ThemeType;
  isOpen: boolean;
  onClose: () => void;
  customFaults: string[];
  customAccessories: string[];
  customModels: string[];
  removedDefaults: { models: string[]; faults: string[]; accessories: string[] };
  editedDefaults: { [key: string]: string };
  onAddFault: (name: string) => void;
  onRemoveFault: (name: string) => void;
  onAddAccessory: (name: string) => void;
  onRemoveAccessory: (name: string) => void;
  onAddModel: (name: string) => void;
  onRemoveModel: (name: string) => void;
  onEditModel: (oldName: string, newName: string) => void;
  onRemoveDefaultItem: (name: string, type: "model" | "fault" | "accessory") => void;
  onEditDefaultItem: (oldName: string, newName: string, type: "model" | "fault" | "accessory") => void;
  onRestoreDefaultItem: (name: string, type: "model" | "fault" | "accessory") => void;
}

export function ItemsManager({
  theme,
  isOpen,
  onClose,
  customFaults,
  customAccessories,
  customModels,
  removedDefaults,
  editedDefaults,
  onAddFault,
  onRemoveFault,
  onAddAccessory,
  onRemoveAccessory,
  onAddModel,
  onRemoveModel,
  onEditModel,
  onRemoveDefaultItem,
  onEditDefaultItem,
  onRestoreDefaultItem,
}: ItemsManagerProps) {
  const [activeTab, setActiveTab] = useState<"models" | "faults" | "accessories">("models");
  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Get display name (considering edits)
  const getDisplayName = (originalName: string) => {
    return editedDefaults[originalName] || originalName;
  };

  // Get combined lists (default + custom, minus removed)
  const getFilteredDefaults = (defaults: string[], removedList: string[]) => {
    return defaults.filter(item => !removedList.includes(item));
  };

  const activeDefaultModels = getFilteredDefaults(DEFAULT_MODELS, removedDefaults.models);
  const activeDefaultFaults = getFilteredDefaults(GLOBAL_FAULT_LIST, removedDefaults.faults);
  const activeDefaultAccessories = getFilteredDefaults(GLOBAL_ACCESSORIES_LIST, removedDefaults.accessories);

  const allModels = [...new Set([...activeDefaultModels.map(getDisplayName), ...customModels])].sort();
  const allFaults = [...new Set([...activeDefaultFaults.map(getDisplayName), ...customFaults])].sort();
  const allAccessories = [...new Set([...activeDefaultAccessories.map(getDisplayName), ...customAccessories])].sort();

  const currentList = activeTab === "faults" 
    ? allFaults 
    : activeTab === "accessories" 
    ? allAccessories 
    : allModels;

  // Filter list based on search query - MUST be before any conditional returns
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const query = searchQuery.trim().toLowerCase();
    return currentList.filter(item => item.toLowerCase().includes(query));
  }, [currentList, searchQuery]);

  const currentRemovedDefaults = activeTab === "faults"
    ? removedDefaults.faults
    : activeTab === "accessories"
    ? removedDefaults.accessories
    : removedDefaults.models;

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newItemName.trim()) return;
    
    if (activeTab === "faults") {
      onAddFault(newItemName.trim());
    } else if (activeTab === "accessories") {
      onAddAccessory(newItemName.trim());
    } else {
      onAddModel(newItemName.trim());
    }
    setNewItemName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleStartEdit = (item: string) => {
    setEditingItem(item);
    setEditValue(item);
  };

  const handleSaveEdit = (isDefault: boolean, originalName?: string) => {
    if (editingItem && editValue.trim() && editValue !== editingItem) {
      if (isDefault) {
        const type = activeTab === "faults" ? "fault" : activeTab === "accessories" ? "accessory" : "model";
        onEditDefaultItem(originalName || editingItem, editValue.trim(), type);
      } else {
        if (activeTab === "models") {
          onEditModel(editingItem, editValue.trim());
        }
      }
    }
    setEditingItem(null);
    setEditValue("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, isDefault: boolean, originalName?: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit(isDefault, originalName);
    } else if (e.key === "Escape") {
      setEditingItem(null);
      setEditValue("");
    }
  };

  const handleRemove = (item: string, isDefault: boolean, originalName?: string) => {
    if (isDefault) {
      const type = activeTab === "faults" ? "fault" : activeTab === "accessories" ? "accessory" : "model";
      onRemoveDefaultItem(originalName || item, type);
    } else {
      if (activeTab === "faults") {
        onRemoveFault(item);
      } else if (activeTab === "accessories") {
        onRemoveAccessory(item);
      } else {
        onRemoveModel(item);
      }
    }
  };

  const isCustomItem = (item: string) => {
    if (activeTab === "faults") {
      return customFaults.includes(item);
    } else if (activeTab === "accessories") {
      return customAccessories.includes(item);
    } else {
      return customModels.includes(item);
    }
  };

  const getOriginalName = (displayName: string) => {
    const entry = Object.entries(editedDefaults).find(([, edited]) => edited === displayName);
    return entry ? entry[0] : displayName;
  };

  const isDefaultItem = (item: string) => {
    const originalName = getOriginalName(item);
    if (activeTab === "faults") {
      return GLOBAL_FAULT_LIST.includes(originalName) && !removedDefaults.faults.includes(originalName);
    } else if (activeTab === "accessories") {
      return GLOBAL_ACCESSORIES_LIST.includes(originalName) && !removedDefaults.accessories.includes(originalName);
    } else {
      return DEFAULT_MODELS.includes(originalName) && !removedDefaults.models.includes(originalName);
    }
  };

  const isEditedDefault = (item: string) => {
    const originalName = getOriginalName(item);
    return editedDefaults[originalName] !== undefined;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl animate-zoom overflow-hidden max-h-[95vh] ${
          theme === "dark" ? "bg-slate-900" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-6 border-b ${
            theme === "dark" ? "border-white/10" : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-xl font-black ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              ניהול פריטים
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                theme === "dark"
                  ? "hover:bg-white/10 text-slate-400"
                  : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("models")}
              className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "models"
                  ? "bg-blue-500 text-white"
                  : theme === "dark"
                  ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>דגמים</span>
              <span className="text-xs opacity-70">({allModels.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("faults")}
              className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "faults"
                  ? "bg-orange-500 text-white"
                  : theme === "dark"
                  ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>תקלות</span>
              <span className="text-xs opacity-70">({allFaults.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("accessories")}
              className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "accessories"
                  ? "bg-green-500 text-white"
                  : theme === "dark"
                  ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>אביזרים</span>
              <span className="text-xs opacity-70">({allAccessories.length})</span>
            </button>
          </div>
        </div>

        {/* Search and Add */}
        <div
          className={`p-4 border-b space-y-3 ${
            theme === "dark" ? "border-white/10" : "border-slate-200"
          }`}
        >
          {/* Search input */}
          <div className="relative">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              theme === "dark" ? "text-slate-500" : "text-slate-400"
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש..."
              className={`w-full p-3 pr-10 rounded-xl border-2 outline-none font-medium ${
                theme === "dark"
                  ? "bg-slate-800 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                  theme === "dark" ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-200 text-slate-500"
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Add new item */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeTab === "faults" 
                  ? "שם תקלה חדשה..." 
                  : activeTab === "accessories"
                  ? "שם אביזר חדש..."
                  : "שם דגם חדש..."
              }
              className={`flex-1 p-3 rounded-xl border-2 outline-none font-medium ${
                theme === "dark"
                  ? "bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
              }`}
            />
            <button
              onClick={handleAdd}
              disabled={!newItemName.trim()}
              className={`px-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
                newItemName.trim()
                  ? activeTab === "faults"
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : activeTab === "accessories"
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                  : theme === "dark"
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Plus className="w-5 h-5" />
              הוסף
            </button>
          </div>
        </div>

        {/* Items list */}
        <div
          className={`p-4 max-h-[250px] overflow-y-auto custom-scrollbar ${
            theme === "dark" ? "bg-slate-900/50" : "bg-slate-50/50"
          }`}
        >
          {filteredList.length === 0 ? (
            <div
              className={`text-center py-8 ${
                theme === "dark" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              <p className="font-medium">
                {searchQuery 
                  ? "לא נמצאו תוצאות"
                  : activeTab === "faults"
                  ? "אין תקלות"
                  : activeTab === "accessories"
                  ? "אין אביזרים"
                  : "אין דגמים"}
              </p>
              <p className="text-sm mt-1">
                {searchQuery ? "נסה חיפוש אחר" : "הוסף פריטים חדשים למעלה"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredList.map((item) => {
                const originalName = getOriginalName(item);
                const isDefault = isDefaultItem(item);
                const isCustom = isCustomItem(item);
                const isEdited = isEditedDefault(item);

                return (
                  <div
                    key={item}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      theme === "dark"
                        ? "bg-slate-800 hover:bg-slate-750"
                        : "bg-white hover:bg-slate-50 border border-slate-200"
                    }`}
                  >
                    {editingItem === item ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, isDefault, originalName)}
                          autoFocus
                          className={`flex-1 p-2 rounded-lg border outline-none font-medium ${
                            theme === "dark"
                              ? "bg-slate-900 border-blue-500 text-white"
                              : "bg-white border-blue-500 text-slate-900"
                          }`}
                        />
                        <button
                          onClick={() => handleSaveEdit(isDefault, originalName)}
                          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-medium ${
                              theme === "dark" ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {item}
                          </span>
                          {isDefault && !isEdited && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                theme === "dark"
                                  ? "bg-slate-700 text-slate-400"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              ברירת מחדל
                            </span>
                          )}
                          {isEdited && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400`}
                            >
                              נערך
                            </span>
                          )}
                          {isCustom && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                activeTab === "faults"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : activeTab === "accessories"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              מותאם אישית
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === "dark"
                                ? "hover:bg-blue-500/20 text-blue-400"
                                : "hover:bg-blue-50 text-blue-500"
                            }`}
                            title="ערוך"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(item, isDefault, originalName)}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === "dark"
                                ? "hover:bg-red-500/20 text-red-400"
                                : "hover:bg-red-50 text-red-500"
                            }`}
                            title="הסר"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Removed defaults section */}
        {currentRemovedDefaults.length > 0 && (
          <div
            className={`p-4 border-t ${
              theme === "dark" ? "border-white/10" : "border-slate-200"
            }`}
          >
            <p className={`text-xs font-bold mb-2 ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}>
              פריטים מוסרים (לחץ לשחזור):
            </p>
            <div className="flex flex-wrap gap-2">
              {currentRemovedDefaults.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    const type = activeTab === "faults" ? "fault" : activeTab === "accessories" ? "accessory" : "model";
                    onRestoreDefaultItem(item, type);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  }`}
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <div
          className={`p-4 border-t text-center ${
            theme === "dark"
              ? "border-white/10 text-slate-500"
              : "border-slate-200 text-slate-400"
          }`}
        >
          <p className="text-xs">
            ניתן לערוך ולהסיר את כל הפריטים. פריטים מוסרים ניתנים לשחזור.
          </p>
        </div>
      </div>
    </div>
  );
}
