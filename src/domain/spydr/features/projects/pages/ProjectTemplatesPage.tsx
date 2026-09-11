import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Archive, ArchiveRestore, LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import { useProjectTemplatesQuery } from "@/domain/spydr/features/shared/hooks/queries";
import {
  useDeleteProjectTemplateMutation,
  useUpdateProjectTemplateMutation,
} from "../hooks/useProjectTemplateMutations";

export function ProjectTemplatesPage() {
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);
  const templatesQuery = useProjectTemplatesQuery({ includeArchived: true });
  const updateMutation = useUpdateProjectTemplateMutation();
  const deleteMutation = useDeleteProjectTemplateMutation();

  usePageBreadcrumb("Templates");

  const templates = templatesQuery.data ?? [];
  const visible = useMemo(
    () =>
      showArchived
        ? templates
        : templates.filter((template) => !template.isArchived),
    [templates, showArchived]
  );
  const archivedCount = templates.filter((template) => template.isArchived).length;
  const activeCount = templates.length - archivedCount;

  const showInitialLoading =
    templatesQuery.isLoading && templates.length === 0;
  const showEmpty =
    !showInitialLoading && !templatesQuery.isError && visible.length === 0;

  return (
    <div>
      <PageHeader
        title="Templates"
        meta={
          <span>
            {activeCount} active
            {archivedCount > 0 ? ` · ${archivedCount} archived` : ""}
            {templatesQuery.isFetching && templates.length > 0
              ? " · refreshing…"
              : ""}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            {archivedCount > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 text-[12px]"
                onClick={() => setShowArchived((current) => !current)}
              >
                {showArchived ? "Hide archived" : "Show archived"}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-[12px]"
              onClick={() => navigate("/project-templates/new")}
            >
              <Plus className="h-3.5 w-3.5" />
              New template
            </Button>
          </div>
        }
      />

      {showInitialLoading ? <LoadingState title="Loading templates" /> : null}

      {templatesQuery.isError ? (
        <ErrorState
          title="Templates unavailable"
          description={
            templatesQuery.error instanceof Error
              ? templatesQuery.error.message
              : "Failed to load templates"
          }
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => templatesQuery.refetch()}
          >
            Retry
          </Button>
        </ErrorState>
      ) : null}

      {showEmpty ? (
        <EmptyState
          title={showArchived ? "No templates" : "No templates yet"}
          description={
            showArchived
              ? "There are no templates in this view."
              : "Create a reusable project blueprint with parameters and tasks."
          }
        >
          <Button
            type="button"
            size="sm"
            onClick={() => navigate("/project-templates/new")}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New template
          </Button>
        </EmptyState>
      ) : null}

      {visible.length > 0 ? (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {visible.map((template) => (
            <li
              key={template.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6"
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() =>
                  navigate(`/project-templates/${template.id}/edit`)
                }
              >
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="truncate text-[13px] font-medium">
                    {template.name}
                    {template.isArchived ? (
                      <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                        archived
                      </span>
                    ) : null}
                  </p>
                </div>
                {template.description ? (
                  <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">
                    {template.description}
                  </p>
                ) : null}
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {template.area ? `${template.area} · ` : null}
                  {template.taskCount} tasks · {template.parameterCount} params
                  · updated {formatRelativeTime(template.updatedAt)}
                </p>
              </button>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-[11px]"
                  asChild
                >
                  <Link to={`/project-templates/${template.id}/edit`}>
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-[11px]"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      templateId: template.id,
                      input: { isArchived: !template.isArchived },
                    })
                  }
                >
                  {template.isArchived ? (
                    <>
                      <ArchiveRestore className="h-3 w-3" />
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive className="h-3 w-3" />
                      Archive
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-[11px] text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (
                      !window.confirm(`Delete template “${template.name}”?`)
                    ) {
                      return;
                    }
                    deleteMutation.mutate(template.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
