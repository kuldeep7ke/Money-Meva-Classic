# Money Meva Classic

A comprehensive personal finance management application built with Next.js 16, TypeScript, and Tailwind CSS v4. Features offline-first IndexedDB storage, double-entry accounting, role-based access, dark mode, and professional financial tracking capabilities.

## ✨ Features

### Core Financial Management
- **13 Transaction Types** — Income, expense, transfer, loan, EMI, investment, saving, recurring, adjustment, UPI settlement, installments, split bills, and more
- **Double-Entry Accounting** — Every transaction records both `fromAccountId` and `toAccountId` with automatic balance updates
- **Account System** — Cash, Bank, UPI, Wallet with color coding, balance tracking, and per-account ledgers
- **Category Management** — 15 default categories with recent/frequent usage tracking and quick-create functionality
- **Partner Management** — 7 default groups (Customer, Vendor, Friend, Family, Worker, Farm Partner, Company) with auto-balance updates
- **Loan/EMI Tracking** — Given/taken loans, EMI schedules with progress bars, payment recording, and active/overdue tracking
- **Investment/Savings Tracking** — Monitor growth and performance over time

### Advanced Features
- **Recurring Transactions** — Schedule automatic entries with flexible frequency (daily, weekly, monthly, yearly, custom)
- **Reports & Analytics** — Daily/Monthly/Category/Partner/Transaction type views with Recharts charts and date range presets
- **Financial Year Reports** — Weekly/monthly/yearly breakdowns with carry-forward calculations and year-over-year comparisons
- **Multi-Currency Support** — INR, USD, EUR, GBP, AED, SAR with proper formatting
- **Multi-Language** — English, Hindi, Marathi, Tamil, Telugu, Bengali support

### Security & Privacy
- **Role-Based Access Control** — 3 roles: Administrator (full access), Manager (financial operations + reports), User (view + create only)
- **PIN Protection** — Secure login with PIN protection and session timeout (configurable)
- **Session Lock** — Automatic logout after inactivity with PIN re-entry required
- **Audit Log** — Complete activity history with filtering, search, and export capabilities
- **Archive System** — Soft delete for transactions, partners, categories with restore/permanent delete options
- **Danger Zone** — 10 granular data management actions with confirmation safeguards

### Data Management
- **Offline-First IndexedDB Storage** — All data stored locally in browser via Dexie.js (no external servers)
- **Automatic Migration** — Seamless migration from localStorage to IndexedDB on first launch
- **Backup & Restore** — Full database export/import with version checking, duplicate prevention, and merge/replace options
- **Export Formats** — JSON, CSV, Excel (.xlsx), PDF with professional formatting
- **Data Validation** — Import duplicate prevention by ID, version compatibility checking

### User Experience
- **Dark Mode System** — Light/Dark/System preference with CSS variables throughout
- **Responsive Design** — Works on desktop, tablet, and mobile devices
- **Installable PWA** — Can be installed as a desktop/mobile application
- **Professional UI** — Clean, intuitive interface with lucide icons and thoughtful spacing
- **Keyboard Navigation** — Full keyboard accessibility for power users
- **Tooltip Guidance** — Helpful hints and explanations throughout the interface

### Notification System
- **Smart Reminders** — Backup reminders (new users: import hint, active users: backup suggestion)
- **Install Prompt** — Suggests installing as PWA with platform-specific instructions
- **Cloud Version Notices** — 3-day recurring notifications about paid cloud/WordPress versions
- **Weekend Tips** — Helpful reminders on Saturdays/Sundays
- **Transaction Alerts** — Overdue loans, upcoming EMIs, and recurring payments

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 16.2.9 (Turbopack) | React framework with App Router |
| **Language** | TypeScript 5.x | Type safety and developer experience |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with dark mode support |
| **Storage** | Dexie.js 4.4.4 | IndexedDB wrapper with automatic migration |
| **Database** | IndexedDB | Client-side storage (transactions, partners, etc.) |
| **Charts** | Recharts 3.9.1 | Financial analytics and data visualization |
| **Icons** | Lucide Icons v1.22.0 | Consistent, lightweight icon set |
| **Forms** | React Hook Form | Efficient form handling and validation |
| **State** | React Context API | Global state management (theme, auth, etc.) |
| **Export** | jsPDF, xlsx | PDF and Excel spreadsheet generation |
| **Security** | bcrypt-equivalent | Secure PIN handling and session management |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS version recommended)
- npm 9+ or yarn/pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/kuldeep7ke/Money-Meva-Classic.git
cd Money-Meva-Classic

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser — the onboarding wizard will guide you through creating your first administrator account.

