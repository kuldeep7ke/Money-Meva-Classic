import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export function getSortedCategories(baseCategories: string[], type?: string): string[] {
  if (typeof window === 'undefined') return baseCategories;
  try {
    const raw = localStorage.getItem('mm_transactions');
    if (!raw) return baseCategories;
    const txs = JSON.parse(raw).filter((t: any) => !t.deletedAt && (!type || t.type === type));
    const freq: Record<string, number> = {};
    txs.forEach((t: any) => { freq[t.category] = (freq[t.category] || 0) + 1; });
    const categories = Array.from(new Set([...baseCategories, ...Object.keys(freq)]));
    return categories.sort((a, b) => (freq[b] || 0) - (freq[a] || 0));
  } catch {
    return baseCategories;
  }
}
