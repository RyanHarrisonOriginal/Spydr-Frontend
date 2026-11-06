import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { Button } from "@/components/ui/button";
import {
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { LogList } from "@/domain/spydr/features/log/components/LogList";
import { LogChildEditDialog } from "@/domain/spydr/features/log/components/LogChildEditDialog";
import { useDecisionsPage } from "../hooks/useDecisionsPage";

export function DecisionsPage() {
  const page = useDecisionsPage();
  usePageBreadcrumb("Decisions");

  if (page.isLoading && page.totalCount === 0) {
    return <LoadingState title="Loading decisions" />;
  }

  if (page.isError) {
    return (
      <ErrorState title="Decisions unavailable" description={page.errorMessage}>
        <Button type="button" size="sm" variant="outline" onClick={() => page.refetch()}>
          Retry
        </Button>
      </ErrorState>
    );
  }

  return (
    <>
      <LogList
        title="Decisions"
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
      <LogChildEditDialog
        open={Boolean(page.editDecision)}
        heading="Edit decision"
        titleLabel="Decision"
        bodyLabel="Rationale"
        values={{
          title: page.editDecision?.title ?? "",
          body:
            page.editDecision?.details?.rationale ||
            page.editDecision?.body ||
            "",
        }}
        isSaving={page.isSavingEdit}
        onOpenChange={(open) => {
          if (!open) page.setEditDecision(null);
        }}
        onSave={(values) => {
          void page.saveEdit(values.title, values.body);
        }}
      />
    </>
  );
}
