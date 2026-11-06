import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  useIdeasQuery,
  useProjectsQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { useReorderCollectionMutation } from "@/domain/spydr/features/shared/hooks/useReorderCollectionMutation";
import type { LogConfig } from "@/domain/spydr/features/log/types";
import { useLastLogProjectId } from "@/domain/spydr/features/log/hooks/useLastLogProjectId";
import { useLogSortMode } from "@/domain/spydr/features/log/hooks/useLogSortMode";
import {
  useCreateLogIdeaMutation,
  useUpdateLogChildMutation,
} from "@/domain/spydr/features/log/hooks/useLogCreateMutations";
import { statusMetaPart } from "@/domain/spydr/features/log/utils/statusMeta";
import type { IdeaNode } from "@/domain/spydr/utils/types";
import { useDeleteIdeaMutation } from "./useDeleteIdeaMutation";

export function useIdeasPage() {
  const query = useIdeasQuery();
  const projectsQuery = useProjectsQuery();
  const ideas = query.data ?? [];
  const projects = projectsQuery.data ?? [];

  const [mode, setMode] = useLogSortMode("ideas");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [lastProjectId, setLastProjectId] = useLastLogProjectId(projects);
  const [deletingIdeaId, setDeletingIdeaId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [promoteIdea, setPromoteIdea] = useState<IdeaNode | null>(null);
  const [editIdea, setEditIdea] = useState<IdeaNode | null>(null);

  const createIdea = useCreateLogIdeaMutation();
  const updateChild = useUpdateLogChildMutation();
  const deleteIdea = useDeleteIdeaMutation();
  const reorderMutation = useReorderCollectionMutation();

  const sorted = useMemo(() => {
    const copy = [...ideas];
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
  }, [ideas, mode]);

  const filtersActive = Boolean(search.trim() || projectFilter);

  const config: LogConfig<IdeaNode> = {
    // Idea text lives in title today; body is optional detail.
    primary: (idea) => idea.title.trim() || idea.body.trim(),
    title: () => null,
    meta: (idea) => {
      const parts = [];
      if (idea.project) {
        parts.push({
          kind: "project" as const,
          id: idea.project.id,
          title: idea.project.title,
        });
      }
      const status = statusMetaPart(idea.status);
      if (status) parts.push(status);
      return parts;
    },
    primaryAction: {
      label: "Promote",
      icon: ArrowUpRight,
      onRun: (idea) => setPromoteIdea(idea),
    },
    captureTargets: {
      projects,
      projectId: lastProjectId,
      onProjectChange: setLastProjectId,
    },
    rankable: true,
    capturePlaceholder: "Capture an idea…",
    emptyMessage: "No ideas yet. Write one above.",
    noun: "ideas",
    nounSingular: "idea",
    getTimestamp: (idea) => idea.createdAt,
    getCreatedAt: (idea) => idea.createdAt,
    getUpdatedAt: (idea) => idea.updatedAt,
    getProjectId: (idea) => idea.project?.id ?? null,
    onCapture: async (text, projectId) => {
      setLastProjectId(projectId);
      await createIdea.mutateAsync({
        projectId,
        input: {
          title: text,
          status: "active",
        },
      });
    },
    onEdit: (idea) => setEditIdea(idea),
    onDelete: (idea) => {
      setDeleteError(null);
      setDeletingIdeaId(idea.id);
      deleteIdea.mutate(idea.id, {
        onError: (error) => {
          setDeleteError(
            error instanceof Error ? error.message : "Failed to delete idea"
          );
        },
        onSettled: () => setDeletingIdeaId(null),
      });
    },
    deletingId: deletingIdeaId,
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
      reorderMutation.mutate({ nodeType: "idea", orderedIds });
    },
    promoteIdea,
    setPromoteIdea,
    editIdea,
    setEditIdea,
    saveEdit: async (title: string, body: string) => {
      if (!editIdea?.project?.id) return;
      await updateChild.mutateAsync({
        projectId: editIdea.project.id,
        kind: "idea",
        childId: editIdea.id,
        input: { title: title.trim(), body: body.trim() },
      });
      setEditIdea(null);
    },
    isSavingEdit: updateChild.isPending,
    deleteError,
    totalCount: ideas.length,
    isLoading: query.isLoading || projectsQuery.isLoading,
    isCapturing: createIdea.isPending,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load ideas",
    refetch: query.refetch,
  };
}
