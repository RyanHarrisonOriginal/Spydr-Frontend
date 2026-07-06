import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectTaskInput, ProjectNode, TaskNode } from "@/domain/spydr/utils/types";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: CreateProjectTaskInput;
    }) => spydrApi.projects.createTask(projectId, input),
    onSuccess: (task, variables) => {
      if (!activeOrgId) return;
      const projects = queryClient.getQueryData<ProjectNode[]>(
        spydrOrgKey(activeOrgId, "projects")
      );
      const project = projects?.find((item) => item.id === variables.projectId);

      queryClient.setQueryData<TaskNode[]>(spydrOrgKey(activeOrgId, "tasks"), (current) => [
        {
          ...task,
          project: project ? { id: project.id, title: project.title } : null,
        },
        ...(current ?? []),
      ]);
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", variables.projectId),
      });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "tasks") });
    },
  });
}
