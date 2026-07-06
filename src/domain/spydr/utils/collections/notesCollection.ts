import type { NoteNode } from "@/domain/spydr/utils/types";
import { projectPriorities } from "@/domain/spydr/utils/projectPriority";
import { richTextToPlainText } from "@/domain/spydr/utils/richText";
import {
  distinctFacetOptions,
  joinSearchText,
  staticFacetOptions,
  type CollectionConfig,
} from "@/domain/spydr/utils/collectionView";
import { PRIORITY_ITEM_CLASS, STATUS_ITEM_CLASS, createOrderSortDef, formatStatusLabel } from "./shared";

export const notesCollection: CollectionConfig<NoteNode> = {
  storageKey: "notes",
  noun: "notes",
  searchPlaceholder: "Search notes…",
  searchText: (note) =>
    joinSearchText(
      note.title,
      richTextToPlainText(note.body),
      note.area,
      note.project?.title,
      note.tags
    ),
  facets: [
    {
      id: "status",
      label: "Status",
      options: (items) =>
        distinctFacetOptions(
          items,
          (note) => ({ value: note.status, label: formatStatusLabel(note.status) }),
          { itemClassName: STATUS_ITEM_CLASS }
        ),
      valueOf: (note) => note.status,
    },
    {
      id: "priority",
      label: "Priority",
      options: () =>
        staticFacetOptions(projectPriorities, { itemClassName: PRIORITY_ITEM_CLASS }),
      valueOf: (note) => note.priority,
    },
    {
      id: "area",
      label: "Area",
      options: (items) =>
        distinctFacetOptions(
          items,
          (note) => (note.area ? { value: note.area, label: note.area } : null),
          { includeUnassigned: true }
        ),
      valueOf: (note) => note.area,
    },
  ],
  sorts: [
    createOrderSortDef<NoteNode>(),
    {
      id: "updated",
      label: "Last updated",
      accessor: (note) => note.updatedAt,
      type: "date",
      defaultDirection: "desc",
    },
    {
      id: "created",
      label: "Recently added",
      accessor: (note) => note.createdAt,
      type: "date",
      defaultDirection: "desc",
    },
    {
      id: "title",
      label: "Title",
      accessor: (note) => note.title,
      type: "text",
      defaultDirection: "asc",
    },
  ],
  defaultSortId: "order",
};
