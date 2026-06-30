import { useMemo } from "react";
import {
  applyCollectionView,
  clearFilters,
  countActiveFilters,
  createDefaultState,
  getActiveChips,
  getSelection,
  hasActiveFilters,
  removeFacetValue,
  sanitizeState,
  setSearch,
  setSort,
  toggleFacetValue,
  toggleSortColumn,
  type ActiveFilterChip,
  type CollectionConfig,
  type CollectionViewState,
  type FacetOption,
  type SortDirection,
} from "@/domain/spydr/utils/collectionView";
import { usePersistentState } from "./usePersistentState";

export interface CollectionFacetView {
  id: string;
  label: string;
  options: FacetOption[];
  selected: string[];
}

export interface CollectionView<T> {
  items: T[];
  state: CollectionViewState;
  facets: CollectionFacetView[];
  sorts: CollectionConfig<T>["sorts"];
  activeChips: ActiveFilterChip[];
  totalCount: number;
  filteredCount: number;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  searchPlaceholder: string;
  noun: string;
  setSearch(search: string): void;
  toggleFacet(facetId: string, value: string): void;
  removeFacet(facetId: string, value: string): void;
  clearFilters(): void;
  setSort(columnId: string, direction: SortDirection): void;
  toggleSort(columnId: string): void;
}

/**
 * Filtering + sorting + persistence for a collection page, driven entirely by
 * a `CollectionConfig`. Returns the visible (filtered + sorted) items along
 * with everything `CollectionToolbar` needs to render.
 */
export function useCollectionView<T>(
  config: CollectionConfig<T>,
  source: T[]
): CollectionView<T> {
  const [state, setState] = usePersistentState<CollectionViewState>(
    `collection-view:${config.storageKey}`,
    () => createDefaultState(config),
    (raw, fallback) => sanitizeState(config, raw, fallback)
  );

  const items = useMemo(
    () => applyCollectionView(source, config, state),
    [source, config, state]
  );

  const facets = useMemo<CollectionFacetView[]>(
    () =>
      config.facets.map((facet) => ({
        id: facet.id,
        label: facet.label,
        options: facet.options(source),
        selected: getSelection(state, facet.id),
      })),
    [config, source, state]
  );

  const activeChips = useMemo(
    () => getActiveChips(config, state, source),
    [config, source, state]
  );

  return {
    items,
    state,
    facets,
    sorts: config.sorts,
    activeChips,
    totalCount: source.length,
    filteredCount: items.length,
    activeFilterCount: countActiveFilters(state),
    hasActiveFilters: hasActiveFilters(state),
    searchPlaceholder: config.searchPlaceholder ?? "Search…",
    noun: config.noun,
    setSearch: (search) => setState((prev) => setSearch(prev, search)),
    toggleFacet: (facetId, value) =>
      setState((prev) => toggleFacetValue(prev, facetId, value)),
    removeFacet: (facetId, value) =>
      setState((prev) => removeFacetValue(prev, facetId, value)),
    clearFilters: () => setState((prev) => clearFilters(prev)),
    setSort: (columnId, direction) =>
      setState((prev) => setSort(config, prev, columnId, direction)),
    toggleSort: (columnId) => setState((prev) => toggleSortColumn(config, prev, columnId)),
  };
}
