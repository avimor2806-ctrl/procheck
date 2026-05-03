import { VAT_RATE } from './constants';
import type { CalculatedPrices } from './types';

export function calculatePrices(priceExcl: number): CalculatedPrices {
  const val = parseFloat(String(priceExcl)) || 0;
  const vat = val * VAT_RATE;
  return {
    excl: val.toLocaleString('he-IL', { minimumFractionDigits: 2 }),
    incl: (val + vat).toLocaleString('he-IL', { minimumFractionDigits: 2 }),
    diff: vat.toLocaleString('he-IL', { minimumFractionDigits: 2 })
  };
}
