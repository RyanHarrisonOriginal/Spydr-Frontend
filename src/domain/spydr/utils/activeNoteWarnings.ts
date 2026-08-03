/** Drop normalize / stub diagnostics that are not useful in the review UI. */
export function isUserFacingWarning(warning: string): boolean {
  const text = warning.trim();
  if (!text) return false;
  if (/^removed\b/i.test(text)) return false;
  if (/^kept only\b/i.test(text)) return false;
  if (/^limited proposals\b/i.test(text)) return false;
  if (/^downgraded\b/i.test(text)) return false;
  if (/using stub/i.test(text)) return false;
  if (/invalid (project|task|parent|attachment|routing|related)/i.test(text)) {
    return false;
  }
  if (/projectRef|parent\.project|attachment (id|ref)/i.test(text)) {
    return false;
  }
  if (/inconsistent with/i.test(text)) return false;
  if (/without (evidence|ref|attachment)/i.test(text)) return false;
  if (/empty payload/i.test(text)) return false;
  if (/vague person/i.test(text)) return false;
  if (/no_action|new_project routing/i.test(text)) return false;
  if (/^remapped\b/i.test(text)) return false;
  if (/^synthesized\b/i.test(text)) return false;
  if (/^filled missing title\b/i.test(text)) return false;
  if (/^assigned\b/i.test(text)) return false;
  if (/segment/i.test(text) && /^(removed|kept|added|limited)\b/i.test(text)) {
    return false;
  }
  if (/force-picked|confidence below floor|mandatory note/i.test(text)) {
    return false;
  }
  return true;
}

export function filterUserFacingWarnings(warnings: string[]): string[] {
  return warnings.filter(isUserFacingWarning);
}
