import {
  useOntologiesQuery,
  useOntologyQuery,
  useNodeTypesQuery,
} from "./queries";
import {
  useCreateOntologyMutation,
  useUpdateOntologyMutation,
  useDeleteOntologyMutation,
  useCreateNodeMutation,
  useUpdateNodeMutation,
  useDeleteNodeMutation,
  useMoveNodeMutation,
  useMergeNodesMutation,
  useCreateNodeTypeMutation,
  useUpdateNodeTypeMutation,
  useDeleteNodeTypeMutation,
} from "./mutations";

export interface UseOntologyApiOptions {
  ontologyId?: string;
}

export function useOntologyApi(options: UseOntologyApiOptions = {}) {
  const { ontologyId } = options;

  const queries = {
    ontologies: useOntologiesQuery(),
    ontology: useOntologyQuery(ontologyId),
    nodeTypes: useNodeTypesQuery(),
  };

  const mutations = {
    createOntology: useCreateOntologyMutation(),
    updateOntology: useUpdateOntologyMutation(),
    deleteOntology: useDeleteOntologyMutation(),
    createNode: useCreateNodeMutation(ontologyId),
    updateNode: useUpdateNodeMutation(ontologyId),
    deleteNode: useDeleteNodeMutation(ontologyId),
    moveNode: useMoveNodeMutation(ontologyId),
    mergeNodes: useMergeNodesMutation(ontologyId),
    createNodeType: useCreateNodeTypeMutation(),
    updateNodeType: useUpdateNodeTypeMutation(),
    deleteNodeType: useDeleteNodeTypeMutation(),
  };

  return { mutations, queries };
}

export { useOntologiesQuery, useOntologyQuery, useNodeTypesQuery } from "./queries";
export {
  useCreateOntologyMutation,
  useUpdateOntologyMutation,
  useDeleteOntologyMutation,
  useCreateNodeMutation,
  useUpdateNodeMutation,
  useDeleteNodeMutation,
  useMoveNodeMutation,
  useMergeNodesMutation,
  useCreateNodeTypeMutation,
  useUpdateNodeTypeMutation,
  useDeleteNodeTypeMutation,
} from "./mutations";
