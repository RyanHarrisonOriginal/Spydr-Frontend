import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { ProjectNode } from "@/domain/spydr/utils/types";

export function useRestoreProjectMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (projectId: string) => spydrApi.projects.restore(projectId),
    onSuccess: (project) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<ProjectNode[]>(spydrOrgKey(activeOrgId, "projects"), (current) => {
        const next = current ? [project, ...current] : [project];
        return next.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      queryClient.setQueryData<ProjectNode[]>(
        spydrOrgKey(activeOrgId, "projects", "trash"),
        (current) => current?.filter((item) => item.id !== project.id)
      );
      queryClient.setQueryData(spydrOrgKey(activeOrgId, "projects", project.id), project);
    },
  });
}
