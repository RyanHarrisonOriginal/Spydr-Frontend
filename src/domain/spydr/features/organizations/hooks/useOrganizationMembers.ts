import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { spydrOrgKey, spydrOrganizationsKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type {
  AddOrganizationMemberInput,
  CreateOrganizationInviteInput,
} from "@/domain/spydr/utils/types";

export function useOrganizationMembersQuery(orgId: string | null) {
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: spydrOrgKey(orgId ?? "none", "members"),
    queryFn: () => spydrApi.organizations.listMembers(orgId as string),
    enabled: isLoaded && isSignedIn && Boolean(orgId),
  });
}

export function useOrganizationInvitesQuery(orgId: string | null) {
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: spydrOrgKey(orgId ?? "none", "invites"),
    queryFn: () => spydrApi.organizations.listInvites(orgId as string),
    enabled: isLoaded && isSignedIn && Boolean(orgId),
  });
}

export function useInviteMemberMutation(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrganizationInviteInput) => {
      if (!orgId) throw new Error("No organization selected");
      return spydrApi.organizations.inviteMember(orgId, input);
    },
    onSuccess: () => {
      if (!orgId) return;
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(orgId, "invites") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(orgId, "members") });
    },
  });
}

export function useRevokeInviteMutation(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => {
      if (!orgId) throw new Error("No organization selected");
      return spydrApi.organizations.revokeInvite(orgId, inviteId);
    },
    onSuccess: () => {
      if (!orgId) return;
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(orgId, "invites") });
    },
  });
}

export function useAddOrganizationMemberMutation(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddOrganizationMemberInput) => {
      if (!orgId) throw new Error("No organization selected");
      return spydrApi.organizations.addMember(orgId, input);
    },
    onSuccess: () => {
      if (!orgId) return;
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(orgId, "members") });
    },
  });
}

export function useRemoveOrganizationMemberMutation(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => {
      if (!orgId) throw new Error("No organization selected");
      return spydrApi.organizations.removeMember(orgId, memberId);
    },
    onSuccess: () => {
      if (!orgId) return;
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(orgId, "members") });
      queryClient.invalidateQueries({ queryKey: spydrOrganizationsKey() });
    },
  });
}
