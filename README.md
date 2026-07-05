# Money Meva Classic

A shared finance management application built with Next.js 14. Offline-first, with IndexedDB storage, dark mode, double-entry accounting, role-based access, and comprehensive financial tracking.

## Features

- **Transaction Management** — 13 transaction types, grouped by day/week/month, bulk actions, advanced filters, CSV/JSON/Excel/PDF export
- **Double-Entry Accounting** — from/to accounts with auto-balancing on every transaction
- **Account System** — Cash, Bank, UPI, Wallet with balance tracking, color picker, and per-account ledger
- **Category Management** — 15 default categories with recent/most-used picker and inline quick-create
- **Partner Management** — 7 default groups with contacts, balance tracking, and group filtering
- **Loan/EMI/Investment Tracking** — Given/Taken loans, EMI schedules, progress bars, record payments
- **Reports & Charts** — Daily/Monthly/Category/Partner/Type views with Recharts, date range presets, financial year breakdown
- **Recurring Transactions** — Schedule recurring entries with frequency and auto-generate due items
- **User Authentication & Roles** — PIN-based login with 3 roles: Admin, Manager, User
- **Session Lock / Auto-logout** — Configurable inactivity timer with PIN lock screen
- **Archive System** — Soft delete with restore capability
- **Audit Log** — Full activity history with filters and export
- **Danger Zone** — 10 granular data management actions with math captcha + typed confirmation
- **Backup & Restore** — Full/partial export and merge/replace import
- **Dark Mode** — Light/Dark/System toggle with CSS variables throughout

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Dexie.js | IndexedDB wrapper |
| Recharts | Charts & graphs |
| Lucide Icons | UI icons |
| jsPDF | PDF export |
| xlsx | Excel export |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the onboarding wizard will guide you through first-time setup.

## Build

```bash
npm run build
```

Produces a static export in the `out/` directory.

## Project Structure

```
src/
  app/               Pages (Next.js App Router)
    accounts/        Account management
    transactions/    Transaction CRUD
    categories/      Category management
    partners/        Partner management
    loans/           Loan/EMI tracking
    reports/         Reports & charts
    settings/        App configuration
    backup/          Backup & restore
    archive/         Soft delete view
    audit/           Activity log
    users/           User management
    danger/          Danger zone
  components/        Shared UI components
  modules/           Feature modules
    accounts/        Account types & services
    transactions/    Transaction types, hooks, services
    categories/      Category types & services
    partners/        Partner types & services
    loans/           Loan types & services
    auth/            Auth types, hooks, services
    dashboard/       Dashboard widgets
    archive/         Archive services
  lib/               Core library
    db.ts            Dexie schema
    idbStorage.ts    IndexedDB storage adapter
    migration.ts     localStorage → IndexedDB migration
  constants/         App constants
  types/             Shared types
  utils/             Utility functions
```

## Storage

All data is stored locally in the browser's IndexedDB via Dexie.js. No data is sent to external servers. A migration path from localStorage is included for existing data.

## License

Proprietary — All rights reserved.
