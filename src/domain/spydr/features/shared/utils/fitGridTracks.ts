import {
  LIST_DENSITY_GAP_PX,
  listDensities,
  type ListDensity,
} from "./listDensity";

export function gridTemplateFromTracks(tracks: Array<string | number>): string {
  return tracks
    .map((track) => (typeof track === "number" ? `${track}px` : track))
    .join(" ");
}

export function gridMinWidth(tracks: number[], gapPx: number, paddingX = 0): number {
  if (tracks.length === 0) return paddingX;
  return tracks.reduce((sum, track) => sum + track, 0) + gapPx * (tracks.length - 1) + paddingX;
}

export interface FittedTrack {
  preferred: number;
  min: number;
  /** Shrinks before the other columns, so a sized column keeps its width. */
  flexible?: boolean;
}

export interface FittedGridLayout {
  density: ListDensity;
  gapPx: number;
  widths: number[];
  overflows: boolean;
  template: string;
  /** Border-box width of the grid when columns are at their floor and the pane must scroll. */
  scrollMinWidth?: number;
}

function trackBudget(availableWidth: number, count: number, gapPx: number, paddingX: number) {
  const gaps = Math.max(0, count - 1) * gapPx;
  return Math.floor(availableWidth - paddingX - gaps);
}

function giveExtraToFlexible(tracks: FittedTrack[], widths: number[], extra: number) {
  if (extra <= 0) return;
  const indexes = tracks.flatMap((track, index) => (track.flexible ? [index] : []));
  if (indexes.length === 0) return;

  const weight = indexes.reduce((sum, index) => sum + Math.max(tracks[index].preferred, 1), 0);
  let given = 0;
  indexes.forEach((index, position) => {
    const share =
      position === indexes.length - 1
        ? extra - given
        : Math.floor((Math.max(tracks[index].preferred, 1) / weight) * extra);
    widths[index] += share;
    given += share;
  });
}

/**
 * Assigns pixel tracks that stay inside the content budget.
 * Free space goes to the flexible track, so the row fills the pane.
 * When the pane is tight, that track gives space up first. Other tracks
 * shrink only after that, and never under their minimum.
 */
export function fitTracksToWidth(
  tracks: FittedTrack[],
  availableWidth: number,
  gapPx: number,
  paddingX = 0
): { widths: number[]; overflows: boolean } {
  if (tracks.length === 0) return { widths: [], overflows: false };

  const budget = trackBudget(availableWidth, tracks.length, gapPx, paddingX);
  const mins = tracks.map((track) => track.min);
  const minSum = mins.reduce((sum, width) => sum + width, 0);

  if (availableWidth <= 0) {
    return { widths: tracks.map((track) => track.preferred), overflows: false };
  }

  if (budget <= 0 || minSum > budget) {
    return { widths: mins, overflows: true };
  }

  const preferredSum = tracks.reduce((sum, track) => sum + track.preferred, 0);
  if (preferredSum <= budget) {
    const widths = tracks.map((track) => track.preferred);
    giveExtraToFlexible(tracks, widths, budget - preferredSum);
    return { widths, overflows: false };
  }

  const widths = tracks.map((track) => track.preferred);
  let overflow = preferredSum - budget;
  for (let index = 0; index < tracks.length && overflow > 0; index += 1) {
    if (!tracks[index].flexible) continue;
    const room = widths[index] - mins[index];
    const take = Math.min(room, overflow);
    widths[index] -= take;
    overflow -= take;
  }
  if (overflow <= 0) return { widths, overflows: false };

  const slack = widths.map((width, index) => Math.max(0, width - mins[index]));
  const slackSum = slack.reduce((sum, value) => sum + value, 0);
  if (slackSum === 0) return { widths: mins, overflows: true };

  let removed = 0;
  for (let index = 0; index < tracks.length; index += 1) {
    const portion = Math.floor((slack[index] / slackSum) * overflow);
    widths[index] -= portion;
    removed += portion;
  }
  let remainder = overflow - removed;
  const order = tracks
    .map((track, index) => ({ index, slack: slack[index] }))
    .sort((left, right) => right.slack - left.slack);
  for (const entry of order) {
    if (remainder <= 0) break;
    if (widths[entry.index] <= mins[entry.index]) continue;
    widths[entry.index] -= 1;
    remainder -= 1;
  }
  return { widths, overflows: false };
}

/** Largest width for one track that still leaves every other track at its minimum. */
export function maxTrackWidth(
  tracks: FittedTrack[],
  index: number,
  availableWidth: number,
  gapPx: number,
  paddingX: number,
  hardMax: number
): number {
  if (availableWidth <= 0) return hardMax;
  const budget = trackBudget(availableWidth, tracks.length, gapPx, paddingX);
  const othersMin = tracks.reduce(
    (sum, track, trackIndex) => sum + (trackIndex === index ? 0 : track.min),
    0
  );
  const fittedMax = Math.max(tracks[index]?.min ?? 0, budget - othersMin);
  return Math.min(hardMax, fittedMax);
}

