import { useMemo } from "react";
import {
  useNotesQuery,
  useProjectsQuery,
  useTasksQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import type { ActiveNoteMentionItem } from "../utils/activeNoteMentions";

export function useActiveNoteMentionCatalog(): {
  items: ActiveNoteMentionItem[];
  isLoading: boolean;
} {
  const projectsQuery = useProjectsQuery();
  const tasksQuery = useTasksQuery();
  const notesQuery = useNotesQuery();

  const items = useMemo(() => {
    const next: ActiveNoteMentionItem[] = [];

    for (const project of projectsQuery.data ?? []) {
      if (project.isDeleted) continue;
      next.push({
        id: project.id,
        kind: "project",
        title: project.title || "Untitled project",
      });
    }

    for (const task of tasksQuery.data ?? []) {
      if (task.isDeleted) continue;
      next.push({
        id: task.id,
        kind: "task",
        title: task.title || "Untitled task",
        subtitle: task.project?.title ?? null,
      });
    }

    for (const note of notesQuery.data ?? []) {
      if (note.isDeleted) continue;
      next.push({
        id: note.id,
        kind: "note",
        title: note.title || "Untitled note",
        subtitle: note.project?.title ?? null,
      });
    }

    return next;
  }, [projectsQuery.data, tasksQuery.data, notesQuery.data]);

  return {
    items,
    isLoading:
      projectsQuery.isLoading || tasksQuery.isLoading || notesQuery.isLoading,
  };
}
