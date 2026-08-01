import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SpydrMark } from "@/components/SpydrMark";
import { WebField } from "@/components/WebField";
import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { ACTIVE_NOTE_MAX_LENGTH } from "@/domain/spydr/utils/activeNoteTypes";
import type { ActiveNoteSaveState } from "../hooks/useActiveNotePage";
import { cn } from "@/lib/utils";
import { ActiveNoteProjectBrowser } from "./ActiveNoteProjectBrowser";

interface ActiveNoteComposerProps {
  content: string;
  projectId: string | null;
  projects: ProjectNode[];
  tasks: TaskNode[];
  projectsLoading: boolean;
  characterCount: number;
  saveState: ActiveNoteSaveState;
  errorMessage: string | null;
  isBusy: boolean;
  onContentChange(value: string): void;
  onProjectChange(projectId: string | null): void;
  onSave(): void;
  onAnalyze(): void;
}

function saveLabel(saveState: ActiveNoteSaveState): string {
  switch (saveState) {
    case "pending":
      return "Unsaved changes";
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      return "Save failed";
    case "unsaved":
      return "Unsaved";
    default:
      return "Draft";
  }
}

export function ActiveNoteComposer({
  content,
  projectId,
  projects,
  tasks,
  projectsLoading,
  characterCount,
  saveState,
  errorMessage,
  isBusy,
  onContentChange,
  onProjectChange,
  onSave,
  onAnalyze,
}: ActiveNoteComposerProps) {
  const overLimit = characterCount > ACTIVE_NOTE_MAX_LENGTH;
  const canSubmit = content.trim().length > 0 && !overLimit && !isBusy;
  const selectedProject = projects.find((project) => project.id === projectId);

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        aria-hidden
      >
        <WebField className="h-full w-full" intensity="ambient" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/92 to-background/70" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 18% 0%, color-mix(in oklab, var(--highlight) 12%, transparent), transparent 58%)",
          }}
        />
      </div>

      <ActiveNoteProjectBrowser
        projects={projects}
        tasks={tasks}
        selectedProjectId={projectId}
        loading={projectsLoading}
        disabled={isBusy}
        onSelectProject={onProjectChange}
      />

      <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden px-6 py-10 md:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-10">
            <div className="flex items-center gap-2.5">
              <SpydrMark size={40} className="shrink-0" alt="Spydr" />
              <span className="text-[1.35rem] font-semibold leading-none tracking-[-0.04em] text-foreground">
                Spydr<span className="text-highlight-secondary">.</span>
              </span>
            </div>

            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-highlight">
              Active Note
            </p>
            <h1 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.04em] text-foreground md:text-[2.15rem]">
              What’s moving?
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
              Drop a raw note. Spydr will propose projects, tasks, people, and
              decisions — you choose what to keep.
            </p>
          </div>

          <div className="rounded-md border border-border/80 bg-background/80 p-4 shadow-sm backdrop-blur-sm md:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <Label
                htmlFor="active-note-content"
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                Your note
              </Label>
              <div className="flex items-center gap-3">
                {selectedProject ? (
                  <span className="max-w-[14rem] truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Context · {selectedProject.title}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    Optional project context
                  </span>
                )}
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-wider",
                    saveState === "error" || overLimit
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                  aria-live="polite"
                >
                  {saveLabel(saveState)}
                </span>
              </div>
            </div>

            <Textarea
              id="active-note-content"
              value={content}
              onChange={(event) => onContentChange(event.target.value)}
              placeholder="Write what happened, what you decided, or what needs to happen next…"
              className="min-h-[280px] resize-y border-border/70 bg-muted/15 text-[15px] leading-relaxed md:min-h-[320px]"
              disabled={isBusy}
              autoFocus
              aria-invalid={Boolean(errorMessage) || overLimit}
              aria-describedby={
                errorMessage || overLimit
                  ? "active-note-content-error"
                  : "active-note-char-count"
              }
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p
                id="active-note-char-count"
                className={cn(
                  "font-mono text-[11px] tabular-nums text-muted-foreground",
                  overLimit && "text-destructive"
                )}
              >
                {characterCount.toLocaleString()} /{" "}
                {ACTIVE_NOTE_MAX_LENGTH.toLocaleString()}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSave}
                  disabled={!canSubmit && saveState !== "error"}
                >
                  Save draft
                </Button>
                <Button
                  type="button"
                  onClick={onAnalyze}
                  disabled={!canSubmit}
                  className="gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze note
                  <ArrowRight className="h-3.5 w-3.5 opacity-80" />
                </Button>
              </div>
            </div>

            {(errorMessage || overLimit) && (
              <p
                id="active-note-content-error"
                className="mt-3 text-[12.5px] text-destructive"
                role="alert"
              >
                {errorMessage ??
                  `Notes can be at most ${ACTIVE_NOTE_MAX_LENGTH.toLocaleString()} characters.`}
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Capture",
                text: "Meetings, decisions, blockers, next steps.",
              },
              {
                label: "Review",
                text: "Accept only the proposals that fit.",
              },
              {
                label: "Apply",
                text: "Write real objects into your workspace.",
              },
            ].map((item) => (
              <div key={item.label} className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground/90">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
