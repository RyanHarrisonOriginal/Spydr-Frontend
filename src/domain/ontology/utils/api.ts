import { apiRequest } from "@/lib/apiClient";
import type { OntologyListItem } from "./types";

export const ontologyApi = {
  list: () => apiRequest<OntologyListItem[]>("/ontologies"),
  get: (id: string) =>
    apiRequest<{
      id: string;
      name: string;
      description: string;
      createdAt: number;
      updatedAt: number;
      nodes: Record<string, import("./types").OntologyNode>;
    }>(`/ontologies/${id}`),
  create: (data: { name: string; description?: string }) =>
    apiRequest<{ id: string; name: string; description: string; createdAt: string; updatedAt: string }>(
      "/ontologies",
      { method: "POST", body: data }
    ),
  update: (id: string, data: { name?: string; description?: string }) =>
    apiRequest<{ id: string; name: string; description: string; createdAt: string; updatedAt: string }>(
      `/ontologies/${id}`,
      { method: "PATCH", body: data }
    ),
  delete: (id: string) => apiRequest<void>(`/ontologies/${id}`, { method: "DELETE" }),

  nodes: {
    list: (ontologyId: string) =>
      apiRequest<import("./types").OntologyNode[]>(`/ontologies/${ontologyId}/nodes`),
    create: (
      ontologyId: string,
      data: {
        type: string;
        parentId?: string | null;
        title?: string;
        position?: { x: number; y: number };
        fields?: Record<string, string>;
      }
    ) =>
      apiRequest<import("./types").OntologyNode>(`/ontologies/${ontologyId}/nodes`, {
        method: "POST",
        body: data,
      }),
    update: (
      ontologyId: string,
      nodeId: string,
      data: Partial<{
        title: string;
        notes: string;
        type: string;
        position: { x: number; y: number };
        isExpanded: boolean;
        lifecycleState: string | null;
        fields: Record<string, string>;
      }>
    ) =>
      apiRequest<import("./types").OntologyNode>(
        `/ontologies/${ontologyId}/nodes/${nodeId}`,
        { method: "PATCH", body: data }
      ),
    delete: (ontologyId: string, nodeId: string) =>
      apiRequest<void>(`/ontologies/${ontologyId}/nodes/${nodeId}`, { method: "DELETE" }),
    move: (ontologyId: string, nodeId: string, newParentId: string | null) =>
      apiRequest<import("./types").OntologyNode>(
        `/ontologies/${ontologyId}/nodes/${nodeId}/move`,
        { method: "POST", body: { newParentId } }
      ),
    merge: (ontologyId: string, sourceId: string, targetId: string) =>
      apiRequest<import("./types").OntologyNode>(`/ontologies/${ontologyId}/nodes/merge`, {
        method: "POST",
        body: { sourceId, targetId },
      }),
  },

  nodeTypes: {
    list: () => apiRequest<import("./types").NodeType[]>("/node-types"),
    create: (data: {
      id?: string;
      label: string;
      color?: string;
      allowedParents?: (string | null)[];
      allowedChildren?: string[];
      lifecycleStates?: (string | null)[];
      fieldSchema?: import("./types").FieldSchemaEntry[];
    }) =>
      apiRequest<import("./types").NodeType>("/node-types", { method: "POST", body: data }),
    update: (
      id: string,
      data: Partial<{
        label: string;
        color: string;
        allowedParents: (string | null)[];
        allowedChildren: string[];
        lifecycleStates: (string | null)[];
        fieldSchema: import("./types").FieldSchemaEntry[];
      }>
    ) =>
      apiRequest<import("./types").NodeType>(`/node-types/${id}`, { method: "PATCH", body: data }),
    delete: (id: string) => apiRequest<void>(`/node-types/${id}`, { method: "DELETE" }),
  },
};
