import type { DecisionNode } from "@/domain/spydr/utils/types";
import { projectPriorities } from "@/domain/spydr/utils/projectPriority";
import {
  distinctFacetOptions,
  joinSearchText,
  staticFacetOptions,
  type CollectionConfig,
} from "@/domain/spydr/utils/collectionView";
import { PRIORITY_ITEM_CLASS, STATUS_ITEM_CLASS, formatStatusLabel } from "./shared";

const decisionImpacts = ["high", "medium", "low"] as const;

function impactRank(impact: string | null | undefined): number {
  const index = decisionImpacts.indexOf((impact ?? "") as (typeof decisionImpacts)[number]);
  // decisionImpacts is high→low; invert so higher impact ranks higher.
  return index === -1 ? -1 : decisionImpacts.length - index;
}

export const decisionsCollection: CollectionConfig<DecisionNode> = {
  storageKey: "decisions",
  noun: "decisions",
  searchPlaceholder: "Search decisions…",
  searchText: (decision) =>
    joinSearchText(
      decision.title,
      decision.body,
      decision.details?.rationale,
      decision.area,
      decision.tags
    ),
  facets: [
    {
      id: "impact",
      label: "Impact",
      options: () =>
        staticFacetOptions(decisionImpacts, { itemClassName: STATUS_ITEM_CLASS }),
      valueOf: (decision) => decision.details?.impact ?? null,
    },
    {
      id: "status",
      label: "Status",
      options: (items) =>
        distinctFacetOptions(
          items,
          (decision) => ({
            value: decision.status,
            label: formatStatusLabel(decision.status),
          }),
          { itemClassName: STATUS_ITEM_CLASS }
        ),
      valueOf: (decision) => decision.status,
    },
    {
      id: "priority",
      label: "Priority",
      options: () =>
        staticFacetOptions(projectPriorities, { itemClassName: PRIORITY_ITEM_CLASS }),
      valueOf: (decision) => decision.priority,
    },
    {
      id: "area",
      label: "Area",
      options: (items) =>
        distinctFacetOptions(
          items,
          (decision) =>
            decision.area ? { value: decision.area, label: decision.area } : null,
          { includeUnassigned: true }
        ),
      valueOf: (decision) => decision.area,
    },
  ],
  sorts: [
    {
      id: "decided",
      label: "Decision date",
      accessor: (decision) => decision.details?.decidedAt ?? decision.updatedAt,
      type: "date",
      defaultDirection: "desc",
    },
    {
      id: "updated",
      label: "Last updated",
      accessor: (decision) => decision.updatedAt,
      type: "date",
      defaultDirection: "desc",
    },
    {
      id: "impact",
      label: "Impact",
      accessor: (decision) => impactRank(decision.details?.impact),
      type: "number",
      defaultDirection: "desc",
    },
    {
      id: "title",
      label: "Title",
      accessor: (decision) => decision.title,
      type: "text",
      defaultDirection: "asc",
    },
  ],
  defaultSortId: "decided",
};
