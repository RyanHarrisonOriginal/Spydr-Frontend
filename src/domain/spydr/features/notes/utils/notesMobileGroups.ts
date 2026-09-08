import type { NoteNode } from "@/domain/spydr/utils/types";

export type NoteMobileGroupId = "today" | "yesterday" | "earlier";

export interface NoteMobileGroup {
  id: NoteMobileGroupId;
  label: string;
  notes: NoteNode[];
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayOffset(from: Date, to: Date): number {
  const ms = startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function noteMobileGroupId(
  updatedAt: string,
  now = new Date()
): NoteMobileGroupId {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "earlier";

  const offset = dayOffset(date, now);
  if (offset === 0) return "today";
  if (offset === 1) return "yesterday";
  return "earlier";
}

const GROUP_ORDER: NoteMobileGroupId[] = ["today", "yesterday", "earlier"];

const GROUP_LABELS: Record<NoteMobileGroupId, string> = {
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier",
};

/** Group notes for the mobile feed. Preserves input order within each bucket. */
export function groupNotesForMobile(
  notes: NoteNode[],
  now = new Date()
): NoteMobileGroup[] {
  const buckets: Record<NoteMobileGroupId, NoteNode[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  for (const note of notes) {
    buckets[noteMobileGroupId(note.updatedAt, now)].push(note);
  }

  return GROUP_ORDER.filter((id) => buckets[id].length > 0).map((id) => ({
    id,
    label: GROUP_LABELS[id],
    notes: buckets[id],
  }));
}
