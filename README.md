# Money Meva Classic

A comprehensive personal finance management application built with Next.js 14, TypeScript, and Tailwind CSS. Features offline-first IndexedDB storage, role-based access, dark mode, and professional financial tracking.

## Features

### Core Financial Management
- **13 Transaction Types** — Income, expense, transfer, loan, EMI, investment, saving, recurring, adjustment, UPI settlement, installments, split bills
- **Account System** — Cash, Bank, UPI, Wallet with color coding, balance tracking, and per-account ledgers
- **Category Management** — Custom categories with usage tracking
- **Partner Management** — Customers, vendors, friends, family, workers with auto-balance updates
- **Loan/EMI Tracking** — Given/taken loans, EMI schedules, payment recording, overdue tracking
- **Investment/Savings Tracking** — Monitor growth and performance

### Advanced Features
- **Recurring Transactions** — Daily, weekly, monthly, yearly schedules
- **Reports & Analytics** — Daily/Monthly/Category/Partner views with charts
- **Financial Year Reports** — Weekly/monthly/yearly breakdowns with comparisons
- **Multi-Currency** — INR, USD, EUR, GBP, AED, SAR

### Security
- **PIN-Based Login** — 4-6 digit PIN with 24-hour session expiry
- **Session Lock** — Optional auto-lock after inactivity using your login PIN
- **Role-Based Access** — Admin, Manager, User roles
- **Audit Log** — Complete activity history with filtering and search
- **Archive System** — Soft delete with restore/permanent delete, bulk operations
- **Danger Zone** — Granular data management actions with captcha confirmation

### Data Management
- **Offline-First** — All data in browser IndexedDB via Dexie.js, no servers
- **Backup & Restore** — Full export/import with version checking and duplicate prevention
- **Export** — JSON, CSV, Excel formats
- **Automatic Migration** — Seamless from localStorage to IndexedDB

### User Experience
- **Dark Mode** — Light/Dark/System preference
- **Responsive** — Desktop, tablet, and mobile
- **Installable PWA** — Add to home screen
- **Multi-Language** — English, Hindi, Marathi, Tamil, Telugu, Bengali

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14.2.35 (App Router) |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS 3.4 |
| **Storage** | Dexie.js 4 (IndexedDB) |
| **Charts** | Recharts 2.x |
| **Icons** | Lucide React |
| **Export** | jsPDF, jsPDF-AutoTable, xlsx |

## Getting Started

```bash
git clone https://github.com/kuldeep7ke/Money-Meva-Classic.git
cd Money-Meva-Classic
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the onboarding wizard will guide you through setup.

### Production Build

```bash
npm run build
```

Static export in `./out/` — deployable to Netlify, Vercel, or any static host.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── archive/          # Archive (restore/delete deleted items)
│   ├── transactions/     # Transaction management
│   ├── accounts/         # Account management + ledgers
│   ├── partners/         # Partner management
│   ├── categories/       # Category management
│   ├── loans/            # Loan & EMI tracking
│   ├── reports/          # Financial reports & charts
│   ├── backup/           # Export/import data
│   ├── audit/            # Activity log
│   ├── login/            # PIN login
│   ├── onboarding/       # First-time setup wizard
│   ├── settings/         # App settings
│   ├── more/             # Extended navigation
│   ├── danger/           # Data management tools
│   └── layout.tsx        # Root layout with providers
├── components/           # Shared components
│   ├── AuthGuard.tsx     # Route protection
│   ├── SessionProvider.tsx # Auto-lock after inactivity
│   └── PinGuard.tsx      # PIN confirmation modal
├── lib/                  # Core utilities
│   ├── db.ts             # Dexie database schema
│   ├── idbStorage.ts     # IndexedDB adapter
│   └── migration.ts      # localStorage to IndexedDB
├── modules/              # Feature modules
│   ├── auth/             # Auth hooks, services, types
│   ├── transactions/     # Transaction hooks, services, components
│   ├── accounts/         # Account services
│   ├── categories/       # Category services
│   ├── partners/         # Partner services
│   ├── loans/            # Loan services
│   ├── archive/          # Archive services
│   └── dashboard/        # Dashboard widgets
└── constants/            # App constants
```

## License

Proprietary. All rights reserved.

## Support

- **Email**: info@marathimeva.com
- **Telegram**: t.me/marathimeva
- **Website**: www.marathimeva.com