### Production Build
```bash
# Create optimized production build
npm run build

# Static export will be in ./out/ directory
# Ready for deployment to Netlify, Vercel, or any static host
```

## 📁 Project Structure

```
money-meva-classic/
├── src/
│   ├── app/                    # Next.js App Router (pages)
│   │   ├── (pages)             # All route pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── globals.css         # Tailwind v4 base styles
│   ├── components/             # Shared reusable components
│   ├── lib/                    # Core library utilities
│   │   ├── db.ts               # Dexie database schema
│   │   ├── idbStorage.ts       # IndexedDB storage adapter
│   │   ├── migration.ts        | localStorage → IndexedDB migration
│   │   └── utils.ts            # Helper functions
│   ├── modules/                # Feature-specific business logic
│   │   ├── accounts/           | Account types and services
│   │   ├── transactions/       | Transaction types, hooks, services
│   │   ├── categories/         | Category types and services
│   │   ├── partners/           | Partner types and services
│   │   ├── loans/              | Loan types and services
│   │   ├── auth/               | Auth types, hooks, services
│   │   └── dashboard/          | Dashboard widgets and stats
│   ├── constants/              # Application constants and enums
│   └── types/                  # Shared TypeScript interfaces
├── public/                     # Static assets (icons, manifest, etc.)
├── VERSION                     # Current application version (v4.0.2.0)
├── package.json                # Dependencies and scripts
├── package-lock.json           # Exact dependency versions
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration for Tailwind v4
├── README.md                   # This file
└── LICENSE                     # License information
```

## 💾 Storage & Data Management

### Offline-First Architecture
All financial data is stored locally in the user's browser using IndexedDB via Dexie.js. This ensures:
- **Privacy**: No data leaves your device unless you choose to export/share it
- **Availability**: Works 100% offline after initial load
- **Performance**: Instant data access without network latency
- **Reliability**: Functions regardless of internet connectivity

### Storage Migration
Upon first launch, the application automatically:
1. Detects existing localStorage data (from previous versions)
2. Migrates all data to IndexedDB for improved performance and reliability
3. Marks migration as complete to prevent repeated processing
4. Preserves all existing data integrity and relationships

### Backup System
- **Full Backup** — Complete database export as JSON with version metadata
- **Selective Backup** — Export specific data types (transactions, partners, etc.)
- **Import Options**:
  - **Merge** — Adds new records, skips duplicates by existing IDs
  - **Replace** — Clears existing data, then imports all (use with caution)
- **Version Compatibility** — Warns when importing backups from newer app versions
- **Duplicate Prevention** — Skips records with existing IDs during merge imports

## 🔐 Security & Privacy

### Authentication
- **PIN-Based Login** — 4-6 digit PIN securing access to financial data
- **Role-Based Access** — Three-tier permission system:
  - **Administrator**: Full access including user management and system settings
  - **Manager**: Financial operations, reports, and data viewing (no user management)
  - **User**: View existing data, create new transactions (limited modification rights)
- **Session Management** — Configurable auto-logout timer with PIN re-entry requirement

### Data Protection
- **Local Storage Only** — All data remains in browser IndexedDB unless explicitly exported
- **No External Tracking** — Zero analytics, tracking, or telemetry collection
- **Open Audit Trail** — Complete history of all data modifications accessible to administrators
- **Safe Deletion** — Archive system with restore capability before permanent deletion
- **Danger Zone Protections** — Multi-step confirmation with math captcha for destructive actions

### Backup & Recovery
- **Automatic Backups** — Users encouraged to export regularly via Backup page
- **Versioned Exports** — Backup files include app version and timestamp
- **Restore Validation** — Prevents importing incompatible version backups without warning
- **Selective Restore** — Choose specific data types to restore or replace

