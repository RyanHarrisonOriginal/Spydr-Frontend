/**
 * Generic, config-driven collection view model.
 *
 * A `CollectionConfig<T>` declares how a list of entities can be searched,
 * filtered (via multi-select facets) and sorted. All logic here is pure so it
 * can be unit-tested and reused across every collection page (projects, tasks,
 * people, ideas, notes, decisions, resources).
 *
 * UI state (`CollectionViewState`) is intentionally serializable so it can be
 * persisted to localStorage without transformation.
 */

export type SortDirection = "asc" | "desc";

export type SortValueType = "text" | "number" | "date";

/** Sentinel facet value representing "no value assigned" (e.g. no area). */
export const UNASSIGNED_FILTER_VALUE = "__unassigned__";

export interface FacetOption {
  value: string;
  label: string;
  /** Optional class applied to the option row in the filter menu. */
  itemClassName?: string;
}

export interface FacetDef<T> {
  id: string;
  label: string;
  /** Resolve the selectable options, optionally derived from the data set. */
  options: (items: T[]) => FacetOption[];
  /** Resolve the facet value(s) an item belongs to. `null`/`[]` => unassigned. */
  valueOf: (item: T) => string | string[] | null | undefined;
}

export interface SortDef<T> {
  id: string;
  label: string;
  /** Value used for comparison. `null`/`undefined`/"" always sorts last. */
  accessor: (item: T) => string | number | null | undefined;
  type?: SortValueType;
  defaultDirection?: SortDirection;
}

export interface CollectionConfig<T> {
  /** Stable identifier used to namespace persisted state. */
  storageKey: string;
  /** Plural noun used in the result count label (e.g. "projects"). */
  noun: string;
  searchPlaceholder?: string;
  /** Free-text searched against this string (case-insensitive). */
  searchText: (item: T) => string;
  facets: FacetDef<T>[];
  sorts: SortDef<T>[];
  defaultSortId: string;
}

export interface CollectionSortState {
  columnId: string;
  direction: SortDirection;
}

export interface CollectionViewState {
  search: string;
  selections: Record<string, string[]>;
  sort: CollectionSortState;
}

export interface ActiveFilterChip {
  facetId: string;
  facetLabel: string;
  value: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Defaults & persistence safety
// ---------------------------------------------------------------------------

export function defaultSortState<T>(config: CollectionConfig<T>): CollectionSortState {
  const def =
    config.sorts.find((sort) => sort.id === config.defaultSortId) ?? config.sorts[0];
  return {
    columnId: def?.id ?? config.defaultSortId,
    direction: def?.defaultDirection ?? "asc",
  };
}

export function createDefaultState<T>(config: CollectionConfig<T>): CollectionViewState {
  return { search: "", selections: {}, sort: defaultSortState(config) };
}

/**
 * Reconcile a persisted (and therefore untrusted) value against the current
 * config. Unknown facets, columns and malformed shapes are dropped so a config
 * change can never crash or leave the user stuck with an invalid filter.
 */
export function sanitizeState<T>(
  config: CollectionConfig<T>,
  raw: unknown,
  fallback: CollectionViewState
): CollectionViewState {
  if (!raw || typeof raw !== "object") return fallback;
  const value = raw as Partial<CollectionViewState>;

  const facetIds = new Set(config.facets.map((facet) => facet.id));
  const selections: Record<string, string[]> = {};
  for (const [facetId, values] of Object.entries(value.selections ?? {})) {
    if (!facetIds.has(facetId) || !Array.isArray(values)) continue;
    const cleaned = values.filter((entry): entry is string => typeof entry === "string");
    if (cleaned.length > 0) selections[facetId] = cleaned;
  }

  const sortDef = config.sorts.find((sort) => sort.id === value.sort?.columnId);
  const sort: CollectionSortState = sortDef
    ? {
        columnId: sortDef.id,
        direction:
          value.sort?.direction === "asc" || value.sort?.direction === "desc"
            ? value.sort.direction
            : sortDef.defaultDirection ?? "asc",
      }
    : defaultSortState(config);

  return {
    search: typeof value.search === "string" ? value.search : "",
    selections,
    sort,
  };
}

// ---------------------------------------------------------------------------
// State transitions (pure)
// ---------------------------------------------------------------------------

export function getSelection(state: CollectionViewState, facetId: string): string[] {
  return state.selections[facetId] ?? [];
}

export function setSearch(state: CollectionViewState, search: string): CollectionViewState {
  return { ...state, search };
}

export function toggleFacetValue(
  state: CollectionViewState,
  facetId: string,
  value: string
): CollectionViewState {
  const current = getSelection(state, facetId);
  const next = current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];

  const selections = { ...state.selections };
  if (next.length === 0) {
    delete selections[facetId];
  } else {
    selections[facetId] = next;
  }
  return { ...state, selections };
}

export function removeFacetValue(
  state: CollectionViewState,
  facetId: string,
  value: string
): CollectionViewState {
  if (!getSelection(state, facetId).includes(value)) return state;
  return toggleFacetValue(state, facetId, value);
}

export function clearFilters(state: CollectionViewState): CollectionViewState {
  if (!state.search && Object.keys(state.selections).length === 0) return state;
  return { ...state, search: "", selections: {} };
}

export function setSort<T>(
  config: CollectionConfig<T>,
  state: CollectionViewState,
  columnId: string,
  direction: SortDirection
): CollectionViewState {
  if (!config.sorts.some((sort) => sort.id === columnId)) return state;
  return { ...state, sort: { columnId, direction } };
}

