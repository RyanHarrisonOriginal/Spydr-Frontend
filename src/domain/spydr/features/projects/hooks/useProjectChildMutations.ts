import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type {
  ProjectChildKind,
  UpdateProjectChildInput,
} from "@/domain/spydr/utils/types";

const listKeys: Partial<Record<ProjectChildKind, string[]>> = {
  task: ["spydr", "tasks"],
  note: ["spydr", "notes"],
  decision: ["spydr", "decisions"],
  idea: ["spydr", "ideas"],
  resource: ["spydr", "resources"],
};

export function useProjectChildMutations(projectId: string | undefined) {
  const queryClient = useQueryClient();

  const invalidate = (kind: ProjectChildKind) => {
    queryClient.invalidateQueries({ queryKey: ["spydr", "projects", projectId] });
    queryClient.invalidateQueries({ queryKey: ["spydr", "projects"] });
    const listKey = listKeys[kind];
    if (listKey) {
      queryClient.invalidateQueries({ queryKey: listKey });
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

  return { updateChild, deleteChild, restoreChild };
}
