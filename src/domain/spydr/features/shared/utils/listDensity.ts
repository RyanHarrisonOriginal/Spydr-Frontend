/**
 * Named table density. The work grid tries comfortable spacing first, then
 * cozy, then compact, and only then scrolls inside the list pane.
 * Body type takes one step at compact and does not shrink further.
 */
export const listDensities = ["comfortable", "cozy", "compact"] as const;
export type ListDensity = (typeof listDensities)[number];

export const LIST_DENSITY_GAP_PX: Record<ListDensity, number> = {
  comfortable: 16,
  cozy: 12,
  compact: 8,
};
