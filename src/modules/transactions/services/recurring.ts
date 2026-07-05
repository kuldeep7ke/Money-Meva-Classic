import { Transaction } from '@/modules/transactions/types';
import { storage } from './storage';
import { generateId } from '@/utils';
import { RecurringFrequency } from '@/constants';

function getNextDate(currentDate: string, frequency: RecurringFrequency): string {
  const date = new Date(currentDate);
  switch (frequency) {
    case 'daily': date.setDate(date.getDate() + 1); break;
    case 'weekly': date.setDate(date.getDate() + 7); break;
    case 'biweekly': date.setDate(date.getDate() + 14); break;
    case 'monthly': date.setMonth(date.getMonth() + 1); break;
    case 'quarterly': date.setMonth(date.getMonth() + 3); break;
    case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
  }
  return date.toISOString().split('T')[0];
}

export const recurringService = {
  getTemplates: (): Transaction[] => {
    return storage.transactions.getAll().filter((t) => t.isRecurring && t.recurringFrequency);
  },

  getUpcoming: (daysAhead: number = 30): Transaction[] => {
    const templates = recurringService.getTemplates();
    const upcoming: Transaction[] = [];
    const today = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);

    templates.forEach((template) => {
      if (!template.recurringFrequency || !template.date) return;
      let nextDate = template.nextDueDate || template.date;
      const endDate = template.recurringEndDate;

      while (new Date(nextDate) <= cutoff) {
        if (endDate && new Date(nextDate) > new Date(endDate)) break;
        if (new Date(nextDate) >= today) {
          upcoming.push({ ...template, date: nextDate, nextDueDate: nextDate });
          break;
        }
        nextDate = getNextDate(nextDate, template.recurringFrequency);
      }
    });

    return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  generateDue: (userId: string, businessId: string): Transaction[] => {
    const templates = recurringService.getTemplates();
    const generated: Transaction[] = [];
    const today = new Date().toISOString().split('T')[0];

    templates.forEach((template) => {
      if (!template.recurringFrequency) return;
      let nextDate = template.nextDueDate || template.date;
      const endDate = template.recurringEndDate;

      while (nextDate <= today) {
        if (endDate && nextDate > endDate) break;

        const newTransaction: Transaction = {
          id: generateId(),
          businessId,
          userId,
          type: template.type,
          amount: template.amount,
          description: template.description,
          date: nextDate,
          categoryId: template.categoryId,
          partnerId: template.partnerId,
          tags: template.tags,
          notes: `Auto-generated from recurring: ${template.description}`,
          isRecurring: false,
          createdBy: userId,
          updatedBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        storage.transactions.create(newTransaction as Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>);
        generated.push(newTransaction);

        nextDate = getNextDate(nextDate, template.recurringFrequency);
      }

      storage.transactions.update(template.id, { nextDueDate: getNextDate(today, template.recurringFrequency) });
    });

    return generated;
  },

  getStats: () => {
    const templates = recurringService.getTemplates();
    const monthlyTotal = templates.reduce((sum, t) => {
      if (!t.recurringFrequency) return sum;
      switch (t.recurringFrequency) {
        case 'daily': return sum + t.amount * 30;
        case 'weekly': return sum + t.amount * 4.33;
        case 'biweekly': return sum + t.amount * 2.17;
        case 'monthly': return sum + t.amount;
        case 'quarterly': return sum + t.amount / 3;
        case 'yearly': return sum + t.amount / 12;
        default: return sum;
      }
    }, 0);

    return {
      activeCount: templates.length,
      monthlyEstimate: monthlyTotal,
      upcoming: recurringService.getUpcoming(7),
    };
  },
};
