export interface Category {
  id: string;
  businessId: string;
  name: string;
  parentId?: string;
  color: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
  isArchived: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters {
  type?: string;
  parentId?: string;
  search?: string;
  isArchived?: boolean;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  { businessId: 'default', name: 'Salary', color: '#22c55e', icon: 'briefcase', type: 'income', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Freelance', color: '#06b6d4', icon: 'laptop', type: 'income', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Business', color: '#3b82f6', icon: 'building', type: 'income', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Investment Return', color: '#8b5cf6', icon: 'trending-up', type: 'income', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Gift', color: '#ec4899', icon: 'gift', type: 'income', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Food & Dining', color: '#ef4444', icon: 'utensils', type: 'expense', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Transport', color: '#f59e0b', icon: 'car', type: 'expense', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Shopping', color: '#f97316', icon: 'shopping-bag', type: 'expense', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Bills & Utilities', color: '#6366f1', icon: 'zap', type: 'expense', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Health', color: '#14b8a6', icon: 'heart', type: 'expense', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Education', color: '#0ea5e9', icon: 'book', type: 'expense', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Entertainment', color: '#a855f7', icon: 'film', type: 'expense', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Rent', color: '#d946ef', icon: 'home', type: 'expense', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Groceries', color: '#10b981', icon: 'shopping-cart', type: 'expense', isArchived: false, createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Personal Care', color: '#f43f5e', icon: 'smile', type: 'expense', isArchived: false, createdBy: 'system', updatedBy: 'system' },
];
