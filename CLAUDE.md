# NeuroVault — Project Guide

## What is this?

An AI & Browser Security Platform that monitors AI tool usage across organizations via a Chrome extension, enforces policies (monitor/warn/block), and provides analytics through a dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Styling:** Tailwind CSS 4 + Radix UI primitives
- **Charts:** Recharts
- **Icons:** HugeIcons + Lucide React
- **Extension:** Chrome Manifest V3, esbuild, vanilla TS

## Architecture

```
neuro-vault/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public landing pages (/, /request-a-demo)
│   ├── (auth)/                   # Login, signup, auth callback
│   ├── (dashboard)/dashboard/    # Protected admin dashboard
│   └── api/
│       ├── dashboard/            # Dashboard API (session auth via cookies)
│       ├── extension/            # Extension API (Bearer token auth)
│       └── organizations/        # Org management
│
├── components/
│   ├── ui/                       # Shared primitives (60+ Radix-based components)
│   ├── marketing/                # Navbar, AuthNavButtons (marketing-only)
│   └── dashboard/                # AppSidebar, TopBar (dashboard-only)
│
├── lib/
│   ├── supabase/                 # Supabase clients (client, server, admin, middleware)
│   ├── extension-auth.ts         # Bearer token validation for extension API
│   ├── validators.ts             # Zod schemas (signup, login, activity report, policy)
│   └── utils.ts                  # cn() utility
│
├── extension/                    # Chrome Extension (separate package)
│   ├── src/
│   │   ├── background/           # Service worker, tab monitor, activity tracker, policy engine
│   │   ├── popup/                # Extension popup UI (HTML/CSS/TS)
│   │   ├── content/              # Content script (paste/upload/download detection)
│   │   ├── blocked/              # Blocked page interstitial
│   │   └── shared/               # Types, API client, storage helpers, constants
│   ├── manifest.json
│   └── dist/                     # Build output (gitignored)
│
├── types/index.ts                # Shared TypeScript interfaces
├── constants/icons.tsx           # Marketing page icon config
├── hooks/                        # React hooks (useInView, useMobile)
└── supabase/migrations/          # Database schema
```

## Key Conventions

- **Route groups** separate concerns: `(marketing)`, `(auth)`, `(dashboard)`
- **API auth:** Dashboard routes use Supabase session cookies. Extension routes use Bearer tokens via `lib/extension-auth.ts` + admin client (bypasses RLS).
- **Supabase clients:** `client.ts` (browser), `server.ts` (server components, cookie-based), `admin.ts` (service role, bypasses RLS)
- **UI components** in `components/ui/` are shared across all domains. Don't put domain-specific components there.
- **Extension** is a standalone package with its own `package.json`, `tsconfig.json`, and esbuild build.

## Commands

```bash
# Web app
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build

# Chrome extension
cd extension
npm install              # First time only
npm run build            # Build to dist/
npm run watch            # Watch mode for development
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...           # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=...          # Service role key (server-only, bypasses RLS)
```

## Database Tables

- `organizations`, `profiles`, `org_members` — multi-tenant org model
- `ai_tools` — catalog of known AI tools (seeded with 13 tools)
- `activity_events` — user activity log from extension
- `policies` — org-level monitor/warn/block rules
- `extension_tokens` — extension auth tokens
- `active_sessions` — real-time open AI tool tabs (heartbeat)
- `access_requests` — user requests for access to blocked tools
- `alert_rules`, `alerts` — alerting engine