## 📊 Reporting & Analytics

### Financial Reports
- **Transaction Reports** — Filter by type, date range, category, partner
- **Account Reports** — Per-account balances, transaction history, and trends
- **Partner Reports** — Outstanding balances, transaction history, and contact info
- **Category Reports** — Spending/income analysis by category with visualizations
- **Loan Reports** — Active loans, payment schedules, and overdue tracking
- **Investment Reports** — Portfolio performance and allocation analysis

### Chart Types
- **Bar Charts** — Monthly income/expense comparisons
- **Pie Charts** — Category/partner/type distribution analysis
- **Line Charts** — Trend analysis over time (available in financial year reports)
- **Scatter Plots** — Correlation analysis (where applicable)

### Special Reports
- **Financial Year Report** — Comprehensive yearly analysis with:
  - Weekly/monthly/breakdowns
  - Month-over-month and year-over-year comparisons
  - Carry-forward calculations
  - Budget vs. actual tracking
- **Partner Activity** — Transaction history and balance evolution
- **Category Trends** — Spending patterns and seasonal variations
- **Cash Flow** — Inflow/outflow analysis with net position tracking

## ⚙️ Configuration & Customization

### Application Settings
Accessible via Settings page (protected by PIN):

#### General
- **Business Name** — [👑 Pro Feature] Display name for reports and exports
- **Currency** — Primary currency for display and reporting (INR, USD, EUR, GBP, AED, SAR)
- **Date Format** — Preferred date display format (DD/MM/MM, MM/DD/YYYY, etc.)
- **Language** — Interface language (English, Hindi, Marathi, Tamil, Telugu, Bengali)
- **Session Timeout** — Auto-logout delay (5-120 minutes, default 15 minutes)

#### Appearance
- **Theme** — Light / Dark / System (follows OS preference)
- **Accent Colors** — Brand colors customizable via CSS variables

#### Security
- **PIN Protection** — Enable/disable PIN requirement for app access
- **PIN Management** — Change PIN when needed (requires current PIN)
- **Auto-Lock Timer** — Adjustable inactivity timeout

## 📱 Installation as PWA

Money Meva can be installed as a progressive web app for native-like experience:

### Desktop (Chrome/Edge)
1. Look for the install icon (⬇️) in the address bar
2. Click the icon → Click "Install"
3. App opens in its own window like a native application

### Android (Chrome)
1. Tap the three-dot menu (⋮) → "Install app"
2. Confirm installation → App added to home screen

### iPhone/iPad (Safari)
1. Tap the Share button (☐↑) → "Add to Home Screen"
2. Tap "Add" in top-right corner
3. App appears on home screen with native icon

### Installation Benefits
- ✓ Faster startup (cached resources)
- ✓ Works offline after initial load
- ✓ App-like experience (no browser chrome)
- ✓ Automatic updates when new version available
- ✓ No app store fees or approval delays
- ✓ Direct access to latest features

## 🌐 Cloud & Professional Options

While Money Meva Classic offers complete offline functionality, professional versions are available:

### Cloud Sync Version
- **Real-time synchronization** across all devices
- **Automatic backups** to secure encrypted storage
- **Multi-user collaboration** with role-based permissions
- **Mobile apps** for iOS and Android
- **API access** for custom integrations
- **Contact**: info@marathimeva.com for pricing and setup

### WordPress Plugin Version
- **Self-hosted solution** for WordPress websites
- **Multi-user support** with WordPress role integration
- **Custom reporting** embedded in WordPress admin
- **Data sovereignty** — all data remains on your server
- **Contact**: info@marathimeva.com for licensing and setup

### Telegram Support & Updates
- **Announcements** — New feature releases and important updates
- **Support** — Direct assistance from development team
- **Community** — User discussions and tip sharing
- **Join**: t.me/marathimeva

## 📄 License

Money Meva Classic is proprietary software. All rights reserved.

© {{
  new Date().getFullYear()
}} Money Meva. All rights reserved.

## 💬 Support & Feedback

For questions, support, or feature requests:
- **Email**: info@marathimeva.com
- **Telegram**: t.me/marathimeva
- **Website**: www.marathimeva.com

Thank you for choosing Money Meva Classic for your financial management needs!