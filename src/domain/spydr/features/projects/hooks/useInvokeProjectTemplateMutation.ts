import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { InvokeProjectTemplateInput } from "@/domain/spydr/utils/types";

export function useInvokeProjectTemplateMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      templateId,
      input,
    }: {
      templateId: string;
      input: InvokeProjectTemplateInput;
    }) => spydrApi.projectTemplates.invoke(templateId, input),
    onSuccess: () => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "tasks") });
    },
  });
}
