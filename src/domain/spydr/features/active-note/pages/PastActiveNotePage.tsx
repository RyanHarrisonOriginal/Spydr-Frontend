import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { ActiveNoteReview } from "../components/ActiveNoteReview";
import { usePastActiveNotePage } from "../hooks/usePastActiveNotePage";

function notePreview(content: string): string {
  const compact = content.replace(/\s+/g, " ").trim();
  if (!compact) return "Past active note";
  if (compact.length <= 48) return compact;
  return `${compact.slice(0, 45).trimEnd()}…`;
}

export function PastActiveNotePage() {
  const page = usePastActiveNotePage();
  usePageBreadcrumb(
    page.proposal ? notePreview(page.proposal.activeNote.content) : "Past note"
  );

  if (page.isLoading) {
    return <LoadingState title="Loading active note" />;
  }

  if (page.isError || !page.proposal) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PageHeader
          dense
          title="Past Active Note"
          actions={
            <Button asChild type="button" variant="outline" size="sm">
              <Link to="/active-note" className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to note
              </Link>
            </Button>
          }
        />
        <ErrorState
          title="Active note unavailable"
          description={page.errorMessage ?? "This active note could not be found."}
        >
          <Button asChild variant="outline" size="sm">
            <Link to="/active-note">Back to Active Note</Link>
          </Button>
        </ErrorState>
      </div>
    );
  }

  const appliedCount = page.operations.filter(
    (operation) => operation.applyDecision === "accepted"
  ).length;
  const pendingCount = page.operations.filter(
    (operation) => operation.applyDecision !== "accepted"
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <PageHeader
        dense
        title="Past Active Note"
        meta={
          <span>
            {appliedCount} applied
            {pendingCount > 0 ? ` · ${pendingCount} not applied` : ""}
          </span>
        }
        actions={
          <Button asChild type="button" variant="outline" size="sm">
            <Link to="/active-note" className="inline-flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to note
            </Link>
          </Button>
        }
      />

      {page.applyNotice ? (
        <p
          className="shrink-0 border-b border-border bg-highlight/10 px-4 py-2 text-[12.5px] text-foreground md:px-8"
          role="status"
        >
          {page.applyNotice}
        </p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden">
        <ActiveNoteReview
          proposal={page.proposal}
          operations={page.operations}
          projects={page.projects}
          tasks={page.tasks}
          content={page.proposal.activeNote.content}
          characterCount={page.proposal.activeNote.content.length}
          selectedCount={page.selectedCount}
          isApplying={page.isApplying}
          isReanalyzing={false}
          noteEditable={false}
          applyAgain={page.selectedAlreadyApplied}
          applyError={page.applyError}
          noteError={null}
          validationErrors={page.validationErrors}
          editingOperationId={page.editingOperationId}
          onContentChange={() => undefined}
          onReanalyze={() => undefined}
          onToggleSelected={page.toggleOperationSelected}
          onReject={page.rejectOperation}
          onEdit={page.setEditingOperationId}
          onEditingOpenChange={(open) => {
            if (!open) page.setEditingOperationId(null);
          }}
          onSaveEditedPayload={page.saveEditedPayload}
          onDuplicateResolution={page.setDuplicateResolution}
          onProjectChange={page.setSelectedProjectId}
          onObjectTypeChange={page.setObjectType}
          onAttachmentChange={page.setAttachment}
          onApply={() => void page.handleApply()}
        />
      </div>
    </div>
  );
}
