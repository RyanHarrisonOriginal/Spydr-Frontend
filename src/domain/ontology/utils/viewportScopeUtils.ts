/**
 * Viewport utilities for scoping the canvas to a subtree.
 * Keeps logic for "root at top-left, fit subtree in view" in one place.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

const DEFAULT_PADDING = 48;
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 1.2;

/**
 * Compute viewport so that the top-left of the given bounds is at (padding, padding)
 * and the entire bounds fits in the viewport. Zoom is clamped to [minZoom, maxZoom].
 */
export function getViewportForBoundsWithOrigin(
  bounds: Rect,
  viewportWidth: number,
  viewportHeight: number,
  options?: {
    padding?: number;
    minZoom?: number;
    maxZoom?: number;
  }
): Viewport {
  const padding = options?.padding ?? DEFAULT_PADDING;
  const minZoom = options?.minZoom ?? MIN_ZOOM;
  const maxZoom = options?.maxZoom ?? MAX_ZOOM;

  const w = Math.max(1, bounds.width);
  const h = Math.max(1, bounds.height);
  const availableW = viewportWidth - 2 * padding;
  const availableH = viewportHeight - 2 * padding;

  let zoom = Math.min(availableW / w, availableH / h, maxZoom);
  zoom = Math.max(zoom, minZoom);

  const x = padding - bounds.x * zoom;
  const y = padding - bounds.y * zoom;

  return { x, y, zoom };
}
