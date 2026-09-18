import { useCallback } from "react";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { usePersistentState } from "./usePersistentState";

export const DEFAULT_COLUMN_MIN_WIDTH = 80;
export const DEFAULT_COLUMN_MAX_WIDTH = 720;

export function clampColumnWidth(
  width: number,
  minWidth = DEFAULT_COLUMN_MIN_WIDTH,
  maxWidth = DEFAULT_COLUMN_MAX_WIDTH
): number {
  if (!Number.isFinite(width)) return minWidth;
  return Math.min(maxWidth, Math.max(minWidth, Math.round(width)));
}

export function sanitizeColumnWidths<T extends string>(
  raw: unknown,
  defaults: Record<T, number>,
  minWidth = DEFAULT_COLUMN_MIN_WIDTH,
  maxWidth = DEFAULT_COLUMN_MAX_WIDTH,
  minWidths?: Partial<Record<T, number>>
): Record<T, number> {
  const next = { ...defaults };
  if (!raw || typeof raw !== "object") return next;

  for (const key of Object.keys(defaults) as T[]) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value !== "number") continue;
    next[key] = clampColumnWidth(
      value,
      minWidths?.[key] ?? minWidth,
      maxWidth
    );
  }

  return next;
}

export function gridTemplateFromTracks(tracks: Array<string | number>): string {
  return tracks
    .map((track) => (typeof track === "number" ? `${track}px` : track))
    .join(" ");
}

export function gridMinWidth(
  tracks: number[],
  gapPx: number,
  paddingX = 0
): number {
  if (tracks.length === 0) return paddingX;
  return tracks.reduce((sum, track) => sum + track, 0) + gapPx * (tracks.length - 1) + paddingX;
}

interface UseResizableColumnsOptions<T extends string> {
  minWidth?: number;
  maxWidth?: number;
  minWidths?: Partial<Record<T, number>>;
}

export function useResizableColumns<T extends string>(
  listId: string,
  defaults: Record<T, number>,
  options: UseResizableColumnsOptions<T> = {}
) {
  const { activeOrgId } = useOrganizationContext();
  const minWidth = options.minWidth ?? DEFAULT_COLUMN_MIN_WIDTH;
  const maxWidth = options.maxWidth ?? DEFAULT_COLUMN_MAX_WIDTH;
  const minWidths = options.minWidths;
  const storageKey = activeOrgId
    ? `collection-column-widths:${activeOrgId}:${listId}`
    : `collection-column-widths:pending:${listId}`;

  const [widths, setWidths] = usePersistentState<Record<T, number>>(
    storageKey,
    () => defaults,
    (raw, fallback) =>
      sanitizeColumnWidths(raw, fallback, minWidth, maxWidth, minWidths)
  );

  const minWidthOf = useCallback(
    (columnId: T) => minWidths?.[columnId] ?? minWidth,
    [minWidth, minWidths]
  );

  const setColumnWidth = useCallback(
    (columnId: T, width: number) => {
      setWidths((current) => {
        const nextWidth = clampColumnWidth(width, minWidthOf(columnId), maxWidth);
        if (current[columnId] === nextWidth) return current;
        return { ...current, [columnId]: nextWidth };
      });
    },
    [maxWidth, minWidthOf, setWidths]
  );

  const resetColumnWidth = useCallback(
    (columnId: T) => {
      setColumnWidth(columnId, defaults[columnId]);
    },
    [defaults, setColumnWidth]
  );

  return {
    widths,
    minWidth,
    maxWidth,
    minWidthOf,
    setColumnWidth,
    resetColumnWidth,
  };
}
