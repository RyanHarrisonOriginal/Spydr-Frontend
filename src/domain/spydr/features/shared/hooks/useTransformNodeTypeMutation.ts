import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type {
  TransformNodeTypeInput,
  TransformNodeTypeResult,
} from "@/domain/spydr/utils/types";

export function useTransformNodeTypeMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (input: TransformNodeTypeInput) =>
      spydrApi.entities.transform(input),
    onSuccess: (result: TransformNodeTypeResult) => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "tasks") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "notes") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "ideas") });
      queryClient.removeQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", result.nodeId),
      });
      queryClient.removeQueries({
        queryKey: spydrOrgKey(activeOrgId, "tasks", result.nodeId),
      });
      queryClient.removeQueries({
        queryKey: spydrOrgKey(activeOrgId, "notes", result.nodeId),
      });
    },
  });
}

export function transformResultHref(result: TransformNodeTypeResult): string {
  if (result.currentType === "project") {
    return `/projects/${result.nodeId}`;
  }
  if (result.currentType === "note") {
    return `/notes/${result.nodeId}`;
  }
  return `/tasks/${result.nodeId}`;
}
