export type ActiveNoteMentionKind = "project" | "task" | "note";

export interface ActiveNoteMentionItem {
  id: string;
  kind: ActiveNoteMentionKind;
  title: string;
  subtitle?: string | null;
}

export interface ActiveNoteMentionQuery {
  /** Absolute index of the `@` that opened this mention. */
  atIndex: number;
  /** Text after `@` up to the caret (may include a kind prefix). */
  rawQuery: string;
  /** Optional kind filter parsed from the query. */
  kind: ActiveNoteMentionKind | null;
  /** Free-text filter after an optional kind token. */
  search: string;
}

const KIND_ALIASES: Record<string, ActiveNoteMentionKind> = {
  project: "project",
  projects: "project",
  p: "project",
  task: "task",
  tasks: "task",
  t: "task",
  note: "note",
  notes: "note",
  n: "note",
};

/** Parse TipTap suggestion query text (everything after `@`). */
export function parseSuggestionQuery(query: string): ActiveNoteMentionQuery {
  const withAt = `@${query}`;
  return (
    parseMentionQuery(withAt, withAt.length) ?? {
      atIndex: 0,
      rawQuery: query,
      kind: null,
      search: query,
    }
  );
}

/** Escape plain Active Note text into TipTap HTML paragraphs. */
export function activeNotePlainTextToHtml(value: string): string {
  if (!value) return "<p></p>";
  return value
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<p>${escaped || "<br>"}</p>`;
    })
    .join("");
}

export function parseMentionQuery(
  value: string,
  caret: number
): ActiveNoteMentionQuery | null {
  if (caret < 0 || caret > value.length) return null;

  const before = value.slice(0, caret);
  const match = before.match(/(^|[\s([{])@([^\n@]*)$/);
  if (!match) return null;

  const rawQuery = match[2] ?? "";
  const atIndex = before.length - rawQuery.length - 1;
  if (atIndex < 0 || value[atIndex] !== "@") return null;

  const trimmed = rawQuery.trimStart();
  const spaceIndex = trimmed.search(/\s/);
  if (spaceIndex === -1) {
    const kind = KIND_ALIASES[trimmed.toLowerCase()] ?? null;
    // Typing only `@project` / `@task` / `@note` filters by kind with empty search.
    if (kind && trimmed.length > 0) {
      return { atIndex, rawQuery, kind, search: "" };
    }
    return { atIndex, rawQuery, kind: null, search: trimmed };
  }

  const maybeKind = trimmed.slice(0, spaceIndex).toLowerCase();
  const kind = KIND_ALIASES[maybeKind] ?? null;
  const search = kind
    ? trimmed.slice(spaceIndex + 1).trimStart()
    : trimmed;

  return { atIndex, rawQuery, kind, search };
}

export function formatMentionInsert(item: ActiveNoteMentionItem): string {
  const title = item.title.trim() || "Untitled";
  return `@${item.kind} ${title}`;
}

export function applyMentionInsert(
  value: string,
  caret: number,
  query: ActiveNoteMentionQuery,
  item: ActiveNoteMentionItem
): { value: string; caret: number } {
  const insert = `${formatMentionInsert(item)} `;
  const start = query.atIndex;
  const next = `${value.slice(0, start)}${insert}${value.slice(caret)}`;
  return { value: next, caret: start + insert.length };
}

export function filterMentionItems(
  items: readonly ActiveNoteMentionItem[],
  query: ActiveNoteMentionQuery,
  limit = 8
): ActiveNoteMentionItem[] {
  const search = query.search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (query.kind && item.kind !== query.kind) return false;
    if (!search) return true;
    const haystack = `${item.title} ${item.subtitle ?? ""}`.toLowerCase();
    return haystack.includes(search);
  });

  return filtered.slice(0, limit);
}

export function mentionKindLabel(kind: ActiveNoteMentionKind): string {
  switch (kind) {
    case "project":
      return "Project";
    case "task":
      return "Task";
    case "note":
      return "Note";
  }
}
