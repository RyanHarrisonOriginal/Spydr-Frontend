import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { UpdateProjectTemplateInput } from "@/domain/spydr/utils/types";

function invalidateTemplates(
  queryClient: ReturnType<typeof useQueryClient>,
  activeOrgId: string | null
) {
  if (!activeOrgId) return;
  queryClient.invalidateQueries({
    queryKey: spydrOrgKey(activeOrgId, "project-templates"),
  });
}

export function useUpdateProjectTemplateMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      templateId,
      input,
    }: {
      templateId: string;
      input: UpdateProjectTemplateInput;
    }) => spydrApi.projectTemplates.update(templateId, input),
    onSuccess: () => invalidateTemplates(queryClient, activeOrgId),
  });
}

export function useDeleteProjectTemplateMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (templateId: string) =>
      spydrApi.projectTemplates.delete(templateId),
    onSuccess: () => invalidateTemplates(queryClient, activeOrgId),
  });
}
