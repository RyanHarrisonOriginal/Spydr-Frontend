import type { PersonNode } from "@/domain/spydr/utils/types";

export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function collectClerkEmails(
  primaryEmail: string | null | undefined,
  additionalEmails: Array<string | null | undefined> = []
): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];

  for (const candidate of [primaryEmail, ...additionalEmails]) {
    const normalized = normalizeEmail(candidate);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    emails.push(normalized);
  }

  return emails;
}

export function personEmail(person: PersonNode | null | undefined): string | null {
  return normalizeEmail(person?.details?.email ?? null);
}

export function personMatchesEmails(
  person: PersonNode | null | undefined,
  clerkEmails: string[]
): boolean {
  const email = personEmail(person);
  if (!email || clerkEmails.length === 0) return false;
  return clerkEmails.includes(email);
}

export function findCurrentUserPerson(
  people: PersonNode[],
  clerkEmails: string[]
): PersonNode | null {
  if (clerkEmails.length === 0) return null;
  return people.find((person) => personMatchesEmails(person, clerkEmails)) ?? null;
}
