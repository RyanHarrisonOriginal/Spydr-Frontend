export interface TaskNoteEntry {
  loggedAt: string;
  text: string;
}

const NOTE_BLOCK_PATTERN = /^\[([^\]]+)\]\s*([\s\S]*)$/;

export function parseTaskNoteEntries(body: string): {
  entries: TaskNoteEntry[];
  preamble: string;
} {
  const trimmed = body.trim();
  if (!trimmed) {
    return { entries: [], preamble: "" };
  }

  const blocks = trimmed.split(/\n\n+/);
  const entries: TaskNoteEntry[] = [];
  const preambleParts: string[] = [];

  for (const block of blocks) {
    const match = block.match(NOTE_BLOCK_PATTERN);
    if (match) {
      entries.push({
        loggedAt: match[1],
        text: match[2].trim(),
      });
    } else {
      preambleParts.push(block);
    }
  }

  return {
    entries,
    preamble: preambleParts.join("\n\n").trim(),
  };
}

export function prependTaskNoteEntry(body: string, text: string): string {
  const note = text.trim();
  if (!note) return body;

  const entry = `[${new Date().toISOString()}] ${note}`;
  const trimmed = body.trim();
  return trimmed ? `${entry}\n\n${trimmed}` : entry;
}
