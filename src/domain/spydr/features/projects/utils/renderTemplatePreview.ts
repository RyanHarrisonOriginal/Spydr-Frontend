/** Client-side preview of `{{KEY}}` substitution (mirrors backend syntax). */
export function renderTemplatePreview(
  text: string,
  params: Record<string, string>
): string {
  return text.replace(/\{\{([A-Z][A-Z0-9_]*)\}\}/g, (_full, key: string) => {
    const value = params[key]?.trim();
    return value ? value : `{{${key}}}`;
  });
}
