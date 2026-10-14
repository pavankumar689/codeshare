# SyncPad — Real-Time Shared Clipboard & Code Sharing Website

**SyncPad** is a production-ready, real-time shared clipboard and code-sharing web application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **CodeMirror 6**, and **Supabase Realtime**.

It enables instant cross-device sharing of source code, configuration files, multiline logs, JSON payloads, URLs, and notes. Content automatically persists to remote Supabase PostgreSQL storage and synchronizes instantly across all connected devices viewing the same workspace URL—without requiring a page refresh.

---

## Key Features

- **Instant Cross-Device Sync**: Real-time synchronization powered by Supabase Realtime (`postgres_changes` / Broadcast). Paste code on your laptop and watch it appear instantaneously on your phone or coworker's machine.
- **Developer-Grade Editor**: Full-featured **CodeMirror 6** editor with line numbers, bracket matching, active line highlighting, custom dark/light themes, and mobile touch support.
- **Comprehensive Syntax Highlighting**: Native syntax support for:
  - JavaScript (`.js`)
  - TypeScript (`.ts`)
  - Python (`.py`)
  - Java (`.java`)
  - C (`.c`)
  - C++ (`.cpp`)
  - HTML (`.html`)
  - CSS (`.css`)
  - JSON (`.json`)
  - SQL (`.sql`)
  - Markdown (`.md`)
  - Plain Text (`.txt`)
- **Safe Concurrency & Versioning**: Monotonically increasing document versioning (`version: bigint`) and atomic optimistic concurrency control prevent stale clients from silently overwriting newer updates. If two devices edit simultaneously, SyncPad detects the collision and offers a one-click resolution.
- **Robust Debouncing**: Automatic save requests are debounced at 400ms to preserve database throughput while providing sub-second persistence.
- **One-Click Sharing**: Workspaces are addressed via secure UUIDs (`/room/:workspaceId`). Share links are generated with one click, copying the direct link to the clipboard.
- **Full Offline & Reconnect Handling**: Clear connection badges (`Connected`, `Syncing`, `Offline`, `Error`). Reconnecting automatically pulls the latest server revision and reconciles it with local edits.
- **Productivity Toolbar**:
  - **Copy All**: Copies entire workspace buffer with visual toast feedback.
  - **Clear Workspace**: Protected by an accessible confirmation modal.
  - **Download Content**: Exports the workspace buffer as a text or source code file with the appropriate file extension for the selected language.
  - **Live Statistics**: Real-time word count, character count, line count, and last-saved timestamp.
  - **Theme Toggle**: Developer-focused dark mode (default) and clean light mode.

---

## Architecture & Concurrency Strategy

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     Client A (Laptop / Mac)     │           │      Client B (Phone / PC)      │
│  React + CodeMirror 6 Editor    │           │  React + CodeMirror 6 Editor    │
└────────────────┬────────────────┘           └────────────────▲────────────────┘
                 │                                             │
      Debounce 400ms & RPC                               Realtime Broadcast
     update_workspace_atomic                               (Postgres Changes)
                 │                                             │
                 ▼                                             │
      ┌────────────────────────────────────────────────────────┴┐
      │               Supabase PostgreSQL Database              │
      │   - workspaces table (id, content, language, version)   │
      │   - Row Level Security (RLS) policies                   │
      │   - Atomic optimistic locking & version checks          │
      └─────────────────────────────────────────────────────────┘
