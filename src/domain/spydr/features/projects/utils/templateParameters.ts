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
