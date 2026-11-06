import type { PersonNode } from "./types";

export const projectPersonaRoles = [
  "requester",
  "assignee",
  "sponsor",
  "reviewer",
] as const;

export type ProjectPersonaRole = (typeof projectPersonaRoles)[number];

export const projectPersonaLabels: Record<ProjectPersonaRole, string> = {
  requester: "Requester",
  assignee: "Assignee",
  sponsor: "Sponsor",
  reviewer: "Reviewer",
};

export const projectPersonaHints: Record<ProjectPersonaRole, string> = {
  requester: "Who initiated or owns the ask",
  assignee: "Primary person doing the work",
  sponsor: "Executive or stakeholder backing",
  reviewer: "Sign-off or quality gate",
};

export const projectPersonaField: Record<ProjectPersonaRole, `${ProjectPersonaRole}PersonNodeId`> = {
  requester: "requesterPersonNodeId",
  assignee: "assigneePersonNodeId",
  sponsor: "sponsorPersonNodeId",
  reviewer: "reviewerPersonNodeId",
};

export function personDisplayName(person: PersonNode | null | undefined): string {
  if (!person) return "";
  return person.details?.fullName ?? person.title;
}

/** Strip bracketed/parenthetical segments and collapse whitespace. */
export function cleanPersonName(raw: string): string {
  return raw
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Same clean-name rule for any displayed title / label. */
export function cleanDisplayName(raw: string | null | undefined): string {
  if (!raw) return "";
  return cleanPersonName(raw);
}

export interface FormattedPerson {
  label: string;
  initials: string;
}

/**
 * App-wide person display: "You" for the current user, otherwise a clean name.
 * Unassigned (null person) → label "Unassigned", empty initials.
 */
export function formatPerson(
  person: PersonNode | null | undefined,
  currentUserId: string | null | undefined
): FormattedPerson {
  if (!person) {
    return { label: "Unassigned", initials: "" };
  }
  const cleaned = cleanPersonName(personDisplayName(person));
  const initials = initialsFromCleanName(cleaned);
  if (currentUserId && person.id === currentUserId) {
    return { label: "You", initials };
  }
  return { label: cleaned || personDisplayName(person).trim(), initials };
}

function initialsFromCleanName(cleaned: string): string {
  if (!cleaned) return "";
  const letterParts = cleaned
    .replace(/[^\p{L}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (letterParts.length === 0) return "";
  if (letterParts.length === 1) {
    return (letterParts[0].match(/\p{L}/u)?.[0] ?? "").toUpperCase();
  }
  const first = letterParts[0].match(/\p{L}/u)?.[0] ?? "";
  const last = letterParts[letterParts.length - 1].match(/\p{L}/u)?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function personGivenName(person: PersonNode | null | undefined): string {
  const name = cleanPersonName(personDisplayName(person));
  if (!name) return "";
  return name.split(/\s+/)[0] ?? "";
}

export function personInitial(person: PersonNode | null | undefined): string {
  return personInitials(person).slice(0, 1) || "?";
}

/**
 * First + last letter initials after stripping bracketed/parenthetical noise.
 * "Ryan Harrison [TEST]" -> "RH". Single word -> first letter. Empty -> "".
 */
export function personInitials(person: PersonNode | null | undefined): string {
  return initialsFromCleanName(cleanPersonName(personDisplayName(person)));
}

export function personSubtitle(person: PersonNode | null | undefined): string | null {
  if (!person) return null;
  const parts = [person.details?.title, person.details?.organization].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
