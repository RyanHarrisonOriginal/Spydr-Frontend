import type { NodeType, NodeTypeId } from "./types";

/** Non-empty lifecycle ids defined on a node type. */
export function getLifecycleStateIds(
  typeId: NodeTypeId,
  nodeTypes: Record<string, NodeType>
): string[] {
  const raw = nodeTypes[typeId]?.lifecycleStates ?? [];
  return raw.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
}

/** Human-readable label for a lifecycle id (kebab/snake → title words). */
export function formatLifecycleLabel(id: string): string {
  return id
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type VisualBucket = "neutral" | "progress" | "done" | "risk";

function bucketForState(id: string): VisualBucket {
  const s = id.toLowerCase();
  if (
    /(complete|done|final|answered|committed|archived|settled|resolved|closed)/.test(
      s
    )
  ) {
    return "done";
  }
  if (/(blocked|risk|rejected|canceled|cancelled)/.test(s)) return "risk";
  if (
    /(active|doing|progress|investigat|develop|draft|outline|refin|revised)/.test(
      s
    )
  ) {
    return "progress";
  }
  if (
    /(planned|todo|open|capture|incubat|sketch|pending|backlog|outline)/.test(s)
  ) {
    return "neutral";
  }
  return "progress";
}

/** Tailwind classes for a status dot (color + contrast). */
export function lifecycleDotClass(state: string): string {
  switch (bucketForState(state)) {
    case "done":
      return "bg-emerald-500 dark:bg-emerald-400";
    case "risk":
      return "bg-amber-500 dark:bg-amber-400";
    case "neutral":
      return "bg-muted-foreground/55";
    default:
      return "bg-sky-500 dark:bg-sky-400";
  }
}
