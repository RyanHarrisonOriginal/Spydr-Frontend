import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useOntologyApi } from "./useOntologyApi";
import { useBatchedPositionUpdates } from "./useBatchedPositionUpdates";
import { useCanvasNodeHandlers } from "./useCanvasNodeHandlers";
import { useCanvasActions } from "./useCanvasActions";
import type { OntologyNode, Ontology, SelectedNodePayload } from "../utils/types";

export interface UseOntologyCanvasResult {
  ontologyId: string | undefined;
  ontology: Ontology | undefined;
  nodes: Record<string, OntologyNode>;
  nodeTypes: Record<string, import("../utils/types").NodeType>;
  queries: ReturnType<typeof useOntologyApi>["queries"];
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;
  selectedNodePayload: SelectedNodePayload | null;
  setSelectedNodePayload: (payload: SelectedNodePayload | null) => void;
  flowContextValue: import("../context/OntologyFlowContext").OntologyFlowContextValue;
  editingNode: OntologyNode | null;
  onSaveNotes: (nodeId: string, notes: string) => void;
  isLoading: boolean;
  isError: boolean;
}

/**
 * All state and handlers for the ontology canvas screen. TSX only orchestrates layout and rendering.
 */
export function useOntologyCanvas(): UseOntologyCanvasResult {
  const { ontologyId } = useParams<{ ontologyId: string }>();
  const { queries, mutations } = useOntologyApi({ ontologyId });

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [selectedNodePayload, setSelectedNodePayload] =
    useState<SelectedNodePayload | null>(null);

  const ontology = queries.ontology.data;
  const nodes = ontology?.nodes ?? {};
  const nodeTypes = useMemo(() => {
    const list = queries.nodeTypes.data ?? [];
    return Object.fromEntries(list.map((nt) => [nt.id, nt]));
  }, [queries.nodeTypes.data]);

  const { onUpdateNodePosition } = useBatchedPositionUpdates({
    ontologyId,
    updateNodeMutate: (params) =>
      mutations.updateNode.mutate({ nodeId: params.nodeId, data: params.data }),
  });

  const {
    onUpdateNode,
    onCreateNode,
    onDeleteNode,
    onSaveNotes,
    moveNodeWithLayout,
  } = useCanvasNodeHandlers({
    nodes,
    updateNodeMutate: (params, opts) =>
      mutations.updateNode.mutate(
        { nodeId: params.nodeId, data: params.data },
        opts
      ),
    createNodeMutate: (payload, opts) =>
      mutations.createNode.mutate(payload, opts),
    deleteNodeMutate: (nodeId, opts) =>
      mutations.deleteNode.mutate(nodeId, opts),
    moveNodeMutate: (params, opts) =>
      mutations.moveNode.mutate(params, opts),
  });

  const { onMoveNodeUp, onMoveNodeDown, onIndent } = useCanvasActions({
    nodes,
    onUpdateNodePosition,
    onMoveNode: moveNodeWithLayout,
  });

  const flowContextValue = useMemo(
    () => ({
      nodes,
      nodeTypes,
      editingNodeId,
      ontologyId: ontologyId!,
      selectedNodeId: selectedNodePayload?.nodeId ?? null,
      selectedNodePayload,
      setSelectedNode: setSelectedNodePayload,
      onUpdateNode,
      onDeleteNode,
      onCreateNode,
      onOpenEditor: setEditingNodeId,
      onUpdateNodePosition,
      onMoveNodeUp,
      onMoveNodeDown,
      onIndent,
    }),
    [
      nodes,
      nodeTypes,
      editingNodeId,
      ontologyId,
      selectedNodePayload,
      onUpdateNode,
      onDeleteNode,
      onCreateNode,
      onUpdateNodePosition,
      onMoveNodeUp,
      onMoveNodeDown,
      onIndent,
    ]
  );

  const editingNode =
    editingNodeId && nodes[editingNodeId] ? nodes[editingNodeId] : null;

  return {
    ontologyId,
    ontology,
    nodes,
    nodeTypes,
    queries,
    editingNodeId,
    setEditingNodeId,
    selectedNodePayload,
    setSelectedNodePayload,
    flowContextValue,
    editingNode,
    onSaveNotes,
    isLoading: queries.ontology.isLoading,
    isError: !!queries.ontology.isError,
  };
}
