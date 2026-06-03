# Sample School

A read-only web mirror for **Sample School** (`school-29-march-26`). It displays the same Firestore data that the Electron desktop app syncs in real time.

- **GitHub**: [calvinhicco/sample-school-29March26](https://github.com/calvinhicco/sample-school-29March26)
- **Vercel**: [sample-school-29-march26](https://vercel.com/lisachicco100-5111s-projects/sample-school-29-march26)
- **Firebase**: [school-29-march-26](https://console.firebase.google.com/project/school-29-march-26)

## Features

- **Dashboard**: Real-time totals (students, expenses, extra billing, outstanding)
- **Students**: View records synced from the desktop app
- **Expenses**: Monthly expense views
- **Extra Billing**: Additional billing entries
- **Outstanding**: Pre-calculated outstanding balances from Electron sync

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Firebase Firestore (client SDK, read-only)
- **Desktop source of truth**: Electron app with Firebase Admin sync
- **Deployment**: Vercel

## Firestore collections (Electron → mirror)

| Collection | Purpose |
|------------|---------|
| `students` | Active students |
| `settings` / doc `app` | School name, billing cycle, class groups |
| `expenses` | Expense records |
| `extraBilling` | Extra billing pages |
| `outstandingStudents` | Pre-calculated outstanding list |
| `transferredStudents`, `pendingPromoted`, `staff`, `staffLogs` | Synced by desktop; not all exposed in mirror UI |

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project `school-29-march-26` with Firestore enabled
- Electron app configured with `firebase-service-account.json` for the same project

### Installation

```bash
git clone https://github.com/calvinhicco/sample-school-29March26.git
cd sample-school-29March26
npm install
cp .env.example .env.local
```

Fill `.env.local` with the **Web app** config from Firebase Console (Project settings → Your apps). All `NEXT_PUBLIC_FIREBASE_*` values must be from the same web app registration as the desktop mirror target.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

Set these environment variables in the Vercel project (must match Electron / `.env.local`):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

Redeploy after changing env vars.

## Project Structure

```
├── app/                 # Next.js routes
├── components/          # UI (Nav, dashboard cards, etc.)
├── lib/
│   ├── firebase.ts      # Firestore client
│   └── realtime.ts      # Read/subscribe helpers
└── types/               # Shared TypeScript types
```

## Contributing

This mirror is **read-only**. Data changes are made only in the Electron desktop application, which syncs to Firestore.

## License

Private - Sample School Management System
