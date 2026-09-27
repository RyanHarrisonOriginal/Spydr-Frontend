import {
  columnWidthsAfterResize,
  maxTrackWidth,
  type FittedTrack,
} from "@/domain/spydr/features/shared/utils/fitGridTracks";
import { useWorkGridLayout } from "./useWorkGridLayout";

/**
 * Fits column preferences into the measured list pane.
 * The flexible track fills leftover space. A resize writes the dragged
 * column, and writes a neighbor only when that column had to give space up.
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
    const next = columnWidthsAfterResize(
      tracks,
      widths,
      column,
      width,
      layout.availableWidth,
      layout.gapPx,
      paddingX,
      hardMax
    );
    if (next !== widths) replaceWidths(next);
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
