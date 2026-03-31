# Screens and Components Guidelines

This document describes how we structure screens and page-level UI. Screens stay thin and readable; page-specific UI is built from higher-level domain components. Following these patterns keeps the codebase maintainable and consistent.

---

## 0. State vs display (cross-cutting)

**Keep state management and display logic/syntax/JSX separate.**

- **Display components** (JSX, layout, styling) must not contain state-fetching or mutation logic. They receive **data** and **callbacks** via props only.
- **State and derived data** (React Query, local state, stores) live in **hooks** or **screens**, and are passed into presentational components as props.
- Do not mix `useQuery`, `useMutation`, or data-fetch calls inside the render/JSX of a presentational component; keep that in custom hooks or screen-level logic and pass results down.

**Why:** Clear separation makes components testable, reusable, and easier to reason about; state and side-effect logic stay in one place (hooks/screens or dedicated modules).

---

## 1. Screens as orchestrators

Screens own **route-level state**, **data hooks**, **page-level logic** (e.g. filtering, derived data), and **navigation**. They do not contain large blocks of inline JSX for distinct sections of the page.

- **Location:** `screens/[Feature]Screen.tsx`.
- **Responsibility:** Compose the page from domain components; pass data and callbacks as props.

**Example**

```tsx
// screens/LibraryScreen.tsx – thin orchestrator
export default function LibraryScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const { queries } = useLibraryApi();
  const { data: journeysData = [] } = queries.libraryJourneys;
  const filteredJourneys = useMemo(() => { /* filter by searchTerm */ }, [journeysData, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <LibraryPageHeader journeyCount={journeysData.length} reflectionCount={totalReflections} />
        <LibraryActionsBar searchTerm={searchTerm} onSearchChange={setSearchTerm} onNewJourney={() => router.push("/create-journey")} />
        <div className="space-y-6">
          {filteredJourneys.map((journey) => (
            <LibraryJourneyCard key={journey.id} journey={journey} onOpen={openJourney} />
          ))}
        </div>
        {filteredJourneys.length === 0 && <LibraryEmptyState ... />}
      </div>
    </div>
  );
}
```

**Why:** The screen file acts as a "table of contents" for the page. You see at a glance what data, state, and sections the page uses. Changes to how a section looks or behaves live in the domain component, not in the screen.

---

## 2. Higher-level components in domain

Page sections (headers, action bars, cards, empty states) live under **domain components**, with a **barrel export**.

- **Location:** `domain/[domain]/components/` (e.g. `domain/library/components/`).
- **Barrel:** `domain/[domain]/components/index.ts` re-exports all public components.

**Example**

```
domain/library/components/
  LibraryPageHeader.tsx
  LibraryActionsBar.tsx
  LibraryJourneyCard.tsx
  LibraryEmptyState.tsx
  index.ts          → export { LibraryPageHeader, LibraryActionsBar, ... }
```

Screens import from the barrel: `import { LibraryPageHeader, LibraryActionsBar, ... } from "@/domain/library/components";`

**Why:** Domain components are colocated with their types and hooks. One place to change "library journey card" or "library empty state"; the screen stays stable.

---

## 3. Domain vs main components folder

**Domain-specific components** must live in **`domain/[domain]/components/`**. Any UI that belongs to a single domain (e.g. reflection editor entry, reflection canvas, library journey card) goes in that domain’s components folder.

**Only cross-domain (shared) components** belong in the main **`components/`** folder. Examples:
- **`components/ui/`** – shared primitives (buttons, inputs, dialogs, etc.) used by many domains.
- **`components/layout/`** – app shell, header, sidebar, navigation.
- Other shared pieces used by more than one domain (e.g. a shared Bible reader panel used by reflections and another feature).

When adding a new component, ask: “Is this used by one domain only?” If yes, put it in `domain/[domain]/components/`. If it’s shared across domains or is a generic UI primitive, put it in `components/`.

---

## 4. What screens own

Screens are responsible for:

