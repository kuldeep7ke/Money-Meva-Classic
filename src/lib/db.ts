import Dexie, { type Table } from 'dexie';

export class MoneyMevaDB extends Dexie {
  transactions!: Table<any, string>;
  partners!: Table<any, string>;
  partnerGroups!: Table<any, string>;
  categories!: Table<any, string>;
  users!: Table<any, string>;
  accounts!: Table<any, string>;
  loans!: Table<any, string>;
  audit!: Table<any, string>;
  archive!: Table<any, string>;
  recurring!: Table<any, string>;
  budgets!: Table<any, string>;
  reminders!: Table<any, string>;
  adjustments!: Table<any, string>;
  goals!: Table<any, string>;
  settings!: Table<any, string>;

  constructor() {
    super('MoneyMevaDB');
    this.version(1).stores({
      transactions: 'id, type, date, category, userId, deletedAt',
      partners: 'id, group, userId, deletedAt',
      partnerGroups: 'id',
      categories: 'id, type, userId',
      users: 'id, role',
      accounts: 'id, type',
      loans: 'id, type, status',
      audit: 'id, action, entity, userId, timestamp',
      archive: 'id, type, deletedAt',
      recurring: 'id, status, userId, deletedAt',
      budgets: 'id, category, userId, deletedAt',
      reminders: 'id, status, userId, deletedAt',
      adjustments: 'id, accountType, userId, deletedAt',
      goals: 'id, name, userId, deletedAt',
      settings: 'key',
    });
  }
}

export const db = new MoneyMevaDB();