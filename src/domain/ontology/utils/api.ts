import type { OntologyListItem } from "./types";

const BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) ||
  "http://localhost:3001/api";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

let authTokenGetter: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>): void {
  authTokenGetter = getter;
}

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const { method = "GET", body, ...rest } = options ?? {};
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  };
  const token = authTokenGetter ? await authTokenGetter() : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const ontologyApi = {
  list: () => request<OntologyListItem[]>("/ontologies"),
  get: (id: string) =>
    request<{
      id: string;
      name: string;
      description: string;
      createdAt: number;
      updatedAt: number;
      nodes: Record<string, import("./types").OntologyNode>;
    }>(`/ontologies/${id}`),
  create: (data: { name: string; description?: string }) =>
    request<{ id: string; name: string; description: string; createdAt: string; updatedAt: string }>(
      "/ontologies",
      { method: "POST", body: data }
    ),
  update: (id: string, data: { name?: string; description?: string }) =>
    request<{ id: string; name: string; description: string; createdAt: string; updatedAt: string }>(
      `/ontologies/${id}`,
      { method: "PATCH", body: data }
    ),
  delete: (id: string) => request<void>(`/ontologies/${id}`, { method: "DELETE" }),

  nodes: {
    list: (ontologyId: string) =>
      request<import("./types").OntologyNode[]>(`/ontologies/${ontologyId}/nodes`),
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
      request<import("./types").OntologyNode>(`/ontologies/${ontologyId}/nodes`, {
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
      request<import("./types").OntologyNode>(
        `/ontologies/${ontologyId}/nodes/${nodeId}`,
        { method: "PATCH", body: data }
      ),
    delete: (ontologyId: string, nodeId: string) =>
      request<void>(`/ontologies/${ontologyId}/nodes/${nodeId}`, { method: "DELETE" }),
    move: (ontologyId: string, nodeId: string, newParentId: string | null) =>
      request<import("./types").OntologyNode>(
        `/ontologies/${ontologyId}/nodes/${nodeId}/move`,
        { method: "POST", body: { newParentId } }
      ),
    merge: (ontologyId: string, sourceId: string, targetId: string) =>
      request<import("./types").OntologyNode>(`/ontologies/${ontologyId}/nodes/merge`, {
        method: "POST",
        body: { sourceId, targetId },
      }),
  },

  nodeTypes: {
    list: () => request<import("./types").NodeType[]>("/node-types"),
    create: (data: {
      id?: string;
      label: string;
      color?: string;
      allowedParents?: (string | null)[];
      allowedChildren?: string[];
      lifecycleStates?: (string | null)[];
      fieldSchema?: import("./types").FieldSchemaEntry[];
    }) =>
      request<import("./types").NodeType>("/node-types", { method: "POST", body: data }),
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
      request<import("./types").NodeType>(`/node-types/${id}`, { method: "PATCH", body: data }),
    delete: (id: string) => request<void>(`/node-types/${id}`, { method: "DELETE" }),
  },
};
