# FlashDash

A mobile-first PWA for service businesses to log jobs, track status, and generate PDF invoices — all offline, all local, no server required.

## What It Does

FlashDash is built for solo operators and small service businesses (detailers, cleaners, handymen, mobile mechanics, etc.) who need a fast way to create jobs on the go, track what's done and what's paid, and send professional invoices without touching a laptop.

Open the app, tap a few service buttons, enter a client name, hit **Create Job** — done. Invoice PDF is one tap away.

## Who It's For

Service business owners who work in the field and need to log jobs fast. Built for mobile, works without internet, and installs to the home screen like a native app.

## Key Features

- **Instant job creation** — tap pre-set service buttons to add services, set client info, and create a job in seconds
- **Service presets** — configure your service menu (name + price) in Settings; presets load as tappable buttons on the New Job screen
- **Status tracking** — cycle jobs through In Progress → Completed → Paid with a single tap
- **PDF invoice generation** — one-tap invoice download with job details, services, total, and your business info (via jsPDF)
- **Business branding** — add your business name, phone, email, logo, and Stripe payment link — all baked into every invoice
- **Offline-first** — all data stored locally using Dexie.js (IndexedDB); works with no internet connection
- **PWA installable** — add to Home Screen on iOS or Android; works like a native app with no app store required
- **Dark UI** — mobile-optimized dark theme designed for bright outdoor environments

## Tech Stack

- React 18
- Vite
- Dexie.js (IndexedDB wrapper for offline data)
- dexie-react-hooks (live reactive queries)
- jsPDF (client-side PDF generation)
- Lucide React (icons)
- Tailwind CSS
- PWA-ready (Web App Manifest + service worker)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — or scan the local network URL on your phone for mobile testing.

**First-time setup:**
1. Go to **Settings** → fill in your business name, phone, email, and Stripe link
2. Upload your logo (shown on invoices)
3. Set up your service menu under **Service Menu** — add each service with its price
4. Tap **New Job**, select services, enter client info, and hit Create

## Data & Privacy

Everything is stored on-device in IndexedDB via Dexie. No accounts. No backend. No data sent anywhere.