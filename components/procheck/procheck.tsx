"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { collection, onSnapshot, doc, writeBatch, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import {
  GLOBAL_FAULT_LIST,
  GLOBAL_ACCESSORIES_LIST,
  DRAWER_TYPES,
  PAPER_TYPES,
  DEFAULT_MODELS,
} from "@/lib/constants";
import type {
  PriceItem,
  GroupedItem,
  GroupedByName,
  ViewType,
  SelectionType,
  ThemeType,
  Technician,
  InventoryFilter,
  Notification as NotificationType,
} from "@/lib/types";
import { Header } from "./header";
import { Footer } from "./footer";
import { UserPanel } from "./user-panel";
import { AdminPanel } from "./admin-panel";
import { AdminAuth } from "./admin-auth";
import { ProfileModal } from "./profile-modal";
import { UsersManager } from "./users-manager";
import { AIModal } from "./ai-modal";
import { BulkModal } from "./bulk-modal";
import { ItemsManager } from "./items-manager";
import { TechniciansManager } from "./technicians-manager";
import { EditItemModal } from "./edit-item-modal";
import { Notification } from "./notification";
import {
  loadSession,
  clearSession,
  canViewAdmin,
  canManageTechnicians,
  canManageUsers,
  canAccessAdvancedInventory,
  renamePasswordRecord,
  ROLE_LABELS,
  type SessionUser,
} from "@/lib/users";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyBX4IqtkEOIS1AL8_Y6cabP7gkYEVAI4sE";

