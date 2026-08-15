import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type {
  ProjectChildKind,
  ProjectDetailNode,
  UpdateProjectChildInput,
} from "@/domain/spydr/utils/types";

const listSegments: Partial<Record<ProjectChildKind, string>> = {
  task: "tasks",
  note: "notes",
  decision: "decisions",
  idea: "ideas",
  resource: "resources",
};

export function useProjectChildMutations(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  const invalidate = (kind: ProjectChildKind) => {
    if (!activeOrgId) return;
    queryClient.invalidateQueries({
      queryKey: spydrOrgKey(activeOrgId, "projects", projectId!),
    });
    queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
    const segment = listSegments[kind];
    if (segment) {
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, segment) });
    }
    if (kind === "task") {
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "people") });
    }
  };

  const updateChild = useMutation({
    mutationFn: ({
      kind,
      childId,
      input,
    }: {
      kind: ProjectChildKind;
      childId: string;
      input: UpdateProjectChildInput;
    }) => spydrApi.projects.updateChild(projectId!, kind, childId, input),
    onSuccess: (_data, variables) => invalidate(variables.kind),
  });

  const deleteChild = useMutation({
    mutationFn: ({
      kind,
      childId,
    }: {
      kind: ProjectChildKind;
      childId: string;
    }) => spydrApi.projects.deleteChild(projectId!, kind, childId),
    onSuccess: (_data, variables) => invalidate(variables.kind),
  });

  const deleteChildren = useMutation({
    mutationFn: async ({
      kind,
      childIds,
    }: {
      kind: ProjectChildKind;
      childIds: string[];
    }) => {
      let last: ProjectDetailNode | null = null;
      for (const childId of childIds) {
        last = await spydrApi.projects.deleteChild(projectId!, kind, childId);
      }
      return last;
    },
    onSuccess: (_data, variables) => invalidate(variables.kind),
  });

  const restoreChild = useMutation({
    mutationFn: ({
      kind,
      childId,
    }: {
      kind: ProjectChildKind;
      childId: string;
    }) => spydrApi.projects.restoreChild(projectId!, kind, childId),
    onSuccess: (_data, variables) => invalidate(variables.kind),
  });

  return { updateChild, deleteChild, deleteChildren, restoreChild };
}
