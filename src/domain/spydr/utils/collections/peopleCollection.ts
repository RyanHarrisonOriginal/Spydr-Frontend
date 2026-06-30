import type { PersonNode } from "@/domain/spydr/utils/types";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";
import {
  distinctFacetOptions,
  joinSearchText,
  type CollectionConfig,
} from "@/domain/spydr/utils/collectionView";

export const peopleCollection: CollectionConfig<PersonNode> = {
  storageKey: "people",
  noun: "people",
  searchPlaceholder: "Search people…",
  searchText: (person) =>
    joinSearchText(
      personDisplayName(person),
      person.details?.email,
      person.details?.title,
      person.details?.organization,
      person.body,
      person.tags
    ),
  facets: [
    {
      id: "organization",
      label: "Organization",
      options: (items) =>
        distinctFacetOptions(
          items,
          (person) =>
            person.details?.organization
              ? {
                  value: person.details.organization,
                  label: person.details.organization,
                }
              : null,
          { includeUnassigned: true, unassignedLabel: "No organization" }
        ),
      valueOf: (person) => person.details?.organization ?? null,
    },
    {
      id: "role",
      label: "Role",
      options: (items) =>
        distinctFacetOptions(
          items,
          (person) =>
            person.details?.title
              ? { value: person.details.title, label: person.details.title }
              : null,
          { includeUnassigned: true, unassignedLabel: "No role" }
        ),
      valueOf: (person) => person.details?.title ?? null,
    },
  ],
  sorts: [
    {
      id: "name",
      label: "Name",
      accessor: (person) => personDisplayName(person),
      type: "text",
      defaultDirection: "asc",
    },
    {
      id: "organization",
      label: "Organization",
      accessor: (person) => person.details?.organization ?? null,
      type: "text",
      defaultDirection: "asc",
    },
    {
      id: "updated",
      label: "Last updated",
      accessor: (person) => person.updatedAt,
      type: "date",
      defaultDirection: "desc",
    },
    {
      id: "created",
      label: "Recently added",
      accessor: (person) => person.createdAt,
      type: "date",
      defaultDirection: "desc",
    },
  ],
  defaultSortId: "name",
};