```

### Concurrency Model Details
1. **Document Revision**: Each workspace maintains a `version: bigint` initialized at `1`.
2. **Atomic Increment**: Content saves invoke `update_workspace_atomic(p_id, p_content, p_language, p_expected_version)`. If the current database version matches `p_expected_version`, the server updates the content and increments the version atomically.
3. **Collision Detection**: If another device committed a change in the meantime, the version check fails. The server returns the latest remote state without mutating the database. The client is notified immediately with a conflict notice and can choose to either overwrite or load the remote version.
4. **Extensibility**: The state model is modular and isolated from the editor view, allowing straightforward upgrade to CRDT-based character-level collaboration (e.g. Yjs / Automerge) in the future.

---

## Project Structure

```
codeshare/
├── .env.example                               # Environment variable documentation
├── .gitignore                                 # Git exclusions (.env, node_modules, dist)
├── index.html                                 # HTML entry point with favicon and SEO meta
├── netlify.toml                               # Netlify build configuration & SPA redirects
├── package.json                               # Dependencies and build/test scripts
├── public/
│   ├── _redirects                             # SPA fallback rule for Netlify
│   └── favicon.svg                            # Application favicon
├── src/
│   ├── components/
│   │   ├── ClearModal.tsx                     # Clear workspace confirmation dialog
│   │   ├── ConnectionStatusBadge.tsx          # Real-time connection badge
│   │   ├── Editor.tsx                         # CodeMirror 6 editor wrapper
│   │   ├── EnvNoticeBanner.tsx                # Onboarding guide when credentials are unset
│   │   ├── Header.tsx                         # Top header with logo, room ID, share, theme
│   │   ├── Toast.tsx                          # Floating feedback notifications
│   │   └── Toolbar.tsx                        # Toolbar with language select, stats, download
│   ├── hooks/
│   │   ├── useTheme.ts                        # Dark/light theme hook
│   │   └── useWorkspace.ts                    # Central hook for sync, debounce & concurrency
│   ├── pages/
│   │   ├── HomePage.tsx                       # Landing page with Create/Join room controls
│   │   ├── RoomPage.tsx                       # Main collaborative workspace route
│   │   └── NotFoundPage.tsx                   # 404 handler
│   ├── services/
│   │   ├── supabaseClient.ts                  # Safe Supabase client initialization
│   │   └── workspaceService.ts                # Database queries and atomic RPC caller
│   ├── tests/
│   │   ├── concurrency.test.ts                # Optimistic concurrency simulation tests
│   │   ├── debounce.test.ts                   # Debounce timing and cancel/flush tests
│   │   ├── languages.test.ts                  # Language configuration & extension tests
│   │   ├── stats.test.ts                      # Word, character, and line count tests
│   │   └── validation.test.ts                 # UUID validation and URL parsing tests
│   ├── types/
│   │   └── workspace.ts                       # Core TypeScript interfaces
│   ├── utils/
│   │   ├── debounce.ts                        # Reusable debounce utility
│   │   ├── languages.ts                       # CodeMirror language configs
│   │   ├── stats.ts                           # Text statistics calculations
│   │   └── validation.ts                      # UUID & URL validation
│   ├── App.tsx                                # React Router definitions
│   ├── index.css                              # Tailwind CSS v4 styling & scrollbar themes
│   └── main.tsx                               # React root entry point
├── supabase/
│   └── migrations/
│       └── 20240101000000_create_workspaces.sql # Full schema, RLS, functions, & Realtime
├── tsconfig.json                              # TypeScript compiler settings
└── vite.config.ts                             # Vite configuration with React & Tailwind
```

---

## Supabase Database Setup

To enable real-time database synchronization across devices:

1. Create a free account at [supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20240101000000_create_workspaces.sql` in this repository and paste the contents into the SQL Editor, then click **Run**.
4. The script automatically creates:
   - The `workspaces` table with `id (UUID)`, `content (text)`, `language (text)`, `version (bigint)`, `created_at`, and `updated_at`.
   - Row Level Security (RLS) policies allowing anonymous public SELECT, INSERT, and UPDATE.
   - The stored procedure `update_workspace_atomic` for concurrency verification.
   - Adds the `workspaces` table to the `supabase_realtime` publication.
5. In your Supabase dashboard, navigate to **Project Settings** → **API**.
6. Copy the **Project URL** and the **anon public API Key**.

---

## Environment Variables

Create a file named `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> [!WARNING]
> Vite variables prefixed with `VITE_` are embedded into client-side JavaScript bundles and are readable by anyone visiting the site.
> **Never put your secret `service_role` key in frontend environment variables.** Only use the public/anonymous client key. Security is enforced through Row Level Security (RLS) database policies.

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run unit tests
```bash
npm test
```
All 18 unit tests across 5 test suites run via Vitest.

### 4. Run linter
```bash
npm run lint
```

### 5. Build for production
```bash
npm run build
```
Creates an optimized, minified production build in the `dist` folder.

---

## Netlify Deployment Guide

SyncPad is preconfigured for zero-friction Netlify deployment:

1. Push this repository to **GitHub** (e.g. `https://github.com/your-username/syncpad`).
2. Log in to [Netlify](https://app.netlify.com) and click **Add new site** → **Import an existing project**.
3. Select **GitHub** and choose your repository.
4. Netlify will automatically detect settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Site configuration** → **Environment variables** → **Add a variable**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
6. Click **Deploy Site**.
7. Netlify will build and deploy your app with full client-side routing support for `/room/:workspaceId`.

---

## Anonymous Sharing & Security Disclaimer

> [!IMPORTANT]
> - SyncPad operates on an **anonymous workspace sharing model**: anyone holding a workspace link (`/room/:workspaceId`) can read and edit its content.
> - Workspaces are public by design.
> - **Do not use SyncPad as a secret store or password vault.** Do not paste private keys, production passwords, or sensitive financial data into public workspaces.

---

## License

MIT License. Free to use, adapt, and distribute.
