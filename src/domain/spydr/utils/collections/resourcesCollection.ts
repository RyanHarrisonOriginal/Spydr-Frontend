import type { ResourceNode } from "@/domain/spydr/utils/types";
import {
  distinctFacetOptions,
  joinSearchText,
  type CollectionConfig,
} from "@/domain/spydr/utils/collectionView";

export const resourcesCollection: CollectionConfig<ResourceNode> = {
  storageKey: "resources",
  noun: "resources",
  searchPlaceholder: "Search resources…",
  searchText: (resource) =>
    joinSearchText(
      resource.title,
      resource.body,
      resource.details?.url,
      resource.details?.externalSource,
      resource.area,
      resource.tags
    ),
  facets: [
    {
      id: "type",
      label: "Type",
      options: (items) =>
        distinctFacetOptions(
          items,
          (resource) =>
            resource.details?.resourceType
              ? {
                  value: resource.details.resourceType,
                  label: resource.details.resourceType,
                }
              : null,
          { includeUnassigned: true, unassignedLabel: "Uncategorized" }
        ),
      valueOf: (resource) => resource.details?.resourceType ?? null,
    },
    {
      id: "area",
      label: "Area",
      options: (items) =>
        distinctFacetOptions(
          items,
          (resource) =>
            resource.area ? { value: resource.area, label: resource.area } : null,
          { includeUnassigned: true }
        ),
      valueOf: (resource) => resource.area,
    },
  ],
  sorts: [
    {
      id: "updated",
      label: "Last updated",
      accessor: (resource) => resource.updatedAt,
      type: "date",
      defaultDirection: "desc",
    },
    {
      id: "created",
      label: "Recently added",
      accessor: (resource) => resource.createdAt,
      type: "date",
      defaultDirection: "desc",
    },
    {
      id: "title",
      label: "Title",
      accessor: (resource) => resource.title,
      type: "text",
      defaultDirection: "asc",
    },
    {
      id: "type",
      label: "Type",
      accessor: (resource) => resource.details?.resourceType ?? null,
      type: "text",
      defaultDirection: "asc",
    },
  ],
  defaultSortId: "updated",
};
