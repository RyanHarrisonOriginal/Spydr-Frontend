import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { usePeopleQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { getStored, setStored } from "@/lib/browserStorage";

export type WorkViewMode = "hierarchy" | "tasks";
export type WorkPersonScope = "me" | "all" | string;

export interface WorkScopeState {
  person: WorkPersonScope;
  view: WorkViewMode;
  expandedIds: string[];
  expandSeeded: boolean;
}

export const defaultWorkScope: WorkScopeState = {
  person: "me",
  view: "hierarchy",
  expandedIds: [],
  expandSeeded: false,
};

function sanitizeExpandedIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function sanitizeWorkScope(
  raw: unknown,
  fallback: WorkScopeState = defaultWorkScope
): WorkScopeState {
  if (!raw || typeof raw !== "object") return fallback;
  const value = raw as Partial<WorkScopeState>;
  const view: WorkViewMode =
    value.view === "tasks" || value.view === "hierarchy" ? value.view : fallback.view;
  const expandedIds =
    value.expandedIds === undefined
      ? fallback.expandedIds
      : sanitizeExpandedIds(value.expandedIds);
  const expandSeeded =
    typeof value.expandSeeded === "boolean" ? value.expandSeeded : fallback.expandSeeded;

  if (value.person === "me" || value.person === "all") {
    return { person: value.person, view, expandedIds, expandSeeded };
  }
  if (typeof value.person === "string" && value.person.length > 0) {
    return { person: value.person, view, expandedIds, expandSeeded };
  }
  return { person: fallback.person, view, expandedIds, expandSeeded };
}

function parseUrlPerson(value: string | null): WorkPersonScope | null {
  if (value == null || value.length === 0) return null;
  if (value === "me" || value === "all") return value;
  return value;
}

function workScopeStorageKey(orgId: string | null): string | null {
  return orgId ? `work-scope:${orgId}` : null;
}

export function useWorkScope() {
  const [params, setParams] = useSearchParams();
  const { activeOrgId } = useOrganizationContext();
  const { currentUserPersonId, isReady: isCurrentUserReady } = useCurrentUserPerson();
  const peopleQuery = usePeopleQuery();
  const storageKey = workScopeStorageKey(activeOrgId);
  const [state, setState] = useState<WorkScopeState>(defaultWorkScope);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    const stored = storageKey
      ? sanitizeWorkScope(getStored<unknown>(storageKey), defaultWorkScope)
      : defaultWorkScope;
    const urlView = params.get("view");
    const urlPerson = parseUrlPerson(params.get("person"));
    setState({
      ...stored,
      view:
        urlView === "tasks" || urlView === "hierarchy" ? urlView : stored.view,
      person: urlPerson ?? stored.person,
    });
    setHydrated(true);
    // Hydrate once per org; later URL edits are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const search = params.toString();
  useEffect(() => {
    if (!hydrated) return;
    const nextParams = new URLSearchParams(search);
    const urlView = nextParams.get("view");
    const urlPerson = parseUrlPerson(nextParams.get("person"));
    setState((current) => {
      const nextView =
        urlView === "tasks" || urlView === "hierarchy" ? urlView : current.view;
      const nextPerson = urlPerson ?? current.person;
      if (nextView === current.view && nextPerson === current.person) return current;
      return { ...current, view: nextView, person: nextPerson };
    });
  }, [hydrated, search]);

  useEffect(() => {
    if (!hydrated || !storageKey) return;
    setStored(storageKey, state);
  }, [hydrated, storageKey, state]);

  useEffect(() => {
    if (!hydrated || peopleQuery.isLoading) return;
    const people = peopleQuery.data ?? [];
    if (state.person === "me" || state.person === "all") return;
    if (people.some((person) => person.id === state.person)) return;
    setState((current) => ({ ...current, person: "me" }));
  }, [hydrated, peopleQuery.data, peopleQuery.isLoading, state.person]);

  const replaceParams = (mutate: (next: URLSearchParams) => void) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        mutate(next);
        return next;
      },
      { replace: true }
    );
  };

  const isPersonScopePending =
    !hydrated || (state.person === "me" && !isCurrentUserReady);

  const personId = useMemo(() => {
    if (state.person === "all") return null;
    if (state.person === "me") return currentUserPersonId;
    return state.person;
  }, [currentUserPersonId, state.person]);

  const expandedIds = useMemo(
    () => new Set(state.expandedIds),
    [state.expandedIds]
  );

  const setExpandedIds = useCallback((next: Set<string>) => {
    const ids = [...next];
    setState((current) => {
      if (
        current.expandSeeded &&
        current.expandedIds.length === next.size &&
        current.expandedIds.every((id) => next.has(id))
      ) {
        return current;
      }
      return { ...current, expandSeeded: true, expandedIds: ids };
    });
  }, []);

  return {
    view: state.view,
    personId,
    personScope: state.person,
    isPersonScopePending,
    expandedIds,
    expandSeeded: state.expandSeeded,
    setExpandedIds,
    setView(next: WorkViewMode) {
      setState((current) => ({ ...current, view: next }));
      replaceParams((nextParams) => {
        if (next === "hierarchy") nextParams.delete("view");
        else nextParams.set("view", "tasks");
      });
    },
    setPersonId(id: string | null) {
      const person: WorkPersonScope =
        id == null ? "all" : id === currentUserPersonId ? "me" : id;
      setState((current) => ({ ...current, person }));
      replaceParams((nextParams) => {
        if (person === "me") nextParams.delete("person");
        else if (person === "all") nextParams.set("person", "all");
        else nextParams.set("person", person);
      });
    },
  };
}
