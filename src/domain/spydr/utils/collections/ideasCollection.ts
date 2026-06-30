import type { IdeaNode } from "@/domain/spydr/utils/types";
import { projectPriorities } from "@/domain/spydr/utils/projectPriority";
import {
  distinctFacetOptions,
  joinSearchText,
  staticFacetOptions,
  type CollectionConfig,
} from "@/domain/spydr/utils/collectionView";
import {
  PRIORITY_ITEM_CLASS,
  STATUS_ITEM_CLASS,
  formatStatusLabel,
  priorityRank,
} from "./shared";

const PROMOTED = "promoted";
const NOT_PROMOTED = "not_promoted";

export const ideasCollection: CollectionConfig<IdeaNode> = {
  storageKey: "ideas",
  noun: "ideas",
  searchPlaceholder: "Search ideas…",
  searchText: (idea) => joinSearchText(idea.title, idea.body, idea.area, idea.tags),
  facets: [
    {
      id: "status",
      label: "Status",
      options: (items) =>
        distinctFacetOptions(
          items,
          (idea) => ({ value: idea.status, label: formatStatusLabel(idea.status) }),
          { itemClassName: STATUS_ITEM_CLASS }
        ),
      valueOf: (idea) => idea.status,
    },
    {
      id: "priority",
      label: "Priority",
      options: () =>
        staticFacetOptions(projectPriorities, { itemClassName: PRIORITY_ITEM_CLASS }),
      valueOf: (idea) => idea.priority,
    },
    {
      id: "potentialValue",
      label: "Potential value",
      options: (items) =>
        distinctFacetOptions(
          items,
          (idea) =>
            idea.details?.potentialValue
              ? {
                  value: idea.details.potentialValue,
                  label: idea.details.potentialValue,
                }
              : null,
          { itemClassName: STATUS_ITEM_CLASS }
        ),
      valueOf: (idea) => idea.details?.potentialValue ?? null,
    },
    {
      id: "promoted",
      label: "Promotion",
      options: () => [
        { value: PROMOTED, label: "Promoted" },
        { value: NOT_PROMOTED, label: "Not promoted" },
      ],
      valueOf: (idea) =>
        idea.details?.promotedToProjectNodeId ? PROMOTED : NOT_PROMOTED,
    },
    {
      id: "area",
      label: "Area",
      options: (items) =>
        distinctFacetOptions(
          items,
          (idea) => (idea.area ? { value: idea.area, label: idea.area } : null),
          { includeUnassigned: true }
        ),
      valueOf: (idea) => idea.area,
    },
  ],
  sorts: [
    {
      id: "updated",
      label: "Last updated",
      accessor: (idea) => idea.updatedAt,
      type: "date",
      defaultDirection: "desc",
    },
    {
      id: "created",
      label: "Recently added",
      accessor: (idea) => idea.createdAt,
      type: "date",
      defaultDirection: "desc",
    },
    {
      id: "priority",
      label: "Priority",
      accessor: (idea) => priorityRank(idea.priority),
      type: "number",
      defaultDirection: "desc",
    },
    {
      id: "confidence",
      label: "Confidence",
      accessor: (idea) => idea.details?.confidence ?? null,
      type: "number",
      defaultDirection: "desc",
    },
    {
      id: "title",
      label: "Title",
      accessor: (idea) => idea.title,
      type: "text",
      defaultDirection: "asc",
    },
  ],
  defaultSortId: "updated",
};
