import {
  fitTracksToWidth,
  maxTrackWidth,
  type FittedTrack,
} from "@/domain/spydr/features/shared/utils/fitGridTracks";
import { useWorkGridLayout } from "./useWorkGridLayout";

function clampWidth(width: number, min: number, max: number) {
  if (!Number.isFinite(width)) return min;
  const ceiling = Math.max(min, max);
  return Math.min(ceiling, Math.max(min, Math.round(width)));
}

/**
 * Fits column preferences into the measured list pane.
 * A resize locks the dragged column and takes space from the flexible track
 * first, then from the other columns down to their minimums.
 */
export function useFittedColumns<T extends string>(
  tracks: Array<FittedTrack & { id: string }>,
  widths: Record<T, number>,
  replaceWidths: (next: Record<T, number>) => void,
  paddingX: number,
  hardMax: number
) {
  const layout = useWorkGridLayout(tracks, paddingX);

  const visualWidth = (column: T) => {
    const index = tracks.findIndex((track) => track.id === column);
    return layout.widths[index] ?? widths[column];
  };

  const fitMax = (column: T) =>
    maxTrackWidth(
      tracks,
      Math.max(0, tracks.findIndex((track) => track.id === column)),
      layout.availableWidth,
      layout.gapPx,
      paddingX,
      hardMax
    );

  const resizeColumn = (column: T, width: number) => {
    const index = tracks.findIndex((track) => track.id === column);
    const track = tracks[index];
    if (!track) return;
    const locked = clampWidth(width, track.min, fitMax(column));
    const nextTracks = tracks.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, preferred: locked, min: locked } : entry
    );
    const fitted = fitTracksToWidth(
      nextTracks,
      layout.availableWidth,
      layout.gapPx,
      paddingX
    );
    const next = { ...widths };
    fitted.widths.forEach((value, entryIndex) => {
      const id = nextTracks[entryIndex]?.id;
      if (id && Object.prototype.hasOwnProperty.call(next, id)) {
        next[id as T] = value;
      }
    });
    replaceWidths(next);
  };

  return {
    layout,
    gridStyle: {
      gridTemplateColumns: layout.template,
      gap: layout.gapPx,
      minWidth: layout.scrollMinWidth,
      justifyContent: "start" as const,
    },
    visualWidth,
    fitMax,
    resizeColumn,
  };
}