export function ProCheck() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [view, setView] = useState<ViewType>("user");
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUsersManagerOpen, setIsUsersManagerOpen] = useState(false);
  const isAdminAuthenticated = currentUser !== null && canViewAdmin(currentUser.role);

  const [selectedModel, setSelectedModel] = useState("");
  const [selectionType, setSelectionType] = useState<SelectionType>("fault");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedSubItem, setSelectedSubItem] = useState("");

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationType | null>(null);

  const [bulkModels, setBulkModels] = useState<string[]>([]);
  const [customModel, setCustomModel] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkItemName, setBulkItemName] = useState("");
  const [customItemName, setCustomItemName] = useState("");
  const [drawerPrices, setDrawerPrices] = useState({ dk70: "", dk80: "", dk100: "" });
  const [paperPrices, setPaperPrices] = useState({ small: "", medium: "", large: "" });
  const [isItemsManagerOpen, setIsItemsManagerOpen] = useState(false);
  const [customFaults, setCustomFaults] = useState<string[]>([]);
  const [customAccessories, setCustomAccessories] = useState<string[]>([]);
  const [customModels, setCustomModels] = useState<string[]>([]);
  const [removedDefaults, setRemovedDefaults] = useState<{ models: string[]; faults: string[]; accessories: string[] }>({
    models: [],
    faults: [],
    accessories: [],
  });
  const [editedDefaults, setEditedDefaults] = useState<{ [key: string]: string }>({});
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isTechniciansManagerOpen, setIsTechniciansManagerOpen] = useState(false);
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>("all");

  // האם המשתמש הנוכחי יכול לראות פריטי מלאי מתקדם?
  const canSeeAdvanced = canAccessAdvancedInventory(currentUser);

  useEffect(() => {
    // Load logged-in user from session storage
    const user = loadSession();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.error("Auth error", err));

    const unsubscribePricelist = onSnapshot(
      collection(db, "pricelist"),
      (snapshot) => {
        const loadedItems = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as PriceItem[];
        setItems(loadedItems);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );

    // Listen for custom items
    const unsubscribeCustomItems = onSnapshot(
      collection(db, "customItems"),
      (snapshot) => {
        const faults: string[] = [];
        const accessories: string[] = [];
        const models: string[] = [];
        const removed: { models: string[]; faults: string[]; accessories: string[] } = {
          models: [],
          faults: [],
          accessories: [],
        };
        const edited: { [key: string]: string } = {};
        
        snapshot.docs.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          if (data.type === "fault") {
            faults.push(data.name);
          } else if (data.type === "accessory") {
            accessories.push(data.name);
          } else if (data.type === "model") {
            models.push(data.name);
          } else if (data.type === "removedModel") {
            removed.models.push(data.name);
          } else if (data.type === "removedFault") {
            removed.faults.push(data.name);
          } else if (data.type === "removedAccessory") {
            removed.accessories.push(data.name);
          } else if (data.type === "editedDefault") {
            edited[data.originalName] = data.newName;
          }
        });
        setCustomFaults(faults);
        setCustomAccessories(accessories);
        setCustomModels(models);
        setRemovedDefaults(removed);
        setEditedDefaults(edited);
      },
      (error) => {
        console.error("Custom items error:", error);
      }
    );

    // Listen for technicians
    const unsubscribeTechs = onSnapshot(
      collection(db, "technicians"),
      (snapshot) => {
        const techs = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as Technician[];
        setTechnicians(techs);
      },
      (error) => {
        console.error("Technicians error:", error);
      }
    );

    return () => {
      unsubscribePricelist();
      unsubscribeCustomItems();
      unsubscribeTechs();
    };
  }, []);

  const showNotification = useCallback((msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const callGemini = async (prompt: string, systemPrompt: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        }
      );
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  };

  const handleAiAssistant = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    const systemPrompt = `אתה עוזר טכני למסופים וקופות. נתח את התקלה והצע סעיף מהמחירון: ${DEFAULT_MODELS.join(
      ","
    )}. ענה בעברית מקצועית.`;
    try {
      const result = await callGemini(aiQuery, systemPrompt);
      setAiResponse(result);
    } catch {
      showNotification("שגיאת AI", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // Helper to get display name for defaults
  const getDisplayName = useCallback((originalName: string) => {
    return editedDefaults[originalName] || originalName;
  }, [editedDefaults]);

  const allModelsList = useMemo(() => {
    // Get active default models (not removed) with display names applied
    const activeDefaultModels = DEFAULT_MODELS
      .filter(m => !removedDefaults.models.includes(m))
      .map(getDisplayName);
    // Only use defaults and custom models - NOT models from DB pricelist
    return [...new Set([...activeDefaultModels, ...customModels])]
      .filter(Boolean)
      .sort();
  }, [customModels, removedDefaults.models, getDisplayName]);

  const dynamicFaultsList = useMemo(() => {
    const activeDefaultFaults = GLOBAL_FAULT_LIST
      .filter(f => !removedDefaults.faults.includes(f))
      .map(getDisplayName);
    const dbFaults = items
      .filter(
        (i) =>
          (GLOBAL_FAULT_LIST.includes(i.name) ||
          i.name.includes("נזק") ||
          i.name.includes("שבר")) &&
          !removedDefaults.faults.includes(i.name)
      )
      .map((i) => i.name);
    return [...new Set([...activeDefaultFaults, ...dbFaults, ...customFaults])]
      .filter(f => !removedDefaults.faults.includes(f))
      .sort();
  }, [items, customFaults, removedDefaults.faults, getDisplayName]);

  const dynamicAccessoriesList = useMemo(() => {
    const activeDefaultAccessories = GLOBAL_ACCESSORIES_LIST
      .filter(a => !removedDefaults.accessories.includes(a))
      .map(getDisplayName);
    const dbAccs = items
      .filter(
        (i) =>
          !dynamicFaultsList.includes(i.name) && 
          !DRAWER_TYPES.includes(i.name) &&
          !PAPER_TYPES.includes(i.name) &&
          !removedDefaults.accessories.includes(i.name)
      )
      .map((i) => i.name);
    return [...new Set([...activeDefaultAccessories, ...dbAccs, ...customAccessories])]
      .filter(a => !removedDefaults.accessories.includes(a))
      .sort();
  }, [items, dynamicFaultsList, customAccessories, removedDefaults.accessories, getDisplayName]);

  const currentMatch = useMemo(() => {
    const name =
      selectionType === "accessory" && (selectedItemName === "מגירות" || selectedItemName === "ניי��")
        ? selectedSubItem
        : selectedItemName;
    const match = items.find((i) => i.model === selectedModel && i.name === name);
    if (!match) return undefined;
    // אם טכנאי ללא הרשאה - הגיע לפריט מתקדם, לא להחזיר
    if (!canSeeAdvanced && match.isAdvanced) return undefined;
    // טכנאי עם הרשאה - כבד את פילטר התצוגה
    if (canSeeAdvanced) {
      if (inventoryFilter === "regular" && match.isAdvanced) return undefined;
      if (inventoryFilter === "advanced" && !match.isAdvanced) return undefined;
    }
    return match;
  }, [items, selectedModel, selectedItemName, selectedSubItem, selectionType, canSeeAdvanced, inventoryFilter]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, GroupedItem> = {};
    items.forEach((item) => {
      const key = `${item.name}|${item.priceExcl}`;
      if (!groups[key]) {
        groups[key] = {
          name: item.name,
          priceExcl: item.priceExcl,
          models: [],
          ids: [],
        };
      }
      groups[key].models.push(item.model);
      groups[key].ids.push(item.id);
    });
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Group items by name only (for admin panel - shows variable pricing per model)
  const groupedByName = useMemo(() => {
    const groups: Record<string, GroupedByName> = {};
    items.forEach((item) => {
      if (!groups[item.name]) {
        groups[item.name] = {
          name: item.name,
          items: [],
        };
      }
      groups[item.name].items.push(item);
    });
    // Sort items within each group by model name
    Object.values(groups).forEach((group) => {
      group.items.sort((a, b) => a.model.localeCompare(b.model));
    });
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const generateProfessionalSummary = async () => {
    if (!currentMatch) return;
    setSummaryLoading(true);
    const item = selectedSubItem || selectedItemName;

    const systemPrompt = `נסח הודעה מקצועית ללקוח בטון אדיב. ציין את המכשיר: ${selectedModel}, תיקון: ${item}, מחיר כולל מע"מ. כתוב בעברית.`;
    try {
      const result = await callGemini("נסח הודעה", systemPrompt);
      setAiSummary(result || "");
    } catch {
      showNotification("שגיאה בסיכום", "error");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const targets = [...bulkModels];
    if (customModel.trim()) targets.push(customModel.trim());
    const finalName =
      bulkItemName === "CUSTOM" || !bulkItemName
        ? customItemName.trim()
        : bulkItemName;

    // Handle drawer special case
    if (bulkItemName === "מגירות") {
      if (targets.length === 0) return;
      
      const drawerItems = [
        { name: DRAWER_TYPES[0], price: drawerPrices.dk70 },
        { name: DRAWER_TYPES[1], price: drawerPrices.dk80 },
        { name: DRAWER_TYPES[2], price: drawerPrices.dk100 },
      ].filter(d => d.price);

      if (drawerItems.length === 0) return;

      try {
        const batch = writeBatch(db);
        const now = new Date().toISOString();
        targets.forEach((m) => {
          drawerItems.forEach((drawer) => {
            const exist = items.find((i) => i.model === m && i.name === drawer.name);
            if (exist) {
              batch.update(doc(db, "pricelist", exist.id), {
                priceExcl: parseFloat(drawer.price),
                updatedAt: now,
              });
            } else {
              const newDocRef = doc(collection(db, "pricelist"));
              batch.set(newDocRef, {
                model: m,
                name: drawer.name,
                priceExcl: parseFloat(drawer.price),
                updatedAt: now,
              });
            }
          });
        });
        await batch.commit();
        showNotification("מחירי מגירות עודכנו בהצלחה");
        setIsBulkModalOpen(false);
        setBulkModels([]);
        setCustomModel("");
        setBulkItemName("");
        setDrawerPrices({ dk70: "", dk80: "", dk100: "" });
      } catch (err) {
        console.error("Drawer update error:", err);
        showNotification("שגיאה", "error");
      }
      return;
    }

    // Handle paper special case
    if (bulkItemName === "נייר") {
      if (targets.length === 0) return;
      
      const paperItems = [
        { name: PAPER_TYPES[0], price: paperPrices.small },
        { name: PAPER_TYPES[1], price: paperPrices.medium },
        { name: PAPER_TYPES[2], price: paperPrices.large },
      ].filter(p => p.price);

      if (paperItems.length === 0) return;

      try {
        const batch = writeBatch(db);
        const now = new Date().toISOString();
        targets.forEach((m) => {
          paperItems.forEach((paper) => {
            const exist = items.find((i) => i.model === m && i.name === paper.name);
            if (exist) {
              batch.update(doc(db, "pricelist", exist.id), {
                priceExcl: parseFloat(paper.price),
                updatedAt: now,
              });
            } else {
              const newDocRef = doc(collection(db, "pricelist"));
              batch.set(newDocRef, {
                model: m,
                name: paper.name,
                priceExcl: parseFloat(paper.price),
                updatedAt: now,
              });
            }
          });
        });
        await batch.commit();
        showNotification("מחירי נייר עודכנו בהצלחה");
        setIsBulkModalOpen(false);
        setBulkModels([]);
        setCustomModel("");
        setBulkItemName("");
        setPaperPrices({ small: "", medium: "", large: "" });
      } catch (err) {
        console.error("Paper update error:", err);
        showNotification("שגיאה", "error");
      }
      return;
    }

    if (targets.length === 0 || !finalName || !bulkPrice) return;

    try {
      const batch = writeBatch(db);
      const now = new Date().toISOString();
      targets.forEach((m) => {
        const exist = items.find((i) => i.model === m && i.name === finalName);
        if (exist) {
          batch.update(doc(db, "pricelist", exist.id), {
            priceExcl: parseFloat(bulkPrice),
            updatedAt: now,
          });
        } else {
          const newDocRef = doc(collection(db, "pricelist"));
          batch.set(newDocRef, {
            model: m,
            name: finalName,
            priceExcl: parseFloat(bulkPrice),
            updatedAt: now,
          });
        }
      });
      await batch.commit();
      showNotification("עודכן בהצלחה");
      setIsBulkModalOpen(false);
      setBulkModels([]);
      setCustomModel("");
      setBulkItemName("");
      setCustomItemName("");
      setBulkPrice("");
    } catch (err) {
      console.error("Bulk update error:", err);
      showNotification("שגיאה", "error");
    }
  };

  const handleDeleteGroup = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => deleteDoc(doc(db, "pricelist", id))));
      showNotification("נמחק בהצלחה");
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("שגיאה במחיקה", "error");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "pricelist", id));
      showNotification("פריט נמחק בהצלחה");
    } catch (err) {
      console.error("Delete item error:", err);
      showNotification("שגיאה במחיקה", "error");
    }
  };

  const handleEditItem = (item: PriceItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveItem = async (id: string, newName: string, newPrice: number) => {
    try {
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "pricelist", id), {
        name: newName,
        priceExcl: newPrice,
      });
      showNotification("פריט עודכן בהצלחה");
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Update item error:", err);
      showNotification("שגיאה בעדכון", "error");
    }
  };

  const handleAddCustomItem = async (name: string, type: "fault" | "accessory" | "model") => {
    try {
      const newDocRef = doc(collection(db, "customItems"));
      const batch = writeBatch(db);
      batch.set(newDocRef, { name, type });
      await batch.commit();
      const typeNames = { fault: "תקלה", accessory: "אביזר", model: "דגם" };
      showNotification(`${typeNames[type]} נוסף בהצלחה`);
    } catch (err) {
      console.error("Add custom item error:", err);
      showNotification("שגיאה בהוספה", "error");
    }
  };

  const handleRemoveCustomItem = async (name: string, type: "fault" | "accessory" | "model") => {
    try {
      // Find the document with the matching name and type
      const snapshot = await import("firebase/firestore").then(({ getDocs, query, where }) =>
        getDocs(query(collection(db, "customItems"), where("name", "==", name), where("type", "==", type)))
      );
      
      const deletePromises = snapshot.docs.map((docSnapshot) => deleteDoc(doc(db, "customItems", docSnapshot.id)));
      await Promise.all(deletePromises);
      const typeNames = { fault: "תקלה", accessory: "אביזר", model: "דגם" };
      showNotification(`${typeNames[type]} הוסר בהצלחה`);
    } catch (err) {
      console.error("Remove custom item error:", err);
      showNotification("שגיאה במחיקה", "error");
    }
  };

  const handleEditModel = async (oldName: string, newName: string) => {
    try {
      // Find the document with the matching name
      const snapshot = await import("firebase/firestore").then(({ getDocs, query, where }) =>
        getDocs(query(collection(db, "customItems"), where("name", "==", oldName), where("type", "==", "model")))
      );
      
      if (snapshot.docs.length > 0) {
        const { updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "customItems", snapshot.docs[0].id), { name: newName });
        
        // Also update all price items with this model name
        const priceSnapshot = await import("firebase/firestore").then(({ getDocs, query, where }) =>
          getDocs(query(collection(db, "pricelist"), where("model", "==", oldName)))
        );
        
        const batch = writeBatch(db);
        priceSnapshot.docs.forEach((docSnapshot) => {
          batch.update(doc(db, "pricelist", docSnapshot.id), { model: newName });
        });
        await batch.commit();
        
        showNotification("דגם עודכן בהצלחה");
      }
    } catch (err) {
      console.error("Edit model error:", err);
      showNotification("שגיאה בעדכון", "error");
    }
  };

  // Handle removing default items (store in Firebase)
  const handleRemoveDefaultItem = async (name: string, type: "model" | "fault" | "accessory") => {
    try {
      const newDocRef = doc(collection(db, "customItems"));
      const removeType = type === "model" ? "removedModel" : type === "fault" ? "removedFault" : "removedAccessory";
      await import("firebase/firestore").then(({ setDoc }) =>
        setDoc(newDocRef, { name, type: removeType })
      );
      const typeNames = { model: "דגם", fault: "תקלה", accessory: "אביזר" };
      showNotification(`${typeNames[type]} הוסר בהצלחה`);
    } catch (err) {
      console.error("Remove default item error:", err);
      showNotification("שגיאה בהסרה", "error");
    }
  };

  // Handle editing default items (store mapping in Firebase)
  const handleEditDefaultItem = async (oldName: string, newName: string, type: "model" | "fault" | "accessory") => {
    try {
      // Check if edit already exists
      const snapshot = await import("firebase/firestore").then(({ getDocs, query, where }) =>
        getDocs(query(collection(db, "customItems"), where("originalName", "==", oldName), where("type", "==", "editedDefault")))
      );
      
      if (snapshot.docs.length > 0) {
        // Update existing edit
        const { updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "customItems", snapshot.docs[0].id), { newName });
      } else {
        // Create new edit
        const newDocRef = doc(collection(db, "customItems"));
        await import("firebase/firestore").then(({ setDoc }) =>
          setDoc(newDocRef, { originalName: oldName, newName, type: "editedDefault", itemType: type })
        );
      }
      
      // Also update all price items if it's a model
      if (type === "model") {
        const priceSnapshot = await import("firebase/firestore").then(({ getDocs, query, where }) =>
          getDocs(query(collection(db, "pricelist"), where("model", "==", oldName)))
        );
        
        const batch = writeBatch(db);
        priceSnapshot.docs.forEach((docSnapshot) => {
          batch.update(doc(db, "pricelist", docSnapshot.id), { model: newName });
        });
        await batch.commit();
      }
      
      const typeNames = { model: "דגם", fault: "תקלה", accessory: "אביזר" };
      showNotification(`${typeNames[type]} עודכן בהצלחה`);
    } catch (err) {
      console.error("Edit default item error:", err);
      showNotification("שגיאה בעדכון", "error");
    }
  };

  // Handle restoring removed default items
  // Toggle the "isAdvanced" flag on a single price item
  const handleToggleAdvancedItem = async (id: string, value: boolean) => {
    try {
      await updateDoc(doc(db, "pricelist", id), { isAdvanced: value });
      showNotification(
        value ? "הפריט סומן כמלאי מתקדם" : "תיוג מלאי מתקדם הוסר"
      );
    } catch (err) {
      console.error("Toggle advanced error:", err);
      showNotification("שגיאה בעדכון", "error");
    }
  };

  // Technicians CRUD
  const handleAddTechnician = async (
    displayName: string,
    username: string,
    advancedAccess: boolean = false
  ) => {
    try {
      const newDocRef = doc(collection(db, "technicians"));
      await setDoc(newDocRef, {
        displayName,
        username,
        advancedAccess,
        active: true,
        createdAt: new Date().toISOString(),
      });
      showNotification(
        advancedAccess
          ? `הטכנאי "${displayName}" נוסף עם גישה למלאי מתקדם`
          : `הטכנאי "${displayName}" נוסף בהצלחה`
      );
    } catch (err) {
      console.error("Add technician error:", err);
      showNotification("שגיאה בהוספת טכנאי", "error");
    }
  };

  const handleRemoveTechnician = async (id: string) => {
    try {
      await deleteDoc(doc(db, "technicians", id));
      showNotification("הטכנאי נמחק בהצלחה");
    } catch (err) {
      console.error("Remove technician error:", err);
      showNotification("שגיאה במחיקה", "error");
    }
  };

  const handleToggleTechnicianAdvanced = async (id: string, value: boolean) => {
    try {
      await updateDoc(doc(db, "technicians", id), { advancedAccess: value });
      showNotification(
        value ? "הטכנאי קיבל גישה למלאי מתקדם" : "גישת מלאי מתקדם הוסרה"
      );
    } catch (err) {
      console.error("Toggle technician advanced error:", err);
      showNotification("שגיאה בעדכון הרשאה", "error");
    }
  };

  // עדכון שם משתמש לטכנאי - admin בלבד
  const handleUpdateTechnicianUsername = async (
    id: string,
    oldUsername: string,
    newUsername: string
  ) => {
    if (!currentUser || !canManageUsers(currentUser.role)) {
      showNotification("אין לך הרשאה לפעולה זו", "error");
      return;
    }
    const trimmed = newUsername.trim();
    if (!trimmed) {
      showNotification("שם משתמש לא יכול להיות ריק", "error");
      return;
    }
    try {
      await updateDoc(doc(db, "technicians", id), { username: trimmed });
      await renamePasswordRecord(oldUsername, trimmed);
      showNotification(`שם המשתמש עודכן ל-${trimmed}`);
    } catch (err) {
      console.error("Update username error:", err);
      showNotification("שגיאה בעדכון שם המשתמש", "error");
    }
  };

  // עדכון שם תצוגה לטכנאי - admin בלבד
  const handleUpdateTechnicianDisplayName = async (
    id: string,
    newName: string
  ) => {
    if (!currentUser || !canManageUsers(currentUser.role)) {
      showNotification("אין לך הרשאה לפעולה זו", "error");
      return;
    }
    const trimmed = newName.trim();
    if (!trimmed) {
      showNotification("שם תצוגה לא יכול להיות ריק", "error");
      return;
    }
    try {
      await updateDoc(doc(db, "technicians", id), { displayName: trimmed });
      showNotification(`שם התצוגה עודכן ל-${trimmed}`);
    } catch (err) {
      console.error("Update displayName error:", err);
      showNotification("שגיאה בעדכון שם תצוגה", "error");
    }
  };

  const handleRestoreDefaultItem = async (name: string, type: "model" | "fault" | "accessory") => {
    try {
      const removeType = type === "model" ? "removedModel" : type === "fault" ? "removedFault" : "removedAccessory";
      const snapshot = await import("firebase/firestore").then(({ getDocs, query, where }) =>
        getDocs(query(collection(db, "customItems"), where("name", "==", name), where("type", "==", removeType)))
      );
      
      const deletePromises = snapshot.docs.map((docSnapshot) => deleteDoc(doc(db, "customItems", docSnapshot.id)));
      await Promise.all(deletePromises);
      
      const typeNames = { model: "דגם", fault: "תקלה", accessory: "אביזר" };
      showNotification(`${typeNames[type]} שוחזר בהצלחה`);
    } catch (err) {
      console.error("Restore default item error:", err);
      showNotification("שגיאה בשחזור", "error");
    }
  };

  if (loading) {
    return (
      <div
        className={`flex h-screen items-center justify-center ${
          theme === "dark" ? "bg-[#0f172a]" : "bg-slate-50"
        }`}
      >
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-500 ${
        theme === "dark"
          ? "bg-[#0f172a] text-slate-100"
          : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <Header
        theme={theme}
        view={view}
        onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
        onViewToggle={() => {
          if (view === "user") {
            // Switching to admin view
            if (isAdminAuthenticated) {
              setView("admin");
            } else {
              setShowAdminAuth(true);
            }
          } else {
            // Switching back to user view
            setView("user");
            setShowAdminAuth(false);
          }
        }}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        isAuthenticated={currentUser !== null}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {currentUser && (
        <ProfileModal
          theme={theme}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          currentUser={currentUser}
          onLogout={() => {
            clearSession();
            setCurrentUser(null);
            setView("user");
            setShowAdminAuth(false);
            showNotification("התנתקת בהצלחה", "success");
          }}
        />
      )}

      <main
        className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-10 relative z-10"
        style={{ perspective: "1500px" }}
      >
        {showAdminAuth && !isAdminAuthenticated ? (
          <AdminAuth
            theme={theme}
            onAuthenticated={(user) => {
              setCurrentUser(user);
              setShowAdminAuth(false);
              setView(canViewAdmin(user.role) ? "admin" : "user");
            }}
            onCancel={() => {
              setShowAdminAuth(false);
              setView("user");
            }}
          />
        ) : view === "user" ? (
          <UserPanel
            theme={theme}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectionType={selectionType}
            setSelectionType={setSelectionType}
            selectedItemName={selectedItemName}
            setSelectedItemName={setSelectedItemName}
            selectedSubItem={selectedSubItem}
            setSelectedSubItem={setSelectedSubItem}
            allModelsList={allModelsList}
            allItems={items}
            dynamicFaultsList={dynamicFaultsList}
            dynamicAccessoriesList={dynamicAccessoriesList}
            currentMatch={currentMatch}
            setAiSummary={setAiSummary}
            aiSummary={aiSummary}
            summaryLoading={summaryLoading}
            onGenerateSummary={generateProfessionalSummary}
            showNotification={showNotification}
            canSeeAdvanced={canSeeAdvanced}
            inventoryFilter={inventoryFilter}
            setInventoryFilter={setInventoryFilter}
          />
        ) : (
          <AdminPanel
            theme={theme}
            groupedByName={groupedByName}
            allItems={items}
            onOpenBulkModal={() => {
              setBulkModels([]);
              setCustomModel("");
              setBulkItemName("");
              setCustomItemName("");
              setBulkPrice("");
              setDrawerPrices({ dk70: "", dk80: "", dk100: "" });
              setPaperPrices({ small: "", medium: "", large: "" });
              setIsBulkModalOpen(true);
            }}
            onOpenItemsManager={() => setIsItemsManagerOpen(true)}
            onOpenTechniciansManager={() => setIsTechniciansManagerOpen(true)}
            onOpenUsersManager={() => setIsUsersManagerOpen(true)}
            onDeleteGroup={handleDeleteGroup}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
            onToggleAdvancedItem={handleToggleAdvancedItem}
            canManageTechs={
              currentUser ? canManageTechnicians(currentUser.role) : false
            }
            canManageUsers={
              currentUser ? canManageUsers(currentUser.role) : false
            }
          />
        )}
      </main>

      <AIModal
        theme={theme}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        query={aiQuery}
        setQuery={setAiQuery}
        response={aiResponse}
        loading={aiLoading}
        onSubmit={handleAiAssistant}
      />

      <BulkModal
        theme={theme}
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        bulkModels={bulkModels}
        setBulkModels={setBulkModels}
        customModel={customModel}
        setCustomModel={setCustomModel}
        bulkItemName={bulkItemName}
        setBulkItemName={setBulkItemName}
        customItemName={customItemName}
        setCustomItemName={setCustomItemName}
        bulkPrice={bulkPrice}
        setBulkPrice={setBulkPrice}
        drawerPrices={drawerPrices}
        setDrawerPrices={setDrawerPrices}
        paperPrices={paperPrices}
        setPaperPrices={setPaperPrices}
        allModelsList={allModelsList}
        allItems={items}
        dynamicFaultsList={dynamicFaultsList}
        dynamicAccessoriesList={dynamicAccessoriesList}
        onSubmit={handleBulkUpdate}
      />

      <ItemsManager
        theme={theme}
        isOpen={isItemsManagerOpen}
        onClose={() => setIsItemsManagerOpen(false)}
        customFaults={customFaults}
        customAccessories={customAccessories}
        customModels={customModels}
        removedDefaults={removedDefaults}
        editedDefaults={editedDefaults}
        onAddFault={(name) => handleAddCustomItem(name, "fault")}
        onRemoveFault={(name) => handleRemoveCustomItem(name, "fault")}
        onAddAccessory={(name) => handleAddCustomItem(name, "accessory")}
        onRemoveAccessory={(name) => handleRemoveCustomItem(name, "accessory")}
        onAddModel={(name) => handleAddCustomItem(name, "model")}
        onRemoveModel={(name) => handleRemoveCustomItem(name, "model")}
        onEditModel={handleEditModel}
        onRemoveDefaultItem={handleRemoveDefaultItem}
        onEditDefaultItem={handleEditDefaultItem}
        onRestoreDefaultItem={handleRestoreDefaultItem}
      />

      <TechniciansManager
        theme={theme}
        isOpen={isTechniciansManagerOpen}
        onClose={() => setIsTechniciansManagerOpen(false)}
        technicians={technicians}
        onAddTechnician={handleAddTechnician}
        onRemoveTechnician={handleRemoveTechnician}
        onToggleAdvanced={handleToggleTechnicianAdvanced}
      />

      {currentUser && canManageUsers(currentUser.role) && (
        <UsersManager
          theme={theme}
          isOpen={isUsersManagerOpen}
          onClose={() => setIsUsersManagerOpen(false)}
          technicians={technicians}
          onUpdateTechnicianUsername={handleUpdateTechnicianUsername}
          onUpdateTechnicianDisplayName={handleUpdateTechnicianDisplayName}
          onRemoveTechnician={handleRemoveTechnician}
          onToggleAdvanced={handleToggleTechnicianAdvanced}
          showNotification={showNotification}
        />
      )}

      <EditItemModal
        theme={theme}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleSaveItem}
      />

      <Footer theme={theme} />

      <Notification notification={notification} />
    </div>
  );
}
