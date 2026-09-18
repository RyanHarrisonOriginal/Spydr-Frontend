/**
 * Named table density — not a linear font-size × column-count scale.
 *
 * Extra columns should first consume remaining width, then tighten spacing,
 * then take a single type step. Horizontal scroll remains the overflow valve
 * so body type never drops below a readable size (WCAG 1.4.4).
 */
export const listDensities = ["comfortable", "cozy", "compact"] as const;
export type ListDensity = (typeof listDensities)[number];

export const LIST_DENSITY_GAP_PX: Record<ListDensity, number> = {
  comfortable: 16,
  cozy: 12,
  compact: 8,
};

/** Fit ratio of container width to the list at comfortable spacing. */
export function resolveListDensity(
  availableWidth: number,
  requiredWidth: number
): ListDensity {
  if (availableWidth <= 0 || requiredWidth <= 0) return "comfortable";
  const ratio = availableWidth / requiredWidth;
  if (ratio >= 1) return "comfortable";
  if (ratio >= 0.82) return "cozy";
  return "compact";
}
