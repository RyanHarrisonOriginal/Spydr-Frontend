import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectTemplateInput } from "@/domain/spydr/utils/types";

export function useCreateProjectTemplateMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (input: CreateProjectTemplateInput) =>
      spydrApi.projectTemplates.create(input),
    onSuccess: () => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "project-templates"),
      });
    },
  });
}
