import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatMediumDate,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import { formatProjectEndRelative } from "@/domain/spydr/utils/taskDueVsProject";

interface ExtendProjectTargetDialogProps {
  open: boolean;
  projectTitle: string;
  projectTargetDate: string | null;
  requestedDueDate: string;
  isExtending?: boolean;
  error?: string | null;
  onConfirm(): void;
  onCancel(): void;
}

export function ExtendProjectTargetDialog({
  open,
  projectTitle,
  projectTargetDate,
  requestedDueDate,
  isExtending = false,
  error = null,
  onConfirm,
  onCancel,
}: ExtendProjectTargetDialogProps) {
  const relative = formatProjectEndRelative(projectTargetDate);
  const ended = relative?.endsWith("ago") || relative === "yesterday";
  const headline = relative
    ? ended
      ? `This project was due to end ${relative}.`
      : `This project is due to end ${relative}.`
    : "This project has a target date before the task due date.";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isExtending) onCancel();
      }}
    >
      <DialogContent className="max-w-md gap-5 sm:max-w-[26rem]">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <CalendarClock className="h-5 w-5" aria-hidden />
          </div>
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle>Extend the project?</DialogTitle>
            <DialogDescription>{headline}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-2 rounded-lg border border-border/70 bg-muted/15 p-3">
          <div className="flex items-baseline justify-between gap-3 text-[12px]">
            <span className="text-muted-foreground">Project target</span>
            <span className="font-mono tabular-nums text-foreground">
              {formatMediumDate(projectTargetDate)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3 text-[12px]">
            <span className="text-muted-foreground">Requested due date</span>
            <span className="font-mono tabular-nums text-foreground">
              {formatMediumDate(requestedDueDate)}
            </span>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Tasks can&apos;t be due after the project they belong to. Extend{" "}
          <span className="font-medium text-foreground">
            {projectTitle || "this project"}
          </span>{" "}
          to {formatMediumDate(requestedDueDate)} to keep this due date.
        </p>

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isExtending}
          >
            Choose another date
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isExtending}>
            {isExtending
              ? "Extending…"
              : `Extend to ${formatShortDate(requestedDueDate)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
