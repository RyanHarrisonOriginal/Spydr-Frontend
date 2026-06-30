import { projectPriorities } from "@/domain/spydr/utils/projectPriority";

/** Class applied to status options/badges in filter menus. */
export const STATUS_ITEM_CLASS = "capitalize";

/** Class applied to priority options in filter menus. */
export const PRIORITY_ITEM_CLASS = "font-mono uppercase text-[11px]";

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

/**
 * Rank used to sort by priority. Higher rank = higher priority, so a "desc"
 * sort surfaces critical first. Unknown priorities rank below "low".
 */
export function priorityRank(priority: string | null | undefined): number {
  const index = projectPriorities.indexOf((priority ?? "") as (typeof projectPriorities)[number]);
  return index === -1 ? -1 : index;
}
