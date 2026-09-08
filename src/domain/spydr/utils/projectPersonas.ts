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

export function personGivenName(person: PersonNode | null | undefined): string {
  const name = personDisplayName(person).trim();
  if (!name) return "";
  return name.split(/\s+/)[0] ?? "";
}

export function personInitial(person: PersonNode | null | undefined): string {
  return personInitials(person).slice(0, 1) || "?";
}

/** First + last initials, or the first two letters of a single name. */
export function personInitials(person: PersonNode | null | undefined): string {
  const name = personDisplayName(person).trim();
  if (!name) return "?";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function personSubtitle(person: PersonNode | null | undefined): string | null {
  if (!person) return null;
  const parts = [person.details?.title, person.details?.organization].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
