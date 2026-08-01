import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/react";
import { useOrganizationsQuery } from "@/domain/spydr/features/organizations/hooks/useOrganizationsQuery";
import { useCreateOrganizationMutation } from "@/domain/spydr/features/organizations/hooks/useCreateOrganizationMutation";
import type { Organization } from "@/domain/spydr/utils/types";
import { getStored, setStored } from "@/lib/browserStorage";
import { setOrgIdGetter } from "@/lib/apiClient";

function resolveCreatorProfile(user: {
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
} | null | undefined): { fullName: string; email: string | null } | null {
  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress?.trim() || null;
  const fullName =
    user.fullName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    email?.split("@")[0]?.trim() ||
    null;

  if (!fullName) return null;
  return { fullName, email };
}

const ACTIVE_ORG_STORAGE_KEY = "spydr:active-org-id";

interface OrganizationContextValue {
  organizations: Organization[];
  activeOrg: Organization | null;
  activeOrgId: string | null;
  isLoading: boolean;
  isReady: boolean;
  setActiveOrgId: (orgId: string) => void;
  createOrganization: (name: string) => Promise<Organization>;
  isCreating: boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { data: organizations = [], isLoading } = useOrganizationsQuery();
  const createMutation = useCreateOrganizationMutation();
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(() =>
    getStored<string>(ACTIVE_ORG_STORAGE_KEY)
  );

  const setActiveOrgId = useCallback(
    (orgId: string) => {
      setActiveOrgIdState(orgId);
      setStored(ACTIVE_ORG_STORAGE_KEY, orgId);
      queryClient.clear();
    },
    [queryClient]
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setActiveOrgIdState(null);
      return;
    }

    if (organizations.length === 0) {
      setActiveOrgIdState(null);
      return;
    }

    const stored = getStored<string>(ACTIVE_ORG_STORAGE_KEY);
    const match = stored ? organizations.find((org) => org.id === stored) : null;

    if (match) {
      if (activeOrgId !== match.id) {
        setActiveOrgIdState(match.id);
      }
      return;
    }

    setActiveOrgId(organizations[0].id);
  }, [isLoaded, isSignedIn, organizations, activeOrgId, setActiveOrgId]);

  useEffect(() => {
    setOrgIdGetter(() => activeOrgId);
  }, [activeOrgId]);

  const activeOrg = useMemo(
    () => organizations.find((org) => org.id === activeOrgId) ?? null,
    [organizations, activeOrgId]
  );

  const createOrganization = useCallback(
    async (name: string) => {
      const creator = resolveCreatorProfile(user);
      const org = await createMutation.mutateAsync({
        name,
        ...(creator ? { creator } : {}),
      });
      setActiveOrgId(org.id);
      return org;
    },
    [createMutation, setActiveOrgId, user]
  );

  const value = useMemo<OrganizationContextValue>(
    () => ({
      organizations,
      activeOrg,
      activeOrgId,
      isLoading,
      isReady: isLoaded && isSignedIn && !isLoading && Boolean(activeOrgId),
      setActiveOrgId,
      createOrganization,
      isCreating: createMutation.isPending,
    }),
    [
      organizations,
      activeOrg,
      activeOrgId,
      isLoading,
      isLoaded,
      isSignedIn,
      setActiveOrgId,
      createOrganization,
      createMutation.isPending,
    ]
  );

  return (
    <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganizationContext must be used within OrganizationProvider");
  }
  return context;
}
