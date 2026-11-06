import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import {
  useNotesQuery,
  useProjectsQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { useReorderCollectionMutation } from "@/domain/spydr/features/shared/hooks/useReorderCollectionMutation";
import { useCreateTaskForm } from "@/domain/spydr/features/tasks/hooks/useCreateTaskForm";
import type { LogConfig } from "@/domain/spydr/features/log/types";
import { useLastLogProjectId } from "@/domain/spydr/features/log/hooks/useLastLogProjectId";
import { useLogSortMode } from "@/domain/spydr/features/log/hooks/useLogSortMode";
import { useCreateLogNoteMutation } from "@/domain/spydr/features/log/hooks/useLogCreateMutations";
import { statusMetaPart } from "@/domain/spydr/features/log/utils/statusMeta";
import { realTitle } from "@/domain/spydr/features/log/utils/titles";
import { richTextToPlainText, toRenderableHtml } from "@/domain/spydr/utils/richText";
import type { NoteNode } from "@/domain/spydr/utils/types";
import { useDeleteNoteMutation } from "./useDeleteNoteMutation";

export function useNotesPage() {
  const navigate = useNavigate();
  const query = useNotesQuery();
  const projectsQuery = useProjectsQuery();
  const notes = query.data ?? [];
  const projects = projectsQuery.data ?? [];

  const [mode, setMode] = useLogSortMode("notes");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [lastProjectId, setLastProjectId] = useLastLogProjectId(projects);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const createNote = useCreateLogNoteMutation();
  const deleteNote = useDeleteNoteMutation();
  const reorderMutation = useReorderCollectionMutation();
  const createTask = useCreateTaskForm();

  const sorted = useMemo(() => {
    const copy = [...notes];
    if (mode === "ranked") {
      copy.sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id)
      );
    } else {
      copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return copy;
  }, [notes, mode]);

  const filtersActive = Boolean(search.trim() || projectFilter);

  const openTaskFromNote = (note: NoteNode) => {
    const plain = richTextToPlainText(note.body);
    const named = realTitle(note.title);
    createTask.openPrefilled({
      projectId: note.project?.id ?? lastProjectId,
      title: named || plain.slice(0, 120) || "Task from note",
      body: plain,
    });
  };

  const config: LogConfig<NoteNode> = {
    primary: (note) => richTextToPlainText(note.body),
    title: (note) => realTitle(note.title),
    meta: (note) => {
      const parts = [];
      if (note.project) {
        parts.push({
          kind: "project" as const,
          id: note.project.id,
          title: note.project.title,
        });
      }
      const status = statusMetaPart(note.status);
      if (status) parts.push(status);
      return parts;
    },
    primaryAction: {
      label: "Create task from note",
      icon: CheckSquare,
      onRun: openTaskFromNote,
    },
    captureTargets: {
      projects,
      projectId: lastProjectId,
      onProjectChange: setLastProjectId,
    },
    rankable: true,
    capturePlaceholder: "Write a note…",
    emptyMessage: "No notes yet. Write one above.",
    noun: "notes",
    nounSingular: "note",
    getTimestamp: (note) => note.createdAt,
    getCreatedAt: (note) => note.createdAt,
    getUpdatedAt: (note) => note.updatedAt,
    getProjectId: (note) => note.project?.id ?? null,
    onCapture: async (text, projectId) => {
      setLastProjectId(projectId);
      await createNote.mutateAsync({
        projectId,
        input: {
          title: "",
          body: toRenderableHtml(text),
          status: "active",
        },
      });
    },
    onEdit: (note) => navigate(`/notes/${note.id}`),
    onDelete: (note) => {
      setDeleteError(null);
      setDeletingNoteId(note.id);
      deleteNote.mutate(note.id, {
        onError: (error) => {
          setDeleteError(
            error instanceof Error ? error.message : "Failed to delete note"
          );
        },
        onSettled: () => setDeletingNoteId(null),
      });
    },
    deletingId: deletingNoteId,
  };

  return {
    items: sorted,
    config,
    projects,
    mode,
    setMode,
    search,
    setSearch,
    projectFilter,
    setProjectFilter,
    reorderEnabled: mode === "ranked" && !filtersActive,
    onReorder: (orderedIds: string[]) => {
      if (filtersActive) return;
      reorderMutation.mutate({ nodeType: "note", orderedIds });
    },
    createTask,
    deleteError,
    totalCount: notes.length,
    isLoading: query.isLoading || projectsQuery.isLoading,
    isCapturing: createNote.isPending,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load notes",
    refetch: query.refetch,
  };
}
