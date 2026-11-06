import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import {
  useDecisionsQuery,
  useProjectsQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { useReorderCollectionMutation } from "@/domain/spydr/features/shared/hooks/useReorderCollectionMutation";
import type { LogConfig } from "@/domain/spydr/features/log/types";
import { useLastLogProjectId } from "@/domain/spydr/features/log/hooks/useLastLogProjectId";
import { useLogSortMode } from "@/domain/spydr/features/log/hooks/useLogSortMode";
import {
  useCreateLogDecisionMutation,
  useUpdateLogChildMutation,
} from "@/domain/spydr/features/log/hooks/useLogCreateMutations";
import { statusMetaPart } from "@/domain/spydr/features/log/utils/statusMeta";
import type { DecisionNode } from "@/domain/spydr/utils/types";
import { useDeleteDecisionMutation } from "./useDeleteDecisionMutation";

export function useDecisionsPage() {
  const query = useDecisionsQuery();
  const projectsQuery = useProjectsQuery();
  const decisions = query.data ?? [];
  const projects = projectsQuery.data ?? [];

  const [mode, setMode] = useLogSortMode("decisions");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [lastProjectId, setLastProjectId] = useLastLogProjectId(projects);
  const [deletingDecisionId, setDeletingDecisionId] = useState<string | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editDecision, setEditDecision] = useState<DecisionNode | null>(null);

  const createDecision = useCreateLogDecisionMutation();
  const updateChild = useUpdateLogChildMutation();
  const deleteDecision = useDeleteDecisionMutation();
  const reorderMutation = useReorderCollectionMutation();

  const sorted = useMemo(() => {
    const copy = [...decisions];
    if (mode === "ranked") {
      copy.sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id)
      );
    } else {
      copy.sort((a, b) => {
        const aTime = new Date(a.details?.decidedAt ?? a.createdAt).getTime();
        const bTime = new Date(b.details?.decidedAt ?? b.createdAt).getTime();
        return bTime - aTime;
      });
    }
    return copy;
  }, [decisions, mode]);

  const filtersActive = Boolean(search.trim() || projectFilter);

  const openEdit = (decision: DecisionNode) => setEditDecision(decision);

  const config: LogConfig<DecisionNode> = {
    // Decision statement is stored as title; no separate user title field.
    primary: (decision) => decision.title.trim(),
    title: () => null,
    secondary: (decision) => {
      const rationale = decision.details?.rationale?.trim() || decision.body.trim();
      return rationale || null;
    },
    secondaryLines: 2,
    meta: (decision) => {
      const parts = [];
      if (decision.project) {
        parts.push({
          kind: "project" as const,
          id: decision.project.id,
          title: decision.project.title,
        });
      }
      const status = statusMetaPart(decision.status);
      if (status) parts.push(status);
      return parts;
    },
    primaryAction: {
      label: "Edit",
      icon: Pencil,
      onRun: openEdit,
    },
    captureTargets: {
      projects,
      projectId: lastProjectId,
      onProjectChange: setLastProjectId,
    },
    rankable: true,
    capturePlaceholder: "Record a decision…",
    emptyMessage: "No decisions yet. Write one above.",
    noun: "decisions",
    nounSingular: "decision",
    getTimestamp: (decision) => decision.details?.decidedAt ?? decision.createdAt,
    getCreatedAt: (decision) => decision.createdAt,
    getUpdatedAt: (decision) => decision.updatedAt,
    getProjectId: (decision) => decision.project?.id ?? null,
    onCapture: async (text, projectId) => {
      setLastProjectId(projectId);
      await createDecision.mutateAsync({
        projectId,
        input: {
          title: text,
          status: "active",
        },
      });
    },
    onEdit: openEdit,
    onDelete: (decision) => {
      setDeleteError(null);
      setDeletingDecisionId(decision.id);
      deleteDecision.mutate(decision.id, {
        onError: (error) => {
          setDeleteError(
            error instanceof Error ? error.message : "Failed to delete decision"
          );
        },
        onSettled: () => setDeletingDecisionId(null),
      });
    },
    deletingId: deletingDecisionId,
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
      reorderMutation.mutate({ nodeType: "decision", orderedIds });
    },
    editDecision,
    setEditDecision,
    saveEdit: async (title: string, rationale: string) => {
      if (!editDecision?.project?.id) return;
      await updateChild.mutateAsync({
        projectId: editDecision.project.id,
        kind: "decision",
        childId: editDecision.id,
        input: {
          title: title.trim(),
          rationale: rationale.trim(),
        },
      });
      setEditDecision(null);
    },
    isSavingEdit: updateChild.isPending,
    deleteError,
    totalCount: decisions.length,
    isLoading: query.isLoading || projectsQuery.isLoading,
    isCapturing: createDecision.isPending,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error
        ? query.error.message
        : "Failed to load decisions",
    refetch: query.refetch,
  };
}
