import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { Button } from "@/components/ui/button";
import {
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { LogList } from "@/domain/spydr/features/log/components/LogList";
import { LogChildEditDialog } from "@/domain/spydr/features/log/components/LogChildEditDialog";
import { LogPromoteDialog } from "@/domain/spydr/features/log/components/LogPromoteDialog";
import { useIdeasPage } from "../hooks/useIdeasPage";

export function IdeasPage() {
  const page = useIdeasPage();
  usePageBreadcrumb("Ideas");

  if (page.isLoading && page.totalCount === 0) {
    return <LoadingState title="Loading ideas" />;
  }

  if (page.isError) {
    return (
      <ErrorState title="Ideas unavailable" description={page.errorMessage}>
        <Button type="button" size="sm" variant="outline" onClick={() => page.refetch()}>
          Retry
        </Button>
      </ErrorState>
    );
  }

  return (
    <>
      <LogList
        title="Ideas"
        items={page.items}
        config={page.config}
        projects={page.projects}
        mode={page.mode}
        onModeChange={page.setMode}
        search={page.search}
        onSearchChange={page.setSearch}
        projectFilter={page.projectFilter}
        onProjectFilterChange={page.setProjectFilter}
        reorderEnabled={page.reorderEnabled}
        onReorder={page.onReorder}
        isCapturing={page.isCapturing}
      />
      {page.deleteError ? (
        <p className="px-4 pb-2 text-sm text-destructive">{page.deleteError}</p>
      ) : null}
      <LogPromoteDialog
        open={Boolean(page.promoteIdea)}
        nodeId={page.promoteIdea?.id ?? null}
        sourceTitle={page.promoteIdea?.title ?? ""}
        projects={page.projects}
        defaultProjectId={page.promoteIdea?.project?.id ?? null}
        onOpenChange={(open) => {
          if (!open) page.setPromoteIdea(null);
        }}
      />
      <LogChildEditDialog
        open={Boolean(page.editIdea)}
        heading="Edit idea"
        titleLabel="Idea"
        bodyLabel="Details"
        values={{
          title: page.editIdea?.title ?? "",
          body: page.editIdea?.body ?? "",
        }}
        isSaving={page.isSavingEdit}
        onOpenChange={(open) => {
          if (!open) page.setEditIdea(null);
        }}
        onSave={(values) => {
          void page.saveEdit(values.title, values.body);
        }}
      />
    </>
  );
}
