export function isRichTextEmpty(html: string): boolean {
  return !richTextToPlainText(html);
}

export function richTextToPlainText(html: string): string {
  if (typeof document !== "undefined") {
    const element = document.createElement("div");
    element.innerHTML = html;
    return (element.textContent ?? element.innerText ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function defaultUntitledNodeTitle(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `Untitled Node - ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
