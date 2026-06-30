import type { Edge, Node } from "@xyflow/react";
import type {
  PersonNode,
  ProjectAreaNode,
  ProjectNode,
  SpydrNodeType,
  TaskNode,
} from "./types";
import { layoutWorkspaceGraph } from "./workspaceGraphLayout";

export type GraphNodeKind = Extract<
  SpydrNodeType,
  "project" | "task" | "person" | "project_area"
>;

export type GraphNodeFilters = Record<GraphNodeKind, boolean>;

export const defaultGraphNodeFilters: GraphNodeFilters = {
  project: true,
  task: true,
  person: true,
  project_area: true,
};

export interface GraphNodeData extends Record<string, unknown> {
  kind: GraphNodeKind;
  label: string;
  href: string | null;
}

export interface WorkspaceGraphInput {
  projects: ProjectNode[];
  tasks: TaskNode[];
  people: PersonNode[];
  areas: ProjectAreaNode[];
  filters: GraphNodeFilters;
}

export interface WorkspaceGraphResult {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
  layoutKey: string;
  stats: {
    nodeCount: number;
    edgeCount: number;
    hiddenCount: number;
  };
}

function nodeId(kind: GraphNodeKind, id: string) {
  return `${kind}:${id}`;
}

function parseNodeId(flowId: string): { kind: GraphNodeKind; id: string } | null {
  const [kind, ...rest] = flowId.split(":");
  if (!kind || rest.length === 0) return null;
  return { kind: kind as GraphNodeKind, id: rest.join(":") };
}

export function graphHref(kind: GraphNodeKind, id: string): string | null {
  switch (kind) {
    case "project":
      return `/projects/${id}`;
    case "task":
      return `/tasks/${id}`;
    case "person":
      return `/people/${id}`;
    default:
      return null;
  }
}

export { parseNodeId };

function createNode(
  kind: GraphNodeKind,
  id: string,
  label: string,
  href: string | null = graphHref(kind, id)
): Node<GraphNodeData> {
  return {
    id: nodeId(kind, id),
    type: "graphNode",
    position: { x: 0, y: 0 },
    data: { kind, label, href },
  };
}

function addEdge(
  edges: Edge[],
  seen: Set<string>,
  source: string,
  target: string,
  kind: string
) {
  if (source === target) return;
  const id = `${source}->${target}:${kind}`;
  if (seen.has(id)) return;
  seen.add(id);
  edges.push({
    id,
    source,
    target,
    type: "smoothstep",
    style: {
      stroke: "hsl(var(--connector-line))",
      strokeWidth: 1,
    },
  });
}

function areaByTitle(areas: ProjectAreaNode[]) {
  return new Map(areas.map((area) => [area.title.toLowerCase(), area]));
}

export function buildWorkspaceGraph(input: WorkspaceGraphInput): WorkspaceGraphResult {
  const { projects, tasks, people, areas, filters } = input;
  const nodes: Node<GraphNodeData>[] = [];
  const edges: Edge[] = [];
  const edgeSeen = new Set<string>();
  const includedIds = new Set<string>();

  const areasByTitle = areaByTitle(areas);
  const projectIds = new Set(projects.map((project) => project.id));

  if (filters.project_area) {
    for (const area of areas) {
      const id = nodeId("project_area", area.id);
      includedIds.add(id);
      nodes.push(createNode("project_area", area.id, area.title, null));
    }
  }

  if (filters.person) {
    for (const person of people) {
      const id = nodeId("person", person.id);
      includedIds.add(id);
      nodes.push(
        createNode("person", person.id, person.details?.fullName ?? person.title)
      );
    }
  }

  if (filters.project) {
    for (const project of projects) {
      const id = nodeId("project", project.id);
      includedIds.add(id);
      nodes.push(createNode("project", project.id, project.title));

      if (filters.project_area && project.area) {
        const area = areasByTitle.get(project.area.toLowerCase());
        if (area) {
          addEdge(
            edges,
            edgeSeen,
            nodeId("project_area", area.id),
            nodeId("project", project.id),
            "area"
          );
        }
      }

      const personaIds = [
        project.details?.assigneePersonNodeId,
        project.details?.requesterPersonNodeId,
        project.details?.sponsorPersonNodeId,
        project.details?.reviewerPersonNodeId,
      ].filter((value): value is string => Boolean(value));

      if (filters.person) {
        for (const personId of new Set(personaIds)) {
          addEdge(
            edges,
            edgeSeen,
            nodeId("project", project.id),
            nodeId("person", personId),
            "persona"
          );
        }
      }
    }
  }

  if (filters.task) {
    for (const task of tasks) {
      const id = nodeId("task", task.id);
      includedIds.add(id);
      nodes.push(createNode("task", task.id, task.title));

      const projectId = task.project?.id;
      if (filters.project && projectId && projectIds.has(projectId)) {
        addEdge(
          edges,
          edgeSeen,
          nodeId("project", projectId),
          nodeId("task", task.id),
          "project"
        );
      }

      const assigneeId = task.details?.assigneePersonNodeId ?? task.assignee?.id;
      if (filters.person && assigneeId) {
        addEdge(
          edges,
          edgeSeen,
          nodeId("task", task.id),
          nodeId("person", assigneeId),
          "assignee"
        );
      }
    }
  }

  const visibleEdges = edges.filter(
    (edge) => includedIds.has(edge.source) && includedIds.has(edge.target)
  );

  const laidOutNodes = layoutWorkspaceGraph(nodes, visibleEdges);

  const totalEntities =
    projects.length + tasks.length + people.length + areas.length;
  const hiddenCount = totalEntities - laidOutNodes.length;

  return {
    nodes: laidOutNodes,
    edges: visibleEdges,
    layoutKey: `${laidOutNodes.length}:${visibleEdges.length}:${Object.values(filters).join("")}`,
    stats: {
      nodeCount: laidOutNodes.length,
      edgeCount: visibleEdges.length,
      hiddenCount,
    },
  };
}

export const graphKindLabels: Record<GraphNodeKind, string> = {
  project: "Projects",
  task: "Tasks",
  person: "People",
  project_area: "Areas",
};
