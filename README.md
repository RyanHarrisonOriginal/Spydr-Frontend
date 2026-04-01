# Spydr Ontology — Frontend

React + Vite + TypeScript app for mapping thoughts, projects, and notes as an **ontology graph** on a canvas. This README documents **design philosophy** and how **handlers** are organized.

## Design philosophy

### Product feel

- **Warm paper / journal** — Light UI with readable contrast, subtle borders, and a canvas that feels like a workspace, not a generic dashboard.
- **Neo-brutal clarity** — Borders and structure are intentional; panels and nodes read clearly at a glance.
- **Second-brain, not slides** — The canvas is the primary surface; navigation and documents support thinking in **trees** (parent → children) and **types** (thought, idea, project, etc.).

### Technical principles

1. **Thin screens, fat hooks** — Route components in `src/screens/` mostly compose layout. Ontology canvas logic lives in `useOntologyCanvas` and domain hooks, not in large JSX blocks.
2. **Single domain module** — Ontology UI, hooks, utils, and context live under `src/domain/ontology/` for predictable imports and feature boundaries.
3. **Server state via TanStack Query** — Reads and writes go through `useOntologyApi` (queries + mutations). Optimistic or batched updates (e.g. positions) are explicit and scoped.
4. **Layout as events** — After structural changes (add, delete, move, expand, height), `nodeLayoutEvents` notifies `NodePositionObserver` (see `useNodeLayoutObserver.ts`) so sibling subtrees reposition without duplicating layout math in every handler.
5. **Auth at the edge** — Clerk wraps the app in `src/main.tsx`. `RequireAuth` in `src/components/RequireAuth.tsx` guards routes. `ApiAuthSync` in `src/components/ApiAuthSync.tsx` (mounted in `App.tsx`) sets the token getter for `api.ts` so `fetch` calls can send `Authorization: Bearer` without components touching tokens.
6. **Resizable UI by contract** — `react-resizable-panels` uses **strings** for percentage sizes (numbers are pixels). Document and canvas areas use `min-w-0` / `min-h-0` so flex children do not clip content.
7. **Theming** — Design tokens live in `src/index.css`. Clerk aligns via `src/lib/clerkAppearance.ts` and `ClerkProvider`'s `appearance` prop in `main.tsx`.

## Architecture overview

```text
src/
├── main.tsx                 # createRoot, ClerkProvider, appearance, App
├── App.tsx                  # ThemeProvider, ApiAuthSync, QueryClientProvider, BrowserRouter, Routes
├── components/              # Shared UI (RequireAuth, ApiAuthSync, ThemeProvider, …)
├── lib/                     # clerkAppearance.ts (Clerk theme)
├── screens/                 # OntologyDashboardScreen, OntologyCanvasScreen, SignIn/SignUp, 404
└── domain/ontology/
    ├── components/          # OntologyFlowCanvas, OntologyNode, CommandBar, CanvasNavigator, …
    ├── context/             # OntologyFlowContext
    ├── hooks/               # Queries, mutations, useOntologyCanvas, canvas handlers, layout
    └── utils/               # api.ts, treeUtils, nodePositioning, nodeLayoutEvents, …
```

## Handlers and responsibilities

Handlers are **functions that carry user intent to the server or layout system**, implemented as hooks and React Query mutations—not a separate `handlers/` directory.

Paths below are under `src/domain/ontology/` unless noted.

### `useOntologyCanvas` (`hooks/useOntologyCanvas.ts`)

Orchestrates the **ontology canvas screen** (`src/screens/OntologyCanvasScreen.tsx`):

- Reads `ontologyId` from the route; loads ontology and node types via `useOntologyApi`.
- UI state: `editingNodeId` (document panel), `selectedNodePayload` (command bar).
- Composes `useBatchedPositionUpdates`, `useCanvasNodeHandlers`, and `useCanvasActions`.
- Exposes `flowContextValue` for `OntologyFlowProvider`.

### `useCanvasNodeHandlers` (`hooks/useCanvasNodeHandlers.ts`)

| Handler | Role |
| --- | --- |
| `onUpdateNode` | PATCH node fields. Emits layout events for height and expand; when expanding, emits scope-to-subtree after a delay. |
| `onCreateNode` | POST new node; default child position when needed; on success emits node-added and fit-view-to-subtree for parent. |
| `onDeleteNode` | DELETE node; on success emits node-deleted. |
| `onSaveNotes` | PATCH `notes` from the document editor. |
| `moveNodeWithLayout` | PATCH reparent; on success emits node-moved. Used by indent and reparent flows. |

### `useCanvasActions` (`hooks/useCanvasActions.ts`)

| Handler | Role |
| --- | --- |
| `onMoveNodeUp` / `onMoveNodeDown` | Swap position with sibling above/below via `onUpdateNodePosition` (batched). |
| `onIndent` | Reparent to sibling above via `moveNodeWithLayout`. |

### Canvas drag (`components/OntologyFlowCanvas.tsx`)

`onNodeDragStop` calls `onUpdateNodePosition` so dragged positions persist through the batched updater.

### `useBatchedPositionUpdates` (`hooks/useBatchedPositionUpdates.ts`)

`onUpdateNodePosition` batches updates per animation frame: updates React Query cache for the ontology, then one `updateNode` mutation per changed node. Used for drag and move up/down.

### Layout observer (`hooks/useNodeLayoutObserver.ts`)

`useNodeLayoutObserver` subscribes to `nodeLayoutEvents` and repositions sibling subtrees. **`NodePositionObserver`** (same file) is a renderless component that runs the hook inside the flow tree; it is mounted in `OntologyFlowCanvas.tsx`.

### API surface (`hooks/useOntologyApi.ts`, `queries.ts`, `mutations.ts`, `utils/api.ts`)

| Area | Responsibility |
| --- | --- |
| `utils/api.ts` | `fetch` helper, `VITE_API_URL`, `setAuthTokenGetter` for Clerk JWT. |
| Queries | Ontology list, single ontology, node types. |
| Mutations | Ontology CRUD; node create/update/delete/move/merge; node-type CRUD. |

UI should call context methods or props that flow through these mutations, not ad-hoc `fetch` outside `api.ts`.

### `ApiAuthSync` (`src/components/ApiAuthSync.tsx`)

Registers Clerk's session token with `setAuthTokenGetter` from `src/domain/ontology/utils/api.ts`.

## Layout events

**File:** `src/domain/ontology/utils/nodeLayoutEvents.ts`

Events include `node:added`, `node:deleted`, `node:moved`, `node:toggled`, `node:heightChanged`, plus `canvas:fitToSubtree` and `canvas:scopeToSubtree`. `OntologyFlowCanvas.tsx` mounts listeners (`FitToSubtreeListener`, `ScopeToSubtreeListener`) for fit/scope viewport behavior.

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base (default in code: `http://localhost:3001/api`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

Copy `.env.example` to `.env.local` and set values. `.env.local` is gitignored.

## Deploy on Render (static site)

- **Publish directory:** `dist` (Vite output; not `build`).
- **Client-side routes** (`/sign-in`, `/ontology/:id`, …): add a **rewrite** so deep links work — **Source** `/*`, **Destination** `/index.html`, **Action** Rewrite ([docs](https://render.com/docs/redirects-rewrites)). Alternatively use the repo’s `render.yaml` with a Render Blueprint.
- Set **`VITE_CLERK_PUBLISHABLE_KEY`** and **`VITE_API_URL`** in the service **Environment** tab for production.

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # Typecheck + production build
npm run preview  # Preview production build
npm run lint     # ESLint
```
