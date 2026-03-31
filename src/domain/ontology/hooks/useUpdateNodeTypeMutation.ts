import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ontologyApi } from "../utils/api";
import type { FieldSchemaEntry } from "../utils/types";

export function useUpdateNodeTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        label: string;
        color: string;
        allowedParents: (string | null)[];
        allowedChildren: string[];
        lifecycleStates: (string | null)[];
        fieldSchema: FieldSchemaEntry[];
      }>;
    }) => ontologyApi.nodeTypes.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["node-types"] });
    },
  });
}
