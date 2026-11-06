import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { Button } from "@/components/ui/button";
import {
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { LogList } from "@/domain/spydr/features/log/components/LogList";
import { CreateTaskDialog } from "@/domain/spydr/features/tasks/components/CreateTaskDialog";
import { useNotesPage } from "../hooks/useNotesPage";

export function NotesPage() {
  const page = useNotesPage();
  usePageBreadcrumb("Notes");

  if (page.isLoading && page.totalCount === 0) {
    return <LoadingState title="Loading notes" />;
  }

  if (page.isError) {
    return (
      <ErrorState title="Notes unavailable" description={page.errorMessage}>
        <Button type="button" size="sm" variant="outline" onClick={() => page.refetch()}>
          Retry
        </Button>
      </ErrorState>
    );
  }

  return (
    <>
      <LogList
        title="Notes"
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
      <CreateTaskDialog
        hideTrigger
        projects={page.projects}
        open={page.createTask.isOpen}
        values={page.createTask.values}
        canSubmit={page.createTask.canSubmit}
        isSubmitting={page.createTask.isSubmitting}
        errorMessage={page.createTask.errorMessage}
        onOpenChange={page.createTask.setIsOpen}
        onFieldChange={page.createTask.updateField}
        onSubmit={page.createTask.submit}
      />
    </>
  );
}
