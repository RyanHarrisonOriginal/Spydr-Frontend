export interface TemplateParameterOption {
  key: string;
  label: string;
}

const KEY_RE = /^[A-Z][A-Z0-9_]*$/;

export function normalizeParameterKey(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

export function isValidParameterKey(key: string): boolean {
  return KEY_RE.test(key);
}

export function humanizeParameterKey(key: string): string {
  return key
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function filterParameterOptions(
  items: readonly TemplateParameterOption[],
  query: string
): TemplateParameterOption[] {
  const search = query.trim().toUpperCase().replace(/^\{\{?/, "");
  const filtered = !search
    ? [...items]
    : items.filter(
        (item) =>
          item.key.includes(search) ||
          item.label.toUpperCase().includes(search)
      );
  return filtered.slice(0, 8);
}

export function extractKeysFromTexts(
  ...texts: Array<string | null | undefined>
): string[] {
  const keys = new Set<string>();
  const tokenRe = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;
  for (const text of texts) {
    if (!text) continue;
    tokenRe.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = tokenRe.exec(text)) !== null) {
      keys.add(match[1]);
    }
  }
  return Array.from(keys);
}

/** Stored when a connected project has no value yet for a new parameter. */
export const UNSPECIFIED_PARAM_VALUE = "UNSPECIFIED";

export function newParameterEntries<T extends { key: string; label: string }>(
  previous: Array<{ key: string }>,
  next: T[]
): T[] {
  const existing = new Set(previous.map((param) => param.key));
  return next.filter((param) => !existing.has(param.key));
}

export function newKeysFromTemplateDraft(input: {
  previousKeys: Array<{ key: string }>;
  parameters: Array<{ key: string; label: string }>;
  titleTemplate?: string | null;
  bodyTemplate?: string | null;
  outcomeTemplate?: string | null;
  tasks?: Array<{
    titleTemplate?: string | null;
    bodyTemplate?: string | null;
    tags?: string[];
  }>;
}): Array<{ key: string; label: string }> {
  const previous = new Set(input.previousKeys.map((param) => param.key));
  const fromParams = new Map(
    input.parameters.map((param) => [param.key, param.label] as const)
  );
  const fromTexts = extractKeysFromTexts(
    input.titleTemplate,
    input.bodyTemplate,
    input.outcomeTemplate,
    ...(input.tasks ?? []).flatMap((task) => [
      task.titleTemplate,
      task.bodyTemplate,
      ...(task.tags ?? []),
    ])
  );
  const keys = new Set([...fromParams.keys(), ...fromTexts]);
  return Array.from(keys)
    .filter((key) => !previous.has(key))
    .map((key) => ({
      key,
      label: fromParams.get(key) || humanizeParameterKey(key),
    }));
}

export function defaultSpawnedParamValues(
  projectIds: string[],
  keys: string[]
): Record<string, Record<string, string>> {
  const values: Record<string, Record<string, string>> = {};
  for (const projectId of projectIds) {
    values[projectId] = {};
    for (const key of keys) {
      values[projectId][key] = UNSPECIFIED_PARAM_VALUE;
    }
  }
  return values;
}

export function normalizeSpawnedParamValues(
  values: Record<string, Record<string, string>>
): Record<string, Record<string, string>> {
  const next: Record<string, Record<string, string>> = {};
  for (const [projectId, params] of Object.entries(values)) {
    next[projectId] = {};
    for (const [key, value] of Object.entries(params)) {
      next[projectId][key] = value.trim() || UNSPECIFIED_PARAM_VALUE;
    }
  }
  return next;
}

/** Escape plain template text and turn `{{KEY}}` into TipTap mention spans. */
export function templatePlainTextToHtml(value: string): string {
  if (!value) return "<p></p>";

  return value
    .split("\n")
    .map((line) => {
      let escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      escaped = escaped.replace(
        /\{\{([A-Z][A-Z0-9_]*)\}\}/g,
        (_full, key: string) =>
          `<span data-type="mention" class="template-param-mention" data-id="${key}" data-label="${key}">{{${key}}}</span>`
      );

      return `<p>${escaped || "<br>"}</p>`;
    })
    .join("");
}
