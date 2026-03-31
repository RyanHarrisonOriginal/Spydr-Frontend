import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ontologyApi } from "../utils/api";
import type { FieldSchemaEntry } from "../utils/types";

export function useCreateNodeTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id?: string;
      label: string;
      color?: string;
      allowedParents?: (string | null)[];
      allowedChildren?: string[];
      lifecycleStates?: (string | null)[];
      fieldSchema?: FieldSchemaEntry[];
    }) => ontologyApi.nodeTypes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["node-types"] });
    },
  });
}
