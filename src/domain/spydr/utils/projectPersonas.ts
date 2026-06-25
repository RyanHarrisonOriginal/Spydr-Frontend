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

export function personInitial(person: PersonNode | null | undefined): string {
  const name = personDisplayName(person);
  return name ? name.charAt(0).toUpperCase() : "?";
}

export function personSubtitle(person: PersonNode | null | undefined): string | null {
  if (!person) return null;
  const parts = [person.details?.title, person.details?.organization].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
