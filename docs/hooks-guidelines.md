# Hooks Guidelines

This document describes how we structure and expose hooks in each domain. Following these patterns keeps domains consistent, testable, and easy to navigate.

For how screens and domain components are structured, see [screens-and-components-guidelines.md](screens-and-components-guidelines.md).

---

## 1. One entry-point API hook per domain

Each domain has **one** main hook that exposes all mutations and queries for that domain.

- **Name:** `use[Domain]Api` (e.g. `useDraftsApi`, `useJourneyApi`).
- **Location:** `domain/[domain-name]/hooks/use[Domain]Api.ts`.
- **Returns:** An object with `mutations` and `queries` (and optionally `options` types).

**Example**

```ts
// Prefer this: one hook, structured return
const { mutations, queries } = useDraftsApi({ draftKey, userId: 1 });
mutations.autosave(payload);
mutations.publishDraft.mutate();
const { data } = queries.draft;
```

**Why:** One place to see everything a domain can do; consistent API across domains; easy to add auth or shared options later.

---

## 2. Entry point return shape

The entry-point hook always returns an object with at least:

- **`mutations`** – object of mutation hooks/results (e.g. `autosave`, `publishDraft`, `createJourney`).
- **`queries`** – object of query results (e.g. `draft`, `userDrafts`).

Optional: accept an `options` argument (e.g. `draftKey`, `userId`) so the hook can pass them into the right sub-hooks.

**Example**

```ts
export function useJourneyApi() {
  const createJourneyMutation = useCreateJourneyMutation();
  return {
    mutations: {
      createJourney: createJourneyMutation,
    },
  };
}

export function useDraftsApi(options: UseDraftsApiOptions = {}) {
  const { draftKey = null, userId = 0 } = options;
  // ...
  return {
    mutations: { autosave, publishDraft: publishDraftMutation },
    queries: { draft: draftQuery, userDrafts: userDraftsQuery },
  };
}
```

---

## 3. Mutations in one module

All mutation-related hooks for a domain live in a single module.

- **File:** `domain/[domain]/hooks/mutations.ts`.
- **Content:** Re-export every mutation hook (and optionally compose helpers like `useAutoSaveDraft`).
- **Naming:** Individual hooks are named `use[Xxx]Mutation` (e.g. `useSaveDraftMutation`, `useCreateJourneyMutation`).

**Example**

```ts
// domain/guide-draft/hooks/mutations.ts
export { useSaveDraftMutation } from "./useSaveDraftMutation";
export type { SaveDraftParams } from "./useSaveDraftMutation";
export { usePublishDraftMutation } from "./usePublishDraftMutation";
export { useDebouncedAutosave } from "./useDebouncedAutosave";
export const useAutoSaveDraft = (draftKey: string | null) => {
  const autosave = useDebouncedAutosave(draftKey);
  return { autosave };
};
```

**Why:** One place to find all mutations; clear split between “mutations” and “queries”; easy to add new mutations in one file + one export.

---

## 4. Queries in one module

All query hooks for a domain live in a single module.

- **File:** `domain/[domain]/hooks/queries.ts`.
- **Content:** Define or re-export every query hook (e.g. `useGetDraft`, `useGetUserDrafts`).

**Example**

```ts
// domain/guide-draft/hooks/queries.ts
export const useGetDraft = (draftKey: string) =>
  useQuery({ queryKey: ["draft", draftKey], queryFn: () => DraftApiService.getDraft(draftKey), ... });

export const useGetUserDrafts = (userId: number) =>
  useQuery({ queryKey: ["userDrafts", userId], queryFn: () => DraftApiService.getUserDrafts(userId), ... });
```

**Why:** Same as mutations: one place for all reads; clear separation from mutations.

---

## 5. One file per mutation hook

Each mutation has its own file.

- **File:** `domain/[domain]/hooks/use[Xxx]Mutation.ts`.
- **Content:** A single hook that uses `useMutation` and, if needed, cache updates or navigation.

**Example**

```ts
// domain/journeys/hooks/useCreateJourneyMutation.ts
export function useCreateJourneyMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload) => JourneyApiService.createJourney(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      router.push("/guides");
    },
  });
}
```

**Why:** Easier to read and test; clear responsibility per file; `mutations.ts` stays a thin re-export layer.

---

## 6. Cache and side-effect logic in utils

Logic that updates cache or derives data from API responses should live in **pure functions** in a `utils` (or similar) module, not inside hooks.

- **Location:** `domain/[domain]/utils/` (e.g. `draftCacheUtils.ts`).
- **Usage:** Mutation hooks call these functions in `onSuccess` (e.g. when updating React Query cache).

**Example**

```ts
// domain/guide-draft/utils/draftCacheUtils.ts
export function mergeSavedDraftIntoUserDrafts(old, savedDraft) { ... }
export function removeDraftFromUserDrafts(old, draftKey) { ... }
```

**Why:** Pure functions are easy to test and reuse; hooks stay thin and focused on React/React Query.

---

## 7. Backward compatibility re-exports

The entry-point file re-exports individual hooks so existing code can keep using them.

- **Location:** At the bottom of `use[Domain]Api.ts`.
- **Example:** `export { useAutoSaveDraft, usePublishDraft } from "./mutations";` and `export { useGetDraft, useGetUserDrafts } from "./queries";`

**Why:** Migrate to the entry point gradually; no big-bang refactor; one import path for “everything from this domain.”

---

## 8. Summary checklist

For each domain that follows these guidelines:

- [ ] One entry-point hook: `use[Domain]Api.ts`, returning `{ mutations, queries }`.
- [ ] All mutations re-exported from `mutations.ts`; one file per mutation hook (`use[Xxx]Mutation.ts`).
- [ ] All queries in `queries.ts`.
- [ ] Cache/API response logic in `utils` as pure functions.
- [ ] Entry-point file re-exports individual hooks for backward compatibility.

**Reference implementations:** `domain/guide-draft/hooks`, `domain/journeys/hooks`, `domain/guide/hooks`, and `domain/bible/hooks`.

---

## 9. Ontology domain API shape

For the ontology domain, the entry-point hook and data flow are:

- **Entry point:** `domain/ontology/hooks/useOntologyApi.ts`. Accepts optional `options` (e.g. `ontologyId` for canvas scope).
- **Returns:** `{ mutations, queries }`.
  - **mutations:** `createOntology`, `updateOntology`, `deleteOntology`, `createNode`, `updateNode`, `updateNodePosition`, `deleteNode`, `moveNode`, `mergeNodes`, plus custom node type CRUD (`addCustomNodeType`, `updateCustomNodeType`, `deleteCustomNodeType`). Each is a mutation hook or function used by screens.
  - **queries:** `ontologies` (list), `ontology` (single ontology with nodes and customNodeTypes when `ontologyId` provided), `nodeSchemas` (built-in types; may come from API or local config).
- **Data source:** Ontology and node data is **server-backed** (React Query). Do not persist ontology or node entities in browser storage; use the backend API. Browser storage is only for client-only UI preferences (e.g. canvas zoom/offset, expanded nodes, editor panel state) as documented in [browser-storage.md](browser-storage.md).
