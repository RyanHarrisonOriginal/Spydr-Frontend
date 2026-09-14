import { Button } from "@/components/ui/button";
import type { AnalysisStatusText } from "../hooks/useActiveNotePage";

interface ActiveNoteAnalysisStateProps {
  noteContent: string;
  statusText: AnalysisStatusText;
  isAnalyzing: boolean;
  errorMessage: string | null;
  onCancel(): void;
  onRetry(): void;
  onReturn(): void;
}

export function ActiveNoteAnalysisState({
  noteContent,
  statusText,
  isAnalyzing,
  errorMessage,
  onCancel,
  onRetry,
  onReturn,
}: ActiveNoteAnalysisStateProps) {
  return (
    <div className="mx-auto grid h-full min-h-0 max-w-4xl content-start gap-6 overflow-y-auto px-4 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:overflow-hidden md:px-8">
      <section className="flex min-h-0 flex-col rounded-md border border-border bg-muted/10 p-4">
        <h2 className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Saved note
        </h2>
        <div className="mt-3 h-[200px] overflow-y-auto overscroll-contain rounded-md border border-border bg-background px-3 py-2.5 md:h-[320px]">
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">
            {noteContent}
          </p>
        </div>
      </section>

      <section
        className="flex min-h-[220px] shrink-0 flex-col justify-center rounded-md border border-border bg-background p-6 md:min-h-0"
        aria-busy={isAnalyzing}
        aria-live="polite"
      >
        {errorMessage ? (
          <>
            <h2 className="text-[15px] font-semibold tracking-tight">
              Analysis failed
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground" role="alert">
              {errorMessage}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" onClick={onRetry}>
                Retry analysis
              </Button>
              <Button type="button" variant="outline" onClick={onReturn}>
                Return to note
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 h-5 w-5 animate-spin rounded-full border border-border border-t-highlight" />
            <h2 className="text-[15px] font-semibold tracking-tight">
              Analyzing note
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">{statusText}</p>
            <div className="mt-5">
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
