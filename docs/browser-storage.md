# Browser storage

This project uses the browser’s `localStorage` and `sessionStorage` for **client-only, non-sensitive** state that should survive reloads or live only for the session.

## Standard

- **API**: Use the helpers in `lib/browserStorage.ts`: `getStored`, `setStored`, `removeStored`. All keys are prefixed with `bible-jot:` so app data is identifiable and doesn’t clash with other origins.
- **Values**: Must be JSON-serializable. Do not store secrets or tokens; use secure, httpOnly cookies or auth libraries for those.
- **SSR**: Helpers are safe during SSR (no-op when `window` is undefined).

## When to use which

| Use case | Backend | Example |
|----------|---------|--------|
| Persist across tabs and browser restarts | `localStorage` | Reflection editor: which Bible panels are open for a given reflection |
| Single-tab or “this session only” | `sessionStorage` | Guide draft: current draft key for “create guide” flow |

## Key naming

- Use a short, namespaced key: `reflection-editor:panels`, `guide:draft:current`, etc.
- For per-entity state, include the entity id: `reflection-editor:panels:${journeyId}` or `reflection-editor:panels:guide:${guideId}:${journeyName}`.
- Document new keys in this file or in the module that defines them.

## Existing keys

| Key pattern | Backend | Purpose |
|-------------|---------|--------|
| `reflection-editor:panels:<key>` | localStorage | Cached Bible reader panel configs + maxPanels per reflection (see `domain/reflections/utils/reflectionEditorPanelCache.ts`) |
| `guide:draft:current` | sessionStorage | Current draft key for create-guide flow (see `domain/guide-draft/utility.ts`) |

## Ontology domain (Spydr)

Ontology and node **data** lives in the **backend** and is served to the frontend via React Query. Do **not** store ontology entities or node entities in localStorage or sessionStorage.

Use browser storage only for **client-only UI state** that is optional to persist, for example:

- Canvas viewport (zoom, offset) for a given ontology.
- Expanded/collapsed node ids for the tree or canvas.
- Document editor panel open/closed or size for a node.

**Key namespace:** Use a short prefix for ontology-related keys, e.g. `ontology:canvas:${ontologyId}`, `ontology:editor:${nodeId}`, or `ontology:expanded:${ontologyId}`. Document new keys in this file or in the module that defines them.

| Key pattern | Backend | Purpose |
|-------------|---------|--------|
| `ontology:canvas:${ontologyId}` | localStorage | Canvas zoom, offset, or other viewport preferences per ontology |
| `ontology:expanded:${ontologyId}` | sessionStorage or localStorage | Set of expanded node ids for tree/canvas (optional) |
| `ontology:editor:${nodeId}` | sessionStorage | Document editor panel state for a node (optional) |

## Other “cache” in the app

- **React Query cache**: In-memory only; used for API data (e.g. library journeys, guide list, ontologies and nodes). Not browser storage.
- **Library / draft “cache” utils**: Pure functions that update React Query cache or in-memory state after mutations. Not browser storage.
