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

/**
 * Assigns pixel tracks that stay inside the content budget.
 * The flexible track gives up space first. Other tracks shrink only after that,
 * and never under their minimum.
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
    return { widths: tracks.map((track) => track.preferred), overflows: false };
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

/**
 * Tighten spacing only after preferred widths no longer fit.
 * Scroll only when even compact spacing cannot hold every column at its minimum.
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
    const layout: FittedGridLayout = {
      density,
      gapPx,
      widths: fitted.widths,
      overflows: fitted.overflows,
      template: gridTemplateFromTracks(fitted.widths),
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
