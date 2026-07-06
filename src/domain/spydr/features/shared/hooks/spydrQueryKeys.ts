export const SPYDR_QUERY_ROOT = "spydr" as const;

export function spydrOrganizationsKey() {
  return [SPYDR_QUERY_ROOT, "organizations"] as const;
}

export function spydrOrgKey(orgId: string, ...segments: readonly string[]) {
  return [SPYDR_QUERY_ROOT, orgId, ...segments] as const;
}

export function spydrOrgPrefix(orgId: string) {
  return [SPYDR_QUERY_ROOT, orgId] as const;
}
