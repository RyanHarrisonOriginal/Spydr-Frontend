const HTML_TAG_RE = /<\/?[a-z][\s\S]*>/i;
const ESCAPED_HTML_RE = /^\s*&lt;\/?[a-z]/i;

export function isRichTextEmpty(html: string): boolean {
  return !richTextToPlainText(html);
}

export function richTextToPlainText(html: string): string {
  const source = unescapeEscapedHtml(html);

  if (typeof document !== "undefined") {
    const element = document.createElement("div");
    element.innerHTML = source;
    return (element.textContent ?? element.innerText ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return source
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Decode a single layer of escaped TipTap HTML (`&lt;p&gt;` → `<p>`). */
export function unescapeEscapedHtml(value: string): string {
  if (!ESCAPED_HTML_RE.test(value)) return value;

  if (typeof document !== "undefined") {
    const element = document.createElement("textarea");
    element.innerHTML = value;
    return element.value;
  }

  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_RE.test(value);
}

function escapePlainText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * TipTap stores `getHTML()`. If a note is still plain text or entity-escaped,
 * turn it into markup the rich-text renderer can display.
 */
export function toRenderableHtml(value: string): string {
  const unescaped = unescapeEscapedHtml(value).trim();
  if (!unescaped) return "";
  if (looksLikeHtml(unescaped)) return unescaped;

  return unescaped
    .split(/\n{2,}/)
    .map((block) => `<p>${escapePlainText(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function defaultUntitledNodeTitle(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `Untitled Node - ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
