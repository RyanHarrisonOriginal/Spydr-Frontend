import { createContext, useContext, type ReactNode } from "react";
import type { OntologyNode, NodeType, SelectedNodePayload } from "../utils/types";

export type { SelectedNodePayload };

export interface OntologyFlowContextValue {
  nodes: Record<string, OntologyNode>;
  nodeTypes: Record<string, NodeType>;
  editingNodeId: string | null;
  ontologyId: string;
  selectedNodeId: string | null;
  selectedNodePayload: SelectedNodePayload | null;
  setSelectedNode: (payload: SelectedNodePayload | null) => void;
  onUpdateNode: (nodeId: string, updates: Partial<OntologyNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onCreateNode: (type: string, parentId: string | null, position?: { x: number; y: number }) => void;
  onOpenEditor: (nodeId: string | null) => void;
  onUpdateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  onMoveNodeUp: (nodeId: string) => void;
  onMoveNodeDown: (nodeId: string) => void;
  onIndent: (nodeId: string) => void;
}

const OntologyFlowContext = createContext<OntologyFlowContextValue | null>(null);

export function OntologyFlowProvider({
  value,
  children,
}: {
  value: OntologyFlowContextValue;
  children: ReactNode;
}) {
  return (
    <OntologyFlowContext.Provider value={value}>
      {children}
    </OntologyFlowContext.Provider>
  );
}

export function useOntologyFlowContext(): OntologyFlowContextValue {
  const ctx = useContext(OntologyFlowContext);
  if (!ctx) throw new Error("useOntologyFlowContext must be used within OntologyFlowProvider");
  return ctx;
}
