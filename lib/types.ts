export interface PriceItem {
  id: string;
  model: string;
  name: string;
  priceExcl: number;
  updatedAt?: string;
  isAdvanced?: boolean; // פריט מלאי מתקדם - רק טכנאים מורשים יראו/יזמינו
  category?: ItemCategory; // קטגוריית הפריט (fault/accessory/analysis)
}

export type ItemCategory = 'fault' | 'accessory' | 'analysis';

export interface Technician {
  id: string;
  username: string;
  displayName: string;
  advancedAccess: boolean; // גישה לפריטי מלאי מתקדם ולקטגוריית אנליזה
  active?: boolean;
  createdAt?: string;
}

export interface GroupedItem {
  name: string;
  priceExcl: number;
  models: string[];
  ids: string[];
}

export interface GroupedByName {
  name: string;
  items: PriceItem[];
}

export interface CalculatedPrices {
  excl: string;
  incl: string;
  diff: string;
}

export type ViewType = 'user' | 'admin';
export type SelectionType = 'fault' | 'accessory' | 'analysis';
export type InventoryFilter = 'all' | 'regular' | 'advanced'; // מסנן תצוגת מלאי
export type ThemeType = 'dark' | 'light';

export interface Notification {
  msg: string;
  type: 'success' | 'error';
}
