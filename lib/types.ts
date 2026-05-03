export interface PriceItem {
  id: string;
  model: string;
  name: string;
  priceExcl: number;
  updatedAt?: string;
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
export type SelectionType = 'fault' | 'accessory';
export type ThemeType = 'dark' | 'light';

export interface Notification {
  msg: string;
  type: 'success' | 'error';
}
