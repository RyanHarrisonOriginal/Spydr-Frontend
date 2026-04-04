export type NodeTypeId = string;

/** Current workflow state on a node; must match an entry in the type's `lifecycleStates` when set. */
export type NodeLifecycleState = string | null;

export interface Position {
  x: number;
  y: number;
}

export interface OntologyNode {
  id: string;
  type: NodeTypeId;
  title: string;
  parentId: string | null;
  fields: Record<string, string>;
  notes: string;
  lifecycleState: NodeLifecycleState;
  createdAt: number;
  position: Position;
  isExpanded: boolean;
  computedHeight?: number;
}

export interface FieldSchemaEntry {
  key: string;
  label: string;
  type: string;
  /** Optional emoji or icon character shown for this field on nodes and in the document pane. */
  icon?: string;
}

/** Global node type (from GET /node-types). */
export interface NodeType {
  id: string;
  label: string;
  color: string;
  allowedParents: (NodeTypeId | null)[];
  allowedChildren: NodeTypeId[];
  lifecycleStates: (string | null)[];
  fieldSchema: FieldSchemaEntry[];
  isPreset: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface Ontology {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  nodes: Record<string, OntologyNode>;
}

export interface OntologyListItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  typeDistribution: Record<string, number>;
}

/** Payload for CommandBar when a node is selected. */
export interface SelectedNodePayload {
  nodeId: string;
  canHaveChildren: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canIndent: boolean;
}
