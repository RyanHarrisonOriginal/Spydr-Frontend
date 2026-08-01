import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { cn } from "@/lib/utils";
import { ActiveNoteAnalysisState } from "../components/ActiveNoteAnalysisState";
import { ActiveNoteCompletionSummary } from "../components/ActiveNoteCompletionSummary";
import { ActiveNoteComposer } from "../components/ActiveNoteComposer";
import { ActiveNoteReview } from "../components/ActiveNoteReview";
import { useActiveNotePage } from "../hooks/useActiveNotePage";

export function ActiveNotePage() {
  const page = useActiveNotePage();
  usePageBreadcrumb("Active Note");
  const isCompose = page.phase === "compose";
  const canReturnToNote =
    page.phase === "review" ||
    page.phase === "analyze" ||
    page.phase === "completed";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {!isCompose ? (
        <PageHeader
          className="shrink-0"
          dense={page.phase === "review"}
          title={
            page.phase === "review" ? "Active Note Review" : "Active Note"
          }
          meta={
            <span>
              {page.phase === "analyze" && "Analyzing"}
              {page.phase === "review" && "Review proposals"}
              {page.phase === "completed" && "Completed"}
            </span>
          }
          actions={
            canReturnToNote ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  if (page.phase === "analyze") {
                    page.handleCancelAnalysis();
                    return;
                  }
                  if (page.phase === "completed") {
                    page.resetToCompose({ keepContent: true });
                    return;
                  }
                  page.returnToCompose();
                }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to note
              </Button>
            ) : null
          }
        />
      ) : null}

      <div
        className={cn(
          "min-h-0 flex-1",
          page.phase === "compose" || page.phase === "review"
            ? "overflow-hidden"
            : "overflow-y-auto"
        )}
      >
        {page.phase === "compose" && (
          <ActiveNoteComposer
            content={page.content}
            projectId={page.projectId}
            projects={page.projects}
            tasks={page.tasks}
            projectsLoading={page.projectsLoading}
            characterCount={page.characterCount}
            saveState={page.saveState}
            errorMessage={page.composeError}
            isBusy={page.saveState === "saving"}
            onContentChange={page.handleContentChange}
            onProjectChange={page.setProjectId}
            onSave={() => void page.handleSave()}
            onAnalyze={() => void page.handleAnalyze()}
          />
        )}

        {page.phase === "analyze" && (
          <ActiveNoteAnalysisState
            noteContent={page.content}
            statusText={page.analysisStatus}
            isAnalyzing={page.isAnalyzing}
            errorMessage={page.analysisError}
            onCancel={page.handleCancelAnalysis}
            onRetry={() => void page.handleRetryAnalysis()}
            onReturn={page.returnToCompose}
          />
        )}

        {page.phase === "review" && page.proposal && (
          <ActiveNoteReview
            proposal={page.proposal}
            operations={page.operations}
            projects={page.projects}
            content={page.content}
            characterCount={page.characterCount}
            selectedCount={page.selectedCount}
            isApplying={page.isApplying}
            isReanalyzing={page.isAnalyzing}
            applyError={page.applyError}
            noteError={page.composeError}
            validationErrors={page.validationErrors}
            editingOperationId={page.editingOperationId}
            onContentChange={page.handleContentChange}
            onReanalyze={() => void page.handleAnalyze()}
            onToggleSelected={page.toggleOperationSelected}
            onReject={page.rejectOperation}
            onEdit={page.setEditingOperationId}
            onEditingOpenChange={(open) => {
              if (!open) page.setEditingOperationId(null);
            }}
            onSaveEditedPayload={page.saveEditedPayload}
            onDuplicateResolution={page.setDuplicateResolution}
            onProjectChange={page.setSelectedProjectId}
            onApply={() => void page.handleApply()}
          />
        )}

        {page.phase === "completed" && page.applyResult && (
          <ActiveNoteCompletionSummary
            result={page.applyResult}
            applyError={page.applyError}
            onCreateAnother={() => page.resetToCompose()}
          />
        )}
      </div>
    </div>
  );
}