function clampTrackWidth(width: number, min: number, max: number) {
  if (!Number.isFinite(width)) return min;
  const ceiling = Math.max(min, max);
  return Math.min(ceiling, Math.max(min, Math.round(width)));
}

function isStoredWidth<T extends string>(widths: Record<T, number>, id: string): id is T {
  return Object.prototype.hasOwnProperty.call(widths, id);
}

function sameWidths<T extends string>(left: Record<T, number>, right: Record<T, number>) {
  const keys = Object.keys(left) as T[];
  return keys.length === Object.keys(right).length && keys.every((key) => left[key] === right[key]);
}

/**
 * Persists the column the user dragged.
 * A flexible column keeps its saved width and moves the boundary by resizing
 * the columns to its right, so the row still fills and the drag is not undone.
 */
export function columnWidthsAfterResize<T extends string>(
  tracks: Array<FittedTrack & { id: string }>,
  widths: Record<T, number>,
  columnId: T,
  requestedWidth: number,
  availableWidth: number,
  gapPx: number,
  paddingX: number,
  hardMax: number
): Record<T, number> {
  const index = tracks.findIndex((track) => track.id === columnId);
  const track = tracks[index];
  if (!track || !isStoredWidth(widths, columnId)) return widths;

  if (availableWidth <= 0) {
    const nextWidth = clampTrackWidth(requestedWidth, track.min, hardMax);
    if (nextWidth === widths[columnId]) return widths;
    return { ...widths, [columnId]: nextWidth };
  }

  const currentFit = fitTracksToWidth(tracks, availableWidth, gapPx, paddingX);
  const current = currentFit.widths[index] ?? track.preferred;
  const ceiling = maxTrackWidth(tracks, index, availableWidth, gapPx, paddingX, hardMax);
  const target = clampTrackWidth(requestedWidth, track.min, ceiling);
  if (target === current) return widths;

  if (track.flexible) {
    const next = { ...widths };
    let remaining = current - target;
    for (let entryIndex = index + 1; entryIndex < tracks.length && remaining !== 0; entryIndex += 1) {
      const entry = tracks[entryIndex];
      if (!entry || entry.flexible || !isStoredWidth(next, entry.id)) continue;
      const id = entry.id as T;
      const proposed = clampTrackWidth(next[id] + remaining, entry.min, Math.max(entry.min, hardMax));
      remaining -= proposed - next[id];
      next[id] = proposed;
    }
    return sameWidths(next, widths) ? widths : next;
  }

  const locked = tracks.map((entry, entryIndex) =>
    entryIndex === index ? { ...entry, preferred: target, min: target } : entry
  );
  const fitted = fitTracksToWidth(locked, availableWidth, gapPx, paddingX);
  const next = { ...widths };
  fitted.widths.forEach((value, entryIndex) => {
    const entry = locked[entryIndex];
    if (!entry || entry.flexible || !isStoredWidth(next, entry.id)) return;
    next[entry.id as T] = value;
  });
  return sameWidths(next, widths) ? widths : next;
}

function flexibleTrackFills(tracks: FittedTrack[], widths: number[], overflows: boolean) {
  if (overflows || !tracks.some((track) => track.flexible)) return false;
  return tracks.every((track, index) => track.flexible || widths[index] === track.preferred);
}

/** Pixel tracks, except a flexible track that still owns the free space uses 1fr. */
function layoutTemplate(tracks: FittedTrack[], widths: number[], fillFlexible: boolean) {
  if (!fillFlexible) return gridTemplateFromTracks(widths);
  return tracks
    .map((track, index) =>
      track.flexible ? `minmax(${track.min}px, 1fr)` : `${widths[index]}px`
    )
    .join(" ");
}

/**
 * Tighten spacing only after preferred widths no longer fit.
 * Scroll only when even compact spacing cannot hold every column at its minimum.
 * While the columns fit, the flexible track is 1fr so it grows and shrinks
 * with the pane, including when the sidebar collapses.
 */
export function resolveWorkGridLayout(
  tracks: FittedTrack[],
  availableWidth: number,
  paddingX: number
): FittedGridLayout {
  let last: FittedGridLayout | null = null;

  for (const density of listDensities) {
    const gapPx = LIST_DENSITY_GAP_PX[density];
    const fitted = fitTracksToWidth(tracks, availableWidth, gapPx, paddingX);
    const fillFlexible = flexibleTrackFills(tracks, fitted.widths, fitted.overflows);
    const layout: FittedGridLayout = {
      density,
      gapPx,
      widths: fitted.widths,
      overflows: fitted.overflows,
      template: layoutTemplate(tracks, fitted.widths, fillFlexible),
      scrollMinWidth: fitted.overflows
        ? gridMinWidth(fitted.widths, gapPx, paddingX)
        : undefined,
    };
    last = layout;
    if (!fitted.overflows) return layout;
  }

  return last ?? {
    density: "comfortable",
    gapPx: LIST_DENSITY_GAP_PX.comfortable,
    widths: [],
    overflows: false,
    template: "",
  };
}
