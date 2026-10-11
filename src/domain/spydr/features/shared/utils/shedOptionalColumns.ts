import {
  LIST_DENSITY_GAP_PX,
  listDensities,
} from "./listDensity";
import {
  fitTracksToWidth,
  type FittedTrack,
} from "./fitGridTracks";

/**
 * Drop optional columns (least important first) until the track mins fit the
 * pane at compact density. Returns the kept optional ids in their original order.
 * When width is unknown (0), keeps every optional column.
 */
export function shedOptionalColumns<T extends string>(
  optionalIds: readonly T[],
  dropOrder: readonly T[],
  buildTracks: (optionalIds: T[]) => FittedTrack[],
  availableWidth: number,
  paddingX: number
): T[] {
  const ordered = optionalIds.filter((id, index) => optionalIds.indexOf(id) === index);
  if (availableWidth <= 0 || ordered.length === 0) return [...ordered];

  const gapPx = LIST_DENSITY_GAP_PX[listDensities[listDensities.length - 1]];
  let kept = [...ordered];

  while (kept.length > 0) {
    const fitted = fitTracksToWidth(buildTracks(kept), availableWidth, gapPx, paddingX);
    if (!fitted.overflows) return kept;

    const drop = dropOrder.find((id) => kept.includes(id));
    if (!drop) return kept;
    kept = kept.filter((id) => id !== drop);
  }

  return kept;
}

/** True when even the essential (no optional) tracks still overflow the pane. */
export function essentialTracksOverflow(
  essentialTracks: FittedTrack[],
  availableWidth: number,
  paddingX: number
): boolean {
  if (availableWidth <= 0) return false;
  const gapPx = LIST_DENSITY_GAP_PX[listDensities[listDensities.length - 1]];
  return fitTracksToWidth(essentialTracks, availableWidth, gapPx, paddingX).overflows;
}
