import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { ProjectDetailNode, ProjectNode, UpdateProjectInput } from "@/domain/spydr/utils/types";

type UpdateProjectVariables =
  | UpdateProjectInput
  | { projectId: string; input: UpdateProjectInput };

export function useUpdateProjectMutation(projectId?: string) {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (variables: UpdateProjectVariables) => {
      if (projectId) {
        return spydrApi.projects.update(projectId, variables as UpdateProjectInput);
      }

      const { projectId: id, input } = variables as {
        projectId: string;
        input: UpdateProjectInput;
      };
      return spydrApi.projects.update(id, input);
    },
    onSuccess: (project) => {
      if (!activeOrgId) return;
      const detail = project as ProjectDetailNode;
      queryClient.setQueryData<ProjectNode[]>(spydrOrgKey(activeOrgId, "projects"), (current) =>
        current?.map((item) =>
          item.id === project.id
            ? {
                ...item,
                title: project.title,
                status: project.status,
                priority: project.priority,
                body: project.body,
                area: project.area,
                updatedAt: project.updatedAt,
                archivedAt: project.archivedAt,
                details: project.details ?? item.details,
                personas: detail.personas ?? item.personas,
              }
            : item
        )
      );
      queryClient.setQueryData(spydrOrgKey(activeOrgId, "projects", project.id), project);
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "people") });
    },
  });
}
