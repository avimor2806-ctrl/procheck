// מערכת משתמשים פנימית לפרויקט
// ⚠️ סיסמאות זמניות לפיתוח בלבד - יש להחליף לפני עלייה לפרודקשן

import { doc, getDoc, setDoc, getDocs, deleteDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

export type Role = "admin" | "warehouse_manager" | "warehouse" | "technician";

export interface AppUser {
  username: string;
  password: string; // dev only
  displayName: string;
  role: Role;
  advancedAccess?: boolean; // טכנאים: גישה למלאי מתקדם וקטגוריית אנליזה
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "מנהל מערכת",
  warehouse_manager: "מנהל מחסן",
  warehouse: "מחסנאי",
  technician: "טכנאי",
};

// סיסמאות זמניות לפרויקט - 1234 לכולם כפי שביקשת
export const USERS: AppUser[] = [
  {
    username: "admin",
    password: "1234",
    displayName: "מנהל מערכת",
    role: "admin",
  },
  {
    username: "manager",
    password: "1234",
    displayName: "מנהל מחסן",
    role: "warehouse_manager",
  },
  {
    username: "warehouse",
    password: "1234",
    displayName: "מחסנאי",
    role: "warehouse",
  },
  {
    username: "tech",
    password: "1234",
    displayName: "טכנאי",
    role: "technician",
  },
];

export interface SessionUser {
  username: string;
  displayName: string;
  role: Role;
  advancedAccess?: boolean;
}

const STORAGE_KEY = "currentUser";

export function authenticate(username: string, password: string): SessionUser | null {
  const u = USERS.find(
    (x) => x.username.toLowerCase() === username.trim().toLowerCase() && x.password === password
  );
  if (!u) return null;
  return {
    username: u.username,
    displayName: u.displayName,
    role: u.role,
    advancedAccess: u.advancedAccess ?? false,
  };
}

// ============================================================
// סיסמאות מותאמות אישית - נשמרות ב-Firestore (collection: userPasswords)
// doc id = username (lowercase). שדה: password.
// ============================================================

const PWD_COLLECTION = "userPasswords";
const OVERRIDES_COLLECTION = "userOverrides"; // doc id = original system username (lowercase)
// מבנה: למשתמשי מערכת קבועים (admin/manager/warehouse/tech), שמירת username/displayName מתבצעת דרך OVERRIDES_COLLECTION.
// doc id = שם המשתמש המקורי (system) | שדות: { username?: string, displayName?: string, updatedAt: string }

interface UserOverride {
  username?: string;
  displayName?: string;
  updatedAt?: string;
}

async function getAllOverrides(): Promise<Map<string, UserOverride>> {
  const map = new Map<string, UserOverride>();
  try {
    const snap = await getDocs(collection(db, OVERRIDES_COLLECTION));
    snap.docs.forEach((d) => map.set(d.id, d.data() as UserOverride));
  } catch (err) {
    console.error("getAllOverrides error:", err);
  }
  return map;
}

async function getOverride(systemUsername: string): Promise<UserOverride | null> {
  try {
    const snap = await getDoc(
      doc(db, OVERRIDES_COLLECTION, systemUsername.trim().toLowerCase())
    );
    if (snap.exists()) return snap.data() as UserOverride;
  } catch (err) {
    console.error("getOverride error:", err);
  }
  return null;
}

/**
 * מחזיר את הסיסמה הנוכחית למשתמש.
 * הקלט מקבל את שם המשתמש הנוכחי (אחרי override) - ה-doc נשמר לפי השם הנוכחי.
 */
export async function getCurrentPassword(username: string): Promise<string> {
  const uname = username.trim().toLowerCase();
  try {
    const snap = await getDoc(doc(db, PWD_COLLECTION, uname));
    if (snap.exists()) {
      const data = snap.data() as { password?: string };
      if (data.password) return data.password;
    }
  } catch (err) {
    console.error("getCurrentPassword error:", err);
  }
  // fallback: USERS array (לפי system username מקורי - ננסה למצוא דרך overrides)
  // אין לנו דרך לדעת מה השם המקורי מה ה-uname - נחפש תחילה ב-USERS לפי השם הישן
  const u = USERS.find((x) => x.username.toLowerCase() === uname);
  if (u) return u.password;
  // לא נמצא ישירות - בדוק אם זה system user אחרי שינוי שם
  const overrides = await getAllOverrides();
  for (const [systemName, ov] of overrides) {
    if ((ov.username || "").trim().toLowerCase() === uname) {
      const orig = USERS.find((x) => x.username.toLowerCase() === systemName.toLowerCase());
      if (orig) return orig.password;
    }
  }
  return "1234";
}

/**
 * מאמת מול הסיסמה הנוכחית (כולל מותאמת אישית מ-Firestore + override לשם משתמש)
 */
export async function authenticateAsync(
  username: string,
  password: string
): Promise<SessionUser | null> {
  const uname = username.trim().toLowerCase();

  // טען משתמשי מערכת מעודכנים (override על שם משתמש/שם תצוגה)
  const overrides = await getAllOverrides();

  // בנה רשימת משתמשי מערכת עם ה-username המעודכן
  for (const sysUser of USERS) {
    const ov = overrides.get(sysUser.username.toLowerCase());
    const effectiveUsername = ov?.username?.trim().toLowerCase() || sysUser.username.toLowerCase();
    const effectiveDisplayName = ov?.displayName || sysUser.displayName;

    if (effectiveUsername === uname) {
      // בדוק סיסמה דרך השם המקורי (כי ה-PWD_COLLECTION ממופה לפיו)
      const currentPwd = await getCurrentPassword(sysUser.username);
      if (currentPwd !== password) return null;
      return {
        username: effectiveUsername,
        displayName: effectiveDisplayName,
        role: sysUser.role,
        advancedAccess: sysUser.advancedAccess ?? false,
      };
    }
  }

  // טכנאי דינמי מ-Firestore (technicians collection)
  try {
    const techsSnap = await getDocs(collection(db, "technicians"));
    const tech = techsSnap.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .find((t: any) => (t.username || "").toLowerCase() === uname);
    if (tech) {
      const currentPwd = await getCurrentPassword(tech.username);
      if (currentPwd !== password) return null;
      return {
        username: tech.username,
        displayName: tech.displayName || tech.username,
        role: "technician" as Role,
        advancedAccess: !!tech.advancedAccess,
      };
    }
  } catch (err) {
    console.error("authenticateAsync technicians lookup error:", err);
  }

  return null;
}

/**
 * שינוי סיסמה - מאמת מול הסיסמה הנוכחית ומעדכן את Firestore
 */
export async function changePassword(
  username: string,
  oldPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const uname = username.trim().toLowerCase();

  if (!newPassword || newPassword.length < 4) {
    return { ok: false, error: "הסיסמה החדשה חייבת להיות באורך 4 תווים לפחות" };
  }

  const currentPwd = await getCurrentPassword(uname);
  if (currentPwd !== oldPassword) {
    return { ok: false, error: "הסיסמה הנוכחית שגויה" };
  }

  if (newPassword === oldPassword) {
    return { ok: false, error: "הסיסמה החדשה זהה לסיסמה הנוכחית" };
  }

  try {
    await setDoc(doc(db, PWD_COLLECTION, uname), {
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch (err) {
    console.error("changePassword error:", err);
    return { ok: false, error: "שגיאה בשמירת הסיסמה. נסה שוב." };
  }
}

// ============================================================
// פונקציות מנהל - עריכה/איפוס סיסמאות למשתמשים אחרים
// ============================================================

export interface UserDirectoryEntry {
  username: string;
  displayName: string;
  role: Role;
  source: "system" | "technician"; // system = USERS קבוע, technician = מ-Firestore
  advancedAccess?: boolean;
}

export interface UserDirectoryEntry {
  /** שם המשתמש התצוגתי (לאחר override) */
  username: string;
  displayName: string;
  role: Role;
  source: "system" | "technician";
  advancedAccess?: boolean;
  /** מזהה פנימי (system username למשתמשי מערכת, technician doc id לטכנאים) */
  id: string;
  /** האם הסיסמה מותאמת אישית או ברירת מחדל */
  hasCustomPassword?: boolean;
}

/**
 * מחזיר את כל המשתמשים במערכת (קבועים עם overrides + טכנאים דינמיים)
 */
export async function listAllUsers(): Promise<UserDirectoryEntry[]> {
  const overrides = await getAllOverrides();
  const result: UserDirectoryEntry[] = USERS.map((u) => {
    const ov = overrides.get(u.username.toLowerCase());
    return {
      id: u.username, // שם המשתמש המקורי = id
      username: ov?.username?.trim() || u.username,
      displayName: ov?.displayName || u.displayName,
      role: u.role,
      source: "system" as const,
      advancedAccess: u.advancedAccess ?? false,
    };
  });

  try {
    const techsSnap = await getDocs(collection(db, "technicians"));
    for (const d of techsSnap.docs) {
      const data = d.data() as any;
      const uname = (data.username || "").toString();
      if (!uname) continue;
      result.push({
        id: d.id,
        username: uname,
        displayName: data.displayName || uname,
        role: "technician",
        source: "technician",
        advancedAccess: !!data.advancedAccess,
      });
    }
  } catch (err) {
    console.error("listAllUsers technicians fetch error:", err);
  }

  // מסמן אם יש סיסמה מותאמת אישית
  const pwdSnap = await getDocs(collection(db, PWD_COLLECTION)).catch(() => null);
  const customPwdSet = new Set<string>();
  if (pwdSnap) pwdSnap.docs.forEach((d) => customPwdSet.add(d.id));
  result.forEach((u) => {
    u.hasCustomPassword = customPwdSet.has(u.username.toLowerCase()) ||
      (u.source === "system" && customPwdSet.has(u.id.toLowerCase()));
  });

  return result;
}

/**
 * עדכון override למשתמש מערכת (שינוי username/displayName לאחד מ-admin/manager/warehouse/tech)
 */
export async function setSystemUserOverride(
  systemUsername: string,
  patch: { username?: string; displayName?: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sysName = systemUsername.trim().toLowerCase();
  const sysUser = USERS.find((u) => u.username.toLowerCase() === sysName);
  if (!sysUser) return { ok: false, error: "משתמש מערכת לא נמצא" };

  const existing = (await getOverride(sysName)) || {};
  const nextUsername =
    patch.username !== undefined ? patch.username.trim() : existing.username;
  const nextDisplayName =
    patch.displayName !== undefined
      ? patch.displayName.trim()
      : existing.displayName;

  // וולידציה לשם משתמש
  if (patch.username !== undefined) {
    if (!nextUsername) {
      return { ok: false, error: "שם משתמש לא יכול להיות ריק" };
    }
    // בדוק שלא מתנגש עם system user אחר
    const taken = USERS.some(
      (u) =>
        u.username.toLowerCase() !== sysName &&
        u.username.toLowerCase() === nextUsername.toLowerCase()
    );
    if (taken) {
      return { ok: false, error: "שם משתמש מתנגש עם משתמש מערכת אחר" };
    }
    // בדוק שלא מתנגש עם override אחר
    const allOv = await getAllOverrides();
    for (const [k, v] of allOv) {
      if (k === sysName) continue;
      if ((v.username || "").toLowerCase() === nextUsername.toLowerCase()) {
        return { ok: false, error: "שם משתמש כבר בשימוש" };
      }
    }
    // בדוק שלא מתנגש עם טכנאי דינמי
    try {
      const techsSnap = await getDocs(collection(db, "technicians"));
      const conflict = techsSnap.docs.find(
        (d) => (d.data() as any).username?.toLowerCase() === nextUsername.toLowerCase()
      );
      if (conflict) {
        return { ok: false, error: "שם משתמש כבר משומש על ידי טכנאי" };
      }
    } catch (err) {
      console.error("setSystemUserOverride conflict check error:", err);
    }
  }

  try {
    await setDoc(doc(db, OVERRIDES_COLLECTION, sysName), {
      ...(nextUsername !== undefined ? { username: nextUsername } : {}),
      ...(nextDisplayName !== undefined ? { displayName: nextDisplayName } : {}),
      updatedAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch (err) {
    console.error("setSystemUserOverride error:", err);
    return { ok: false, error: "שגיאה בשמירת השינויים" };
  }
}

/**
 * שינוי סיסמה על ידי מנהל (ללא צורך לסיסמה הישנה)
 */
export async function adminSetPassword(
  username: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const uname = username.trim().toLowerCase();

  if (!uname) {
    return { ok: false, error: "שם משתמש חסר" };
  }
  if (!newPassword || newPassword.length < 4) {
    return { ok: false, error: "הסיסמה חייבת להיות באורך 4 תווים לפחות" };
  }

  try {
    await setDoc(doc(db, PWD_COLLECTION, uname), {
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch (err) {
    console.error("adminSetPassword error:", err);
    return { ok: false, error: "שגיאה בשמירת הסיסמה. נסה שוב." };
  }
}

/**
 * איפוס סיסמה - מחזיר את הסיסמה לברירת המחדל (מוחק את ה-מותאמת האישית)
 */
export async function adminResetPassword(
  username: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const uname = username.trim().toLowerCase();
  try {
    await deleteDoc(doc(db, PWD_COLLECTION, uname));
    return { ok: true };
  } catch (err) {
    console.error("adminResetPassword error:", err);
    return { ok: false, error: "שגיאה באיפוס הסיסמה" };
  }
}

/**
 * האם המשתמש משתמש בסיסמה מותאמת אישית או בברירת מחדל?
 */
export async function hasCustomPassword(username: string): Promise<boolean> {
  const uname = username.trim().toLowerCase();
  try {
    const snap = await getDoc(doc(db, PWD_COLLECTION, uname));
    return snap.exists();
  } catch {
    return false;
  }
}

/**
 * העברת רשומת סיסמה מ-username ישן ל-username חדש (בעת שינוי שם משתמש של טכנאי)
 */
export async function renamePasswordRecord(
  oldUsername: string,
  newUsername: string
): Promise<void> {
  const oldName = oldUsername.trim().toLowerCase();
  const newName = newUsername.trim().toLowerCase();
  if (oldName === newName) return;

  try {
    const oldDoc = await getDoc(doc(db, PWD_COLLECTION, oldName));
    if (!oldDoc.exists()) return;
    const data = oldDoc.data();
    await setDoc(doc(db, PWD_COLLECTION, newName), data);
    await deleteDoc(doc(db, PWD_COLLECTION, oldName));
  } catch (err) {
    console.error("renamePasswordRecord error:", err);
  }
}

export function saveSession(user: SessionUser): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loadSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
  // ניקוי גם של הדגל הישן
  sessionStorage.removeItem("adminAuth");
}

// הרשאות לפי תפקיד
export function canManagePrices(role: Role): boolean {
  return role === "admin" || role === "warehouse_manager";
}

export function canViewAdmin(role: Role): boolean {
  return role === "admin" || role === "warehouse_manager";
}

export function canManageUsers(role: Role): boolean {
  return role === "admin";
}

export function canCreateOrders(role: Role): boolean {
  // טכנאי יוצר קריאות/הזמנות; מחסנאי ומעלה גם
  return true;
}

// גישה למלאי מתקדם / קטגוריית אנליזה
export function canAccessAdvancedInventory(user: SessionUser | null): boolean {
  if (!user) return false;
  // מנהלים ומנהלי מחסן תמיד רואים הכל
  if (user.role === "admin" || user.role === "warehouse_manager" || user.role === "warehouse") return true;
  // טכנאים רק אם סומנו במפורש כמורשים
  return !!user.advancedAccess;
}

// מי יכול לנהל הרשאות טכנאים (toggle על טכנאי)
export function canManageTechnicians(role: Role): boolean {
  return role === "admin" || role === "warehouse_manager";
}