export function toggleSortColumn<T>(
  config: CollectionConfig<T>,
  state: CollectionViewState,
  columnId: string
): CollectionViewState {
  if (state.sort.columnId === columnId) {
    return {
      ...state,
      sort: {
        columnId,
        direction: state.sort.direction === "asc" ? "desc" : "asc",
      },
    };
  }
  const def = config.sorts.find((sort) => sort.id === columnId);
  return { ...state, sort: { columnId, direction: def?.defaultDirection ?? "asc" } };
}

// ---------------------------------------------------------------------------
// Derived selectors
// ---------------------------------------------------------------------------

export function hasActiveFilters(state: CollectionViewState): boolean {
  return (
    state.search.trim().length > 0 ||
    Object.values(state.selections).some((values) => values.length > 0)
  );
}

export function countActiveFilters(state: CollectionViewState): number {
  let count = state.search.trim() ? 1 : 0;
  for (const values of Object.values(state.selections)) {
    if (values.length > 0) count += 1;
  }
  return count;
}

export function getActiveChips<T>(
  config: CollectionConfig<T>,
  state: CollectionViewState,
  items: T[]
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  for (const facet of config.facets) {
    const selected = getSelection(state, facet.id);
    if (selected.length === 0) continue;

    const options = facet.options(items);
    for (const value of selected) {
      const label =
        options.find((option) => option.value === value)?.label ??
        (value === UNASSIGNED_FILTER_VALUE ? "Unassigned" : value);
      chips.push({ facetId: facet.id, facetLabel: facet.label, value, label });
    }
  }

  return chips;
}

// ---------------------------------------------------------------------------
// Filtering & sorting
// ---------------------------------------------------------------------------

function toFacetValues(value: string | string[] | null | undefined): string[] {
  if (value == null) return [];
  return (Array.isArray(value) ? value : [value]).filter(
    (entry): entry is string => typeof entry === "string" && entry.length > 0
  );
}

function itemMatchesFacet<T>(facet: FacetDef<T>, item: T, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const values = toFacetValues(facet.valueOf(item));
  if (selected.includes(UNASSIGNED_FILTER_VALUE) && values.length === 0) return true;
  return values.some((value) => selected.includes(value));
}

function compareValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
  type: SortValueType,
  direction: SortDirection
): number {
  const aEmpty = a == null || a === "";
  const bEmpty = b == null || b === "";
  // Empty values always sort last, regardless of direction.
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;

  let result = 0;
  if (type === "date") {
    result = new Date(a as string).getTime() - new Date(b as string).getTime();
  } else if (type === "number") {
    result = Number(a) - Number(b);
  } else {
    result = String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
  }

  return direction === "asc" ? result : -result;
}

export function applyCollectionView<T>(
  items: T[],
  config: CollectionConfig<T>,
  state: CollectionViewState
): T[] {
  const search = state.search.trim().toLowerCase();
  const activeFacets = config.facets.filter(
    (facet) => getSelection(state, facet.id).length > 0
  );

  let result = items;
  if (search || activeFacets.length > 0) {
    result = items.filter((item) => {
      for (const facet of activeFacets) {
        if (!itemMatchesFacet(facet, item, getSelection(state, facet.id))) {
          return false;
        }
      }
      if (search && !config.searchText(item).toLowerCase().includes(search)) {
        return false;
      }
      return true;
    });
  }

  const sortDef =
    config.sorts.find((sort) => sort.id === state.sort.columnId) ??
    config.sorts.find((sort) => sort.id === config.defaultSortId) ??
    config.sorts[0];
  if (!sortDef) return result;

  const type = sortDef.type ?? "text";
  const direction = state.sort.direction;
  return [...result].sort((left, right) =>
    compareValues(sortDef.accessor(left), sortDef.accessor(right), type, direction)
  );
}

// ---------------------------------------------------------------------------
// Config authoring helpers
// ---------------------------------------------------------------------------

/** Join arbitrary fields into a single searchable string. */
export function joinSearchText(
  ...parts: Array<string | null | undefined | Array<string | null | undefined>>
): string {
  return parts
    .flat()
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" ");
}

/** Build facet options from a fixed vocabulary. */
export function staticFacetOptions(
  values: readonly string[],
  options?: { labelOf?: (value: string) => string; itemClassName?: string }
): FacetOption[] {
  return values.map((value) => ({
    value,
    label: options?.labelOf ? options.labelOf(value) : value,
    itemClassName: options?.itemClassName,
  }));
}

/**
 * Build facet options from distinct values found in the data set, sorted
 * alphabetically by label. Items resolving to `null` contribute an optional
 * leading "Unassigned" option.
 */
export function distinctFacetOptions<T>(
  items: T[],
  resolve: (item: T) => { value: string; label: string } | null | undefined,
  options?: {
    includeUnassigned?: boolean;
    unassignedLabel?: string;
    itemClassName?: string;
  }
): FacetOption[] {
  const labels = new Map<string, string>();
  let hasUnassigned = false;

  for (const item of items) {
    const resolved = resolve(item);
    if (!resolved || !resolved.value) {
      hasUnassigned = true;
      continue;
    }
    if (!labels.has(resolved.value)) labels.set(resolved.value, resolved.label);
  }

  const result = Array.from(labels, ([value, label]) => ({
    value,
    label,
    itemClassName: options?.itemClassName,
  })).sort((left, right) =>
    left.label.localeCompare(right.label, undefined, { sensitivity: "base" })
  );

  if (options?.includeUnassigned && hasUnassigned) {
    result.unshift({
      value: UNASSIGNED_FILTER_VALUE,
      label: options.unassignedLabel ?? "Unassigned",
      itemClassName: options?.itemClassName,
    });
  }

  return result;
}
