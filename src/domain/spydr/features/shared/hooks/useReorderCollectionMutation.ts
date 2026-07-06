import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { SpydrNodeType } from "@/domain/spydr/utils/types";

export type ReorderableNodeType = Extract<
  SpydrNodeType,
  "project" | "task" | "idea" | "note" | "decision" | "resource" | "person"
>;

const querySegments: Record<ReorderableNodeType, string> = {
  project: "projects",
  task: "tasks",
  idea: "ideas",
  note: "notes",
  decision: "decisions",
  resource: "resources",
  person: "people",
};

function getQueryKey(orgId: string, nodeType: ReorderableNodeType) {
  return spydrOrgKey(orgId, querySegments[nodeType]);
}

interface ReorderInput {
  nodeType: ReorderableNodeType;
  orderedIds: string[];
}

type NodeWithOrder = { id: string; sortOrder: number };

export function useReorderCollectionMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({ nodeType, orderedIds }: ReorderInput) =>
      spydrApi.collections.reorder({ nodeType, orderedIds }),
    onMutate: async ({ nodeType, orderedIds }) => {
      if (!activeOrgId) return;
      const queryKey = getQueryKey(activeOrgId, nodeType);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<NodeWithOrder[]>(queryKey);
      queryClient.setQueryData<NodeWithOrder[]>(queryKey, (current) => {
        if (!current) return current;

        const byId = new Map(current.map((item) => [item.id, item]));
        return orderedIds
          .map((id, index) => {
            const item = byId.get(id);
            return item ? { ...item, sortOrder: index * 1000 } : null;
          })
          .filter((item): item is NodeWithOrder => item !== null);
      });

      return { previous, queryKey };
    },
    onError: (_error, _input, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, { nodeType }) => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({ queryKey: getQueryKey(activeOrgId, nodeType) });
    },
  });
}
