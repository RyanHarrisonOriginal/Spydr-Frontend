import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type {
  PersonCollectionNodeType,
  PersonWork,
} from "@/domain/spydr/utils/personWorkApi";

interface ReorderInput {
  nodeType: PersonCollectionNodeType;
  orderedIds: string[];
}

function reorderProjects(
  entries: PersonWork["projects"],
  orderedIds: string[]
): PersonWork["projects"] {
  return reorderRankedEntries(entries, orderedIds, (entry) => entry.project.id);
}

function reorderTasks(
  entries: PersonWork["tasks"],
  orderedIds: string[]
): PersonWork["tasks"] {
  return reorderRankedEntries(entries, orderedIds, (entry) => entry.task.id);
}

function reorderRankedEntries<T extends { personSortOrder: number | null; personRank: number }>(
  entries: T[],
  orderedIds: string[],
  getId: (entry: T) => string
): T[] {
  const byId = new Map(entries.map((entry) => [getId(entry), entry]));
  const reordered: T[] = [];

  orderedIds.forEach((id, index) => {
    const entry = byId.get(id);
    if (!entry) return;
    reordered.push({
      ...entry,
      personSortOrder: index * 1000,
      personRank: index + 1,
    });
  });

  const reorderedIdSet = new Set(orderedIds);
  for (const entry of entries) {
    if (reorderedIdSet.has(getId(entry))) continue;
    reordered.push({
      ...entry,
      personSortOrder: reordered.length * 1000,
      personRank: reordered.length + 1,
    });
  }

  return reordered;
}

export function useReorderPersonCollectionMutation(personId: string | undefined) {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({ nodeType, orderedIds }: ReorderInput) => {
      if (!personId) {
        return Promise.reject(new Error("Person id is required"));
      }
      return spydrApi.people.reorderCollection(personId, { nodeType, orderedIds });
    },
    onMutate: async ({ nodeType, orderedIds }) => {
      if (!activeOrgId || !personId) return;

      const queryKey = spydrOrgKey(activeOrgId, "people", personId, "work");
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<PersonWork>(queryKey);
      queryClient.setQueryData<PersonWork>(queryKey, (current) => {
        if (!current) return current;

        if (nodeType === "project") {
          return {
            ...current,
            projects: reorderProjects(current.projects, orderedIds),
          };
        }

        return {
          ...current,
          tasks: reorderTasks(current.tasks, orderedIds),
        };
      });

      return { previous, queryKey };
    },
    onError: (_error, _input, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: () => {
      if (!activeOrgId || !personId) return;
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "people", personId, "work"),
      });
    },
  });
}
