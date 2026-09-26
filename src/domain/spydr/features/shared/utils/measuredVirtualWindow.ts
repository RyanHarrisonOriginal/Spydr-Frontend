/** Lists at or under this length render every row. Longer lists window by measured height. */
export const VIRTUALIZE_AFTER = 200;

export const VIRTUAL_ROW_ESTIMATE = 72;
export const VIRTUAL_OVERSCAN = 8;
/** Space kept inside each measured slot so wrapped rows do not collide. */
export const VIRTUAL_ROW_GAP = 6;

/**
 * Prefix sums of row heights. Unmeasured rows use `estimate` until a resize
 * observation replaces it, so a later measurement cannot clip the row.
 */
export function rowOffsets(
  count: number,
  heightOf: (index: number) => number | undefined,
  estimate = VIRTUAL_ROW_ESTIMATE
): number[] {
  const offsets = new Array<number>(count + 1);
  offsets[0] = 0;
  for (let index = 0; index < count; index += 1) {
    const height = heightOf(index);
    offsets[index + 1] = offsets[index] + (height && height > 0 ? height : estimate);
  }
  return offsets;
}

/** Inclusive start, exclusive end, with overscan on both sides. */
export function visibleIndexRange(
  offsets: number[],
  scrollTop: number,
  viewport: number,
  overscan = VIRTUAL_OVERSCAN
): { start: number; end: number } {
  const count = Math.max(0, offsets.length - 1);
  if (count === 0) return { start: 0, end: 0 };

  const startEdge = Math.max(0, scrollTop);
  const endEdge = startEdge + Math.max(0, viewport);
  let low = 0;
  let high = count;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (offsets[mid + 1] <= startEdge) low = mid + 1;
    else high = mid;
  }
  const start = Math.max(0, Math.min(low, count - 1) - overscan);

  let end = Math.min(low, count);
  while (end < count && offsets[end] < endEdge) end += 1;
  end = Math.min(count, end + overscan);
  return { start, end: Math.max(start, end) };
}