- **State:** `useState` for route-level UI state (e.g. search term, filters).
- **Derived data:** `useMemo` (and similar) for filtered or computed data used by the page.
- **Data hooks:** Calls to `useGetX`, `useXApi`, etc., and passing `data` (or derived data) into components.
- **Event handlers:** Navigation (e.g. `router.push`), mutations (e.g. `mutate`), or callbacks that coordinate multiple actions. Pass these as props to domain components.
- **Composition:** The layout wrapper (e.g. `min-h-screen`, max-width container) and the tree of domain components. No large inline JSX for a full section (header, card, list item, etc.).

**Why:** Keeps the screen file short and focused on "what this page does" rather than "how each block is implemented."

---

## 5. What domain components own

Domain components are responsible for:

- **Presentational structure:** The markup and layout for one part of the page (e.g. a single journey card, the library header, the search bar).
- **Behavior that is local to that block:** e.g. button clicks that call an `onOpen` or `onNewJourney` prop.
- **Props:** They receive **data** and **callbacks** via props. They do not use route state (e.g. `useRouter` for business logic) or global state unless that is an explicit requirement; the screen passes what is needed.

**Example**

```tsx
// domain/library/components/LibraryJourneyCard.tsx
interface LibraryJourneyCardProps {
  journey: LibraryJourney;
  onOpen: (journey: LibraryJourney) => void;
}
export function LibraryJourneyCard({ journey, onOpen }: LibraryJourneyCardProps) {
  // Only presentation and calling onOpen(journey) on click
}
```

**Why:** Components stay testable and reusable; the screen remains the single place that wires data and navigation.

---

## 6. Naming and location

- **Screens:** `screens/[Feature]Screen.tsx` (e.g. `LibraryScreen.tsx`, `GuideListScreen.tsx`). One screen per major route or feature page.
- **Domain components:** `domain/[domain]/components/[Purpose][Domain]Or[Feature].tsx` (e.g. `LibraryPageHeader.tsx`, `LibraryJourneyCard.tsx`, `LibraryEmptyState.tsx`). Name by purpose so the screen’s JSX is self-explanatory.

**Why:** Consistent naming makes it easy to find the component that backs a given part of the page and to add new sections in the right place.

---

## 7. Summary checklist

For each new or refactored screen:

- [ ] Screen file is under 100 lines where possible; no large inline JSX blocks for full page sections.
- [ ] Route-level state and data hooks live in the screen; derived data is computed in the screen (e.g. `useMemo`).
- [ ] Page sections are implemented as components in `domain/[domain]/components/`.
- [ ] Domain components receive data and callbacks via props; they do not own route or global state.
- [ ] Domain components are exported from `domain/[domain]/components/index.ts`.
- [ ] Screen composes only: layout wrapper + domain components (and simple wrappers like `div` with layout classes).

**Reference implementations:** `screens/LibraryScreen.tsx`, `screens/GuideListScreen.tsx`, and `domain/library/components/`.

---

## 8. Ontology domain example

For the ontology (Spydr) use case, screens and domain components follow the same patterns:

- **Screens:** `screens/OntologyDashboardScreen.tsx` (list ontologies, create/edit/delete), `screens/OntologyCanvasScreen.tsx` (ontology canvas + optional document editor). One screen per major route.
- **Domain:** `domain/ontology/components/` with a barrel `index.ts`. Examples:
  - `OntologyListHeader.tsx`, `OntologyCard.tsx`, `OntologyEmptyState.tsx` (dashboard).
  - `OntologyFlowCanvas.tsx`, `OntologyNode.tsx`, `OntologyEdge.tsx`, `NodeDocumentEditor.tsx`, `NodeTypeSelector.tsx`, `CustomNodeTypeModal.tsx`, `DirectoryTree.tsx`, `CommandBar.tsx`, `CanvasNavigator.tsx` (canvas).
- Screens import from the barrel: `import { OntologyCard, OntologyFlowCanvas, ... } from "@/domain/ontology/components";`
- Naming: `[Purpose][Domain]Or[Feature].tsx` (e.g. `OntologyPageHeader`, `OntologyCard`, `NodeDocumentEditor`).
