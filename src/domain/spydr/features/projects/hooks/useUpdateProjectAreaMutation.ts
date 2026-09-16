import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import {
  spydrOrgKey,
  spydrOrgPrefix,
} from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { UpdateProjectAreaInput } from "@/domain/spydr/utils/types";

export function useUpdateProjectAreaMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      areaId,
      input,
    }: {
      areaId: string;
      input: UpdateProjectAreaInput;
    }) => spydrApi.projectAreas.update(areaId, input),
    onSuccess: (_area, { input }) => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "project-areas"),
      });
      if (input.title !== undefined) {
        queryClient.invalidateQueries({
          queryKey: spydrOrgPrefix(activeOrgId),
        });
      }
    },
  });
}
