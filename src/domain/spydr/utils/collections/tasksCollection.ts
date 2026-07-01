import type { TaskNode } from "@/domain/spydr/utils/types";
import { projectPriorities } from "@/domain/spydr/utils/projectPriority";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";
import {
  isTaskStatus,
  taskStatuses,
  taskStatusLabels,
} from "@/domain/spydr/utils/taskStatus";
import {
  distinctFacetOptions,
  joinSearchText,
  staticFacetOptions,
  type CollectionConfig,
} from "@/domain/spydr/utils/collectionView";
import {
  PRIORITY_ITEM_CLASS,
  STATUS_ITEM_CLASS,
  createOrderSortDef,
  formatStatusLabel,
  priorityRank,
} from "./shared";

function taskStatusLabel(status: string): string {
  return isTaskStatus(status) ? taskStatusLabels[status] : formatStatusLabel(status);
}

// Order used when sorting by the Status column (open work first).
const taskStatusSortOrder = [...taskStatuses, "inactive", "snoozed", "archived"];

function taskStatusRank(status: string): number {
  const index = taskStatusSortOrder.indexOf(status);
  return index === -1 ? taskStatusSortOrder.length : index;
}

export const tasksCollection: CollectionConfig<TaskNode> = {
  storageKey: "tasks",
  noun: "tasks",
  searchPlaceholder: "Search tasks…",
  searchText: (task) =>
    joinSearchText(
      task.title,
      task.body,
      task.area,
      task.project?.title,
      personDisplayName(task.assignee),
      task.tags
    ),
  facets: [
    {
      id: "status",
      label: "Status",
      options: (items) =>
        distinctFacetOptions(
          items,
          (task) => ({ value: task.status, label: taskStatusLabel(task.status) }),
          { itemClassName: STATUS_ITEM_CLASS }
        ),
      valueOf: (task) => task.status,
    },
    {
      id: "priority",
      label: "Priority",
      options: () =>
        staticFacetOptions(projectPriorities, { itemClassName: PRIORITY_ITEM_CLASS }),
      valueOf: (task) => task.priority,
    },
    {
      id: "project",
      label: "Project",
      options: (items) =>
        distinctFacetOptions(
          items,
          (task) =>
            task.project ? { value: task.project.id, label: task.project.title } : null,
          { includeUnassigned: true, unassignedLabel: "No project" }
        ),
      valueOf: (task) => task.project?.id ?? null,
    },
    {
      id: "assignee",
      label: "Assignee",
      options: (items) =>
        distinctFacetOptions(
          items,
          (task) =>
            task.assignee
              ? { value: task.assignee.id, label: personDisplayName(task.assignee) }
              : null,
          { includeUnassigned: true, unassignedLabel: "Unassigned" }
        ),
      valueOf: (task) =>
        task.assignee?.id ?? task.details?.assigneePersonNodeId ?? null,
    },
  ],
  sorts: [
    createOrderSortDef<TaskNode>(),
    {
      id: "status",
      label: "Status",
      accessor: (task) => taskStatusRank(task.status),
      type: "number",
      defaultDirection: "asc",
    },
    {
      id: "title",
      label: "Task",
      accessor: (task) => task.title,
      type: "text",
      defaultDirection: "asc",
    },
    {
      id: "project",
      label: "Project",
      accessor: (task) => task.project?.title ?? null,
      type: "text",
      defaultDirection: "asc",
    },
    {
      id: "assignee",
      label: "Assignee",
      accessor: (task) => personDisplayName(task.assignee) || null,
      type: "text",
      defaultDirection: "asc",
    },
    {
      id: "priority",
      label: "Priority",
      accessor: (task) => priorityRank(task.priority),
      type: "number",
      defaultDirection: "desc",
    },
    {
      id: "due",
      label: "Due date",
      accessor: (task) => task.details?.dueDate ?? null,
      type: "date",
      defaultDirection: "asc",
    },
    {
      id: "updated",
      label: "Last updated",
      accessor: (task) => task.updatedAt,
      type: "date",
      defaultDirection: "desc",
    },
    {
      id: "created",
      label: "Recently added",
      accessor: (task) => task.createdAt,
      type: "date",
      defaultDirection: "desc",
    },
  ],
  defaultSortId: "order",
};
