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
    <div className="mx-auto grid max-w-4xl gap-6 px-6 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:px-8">
      <section className="rounded-md border border-border bg-muted/10 p-4">
        <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Saved note
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">
          {noteContent}
        </p>
      </section>

      <section
        className="flex min-h-[220px] flex-col justify-center rounded-md border border-border bg-background p-6"
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
