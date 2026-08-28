import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { ProjectPrioritySelect } from "@/domain/spydr/features/projects/components/ProjectPrioritySelect";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import type { ProjectNode, SpydrPriority } from "@/domain/spydr/utils/types";
import { isTaskStatus } from "@/domain/spydr/utils/taskStatus";
import type { CreateTaskFormValues } from "../hooks/useCreateTaskForm";
import { TaskStatusSelect } from "./TaskStatusSelect";

interface CreateTaskDialogProps {
  projects: ProjectNode[];
  open: boolean;
  values: CreateTaskFormValues;
  canSubmit: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  assigneeName?: string;
  triggerVariant?: "default" | "outline";
  hideTrigger?: boolean;
  onOpenChange(open: boolean): void;
  onFieldChange<TField extends keyof CreateTaskFormValues>(
    field: TField,
    value: CreateTaskFormValues[TField]
  ): void;
  onSubmit(): void;
}

export function CreateTaskDialog({
  projects,
  open,
  values,
  canSubmit,
  isSubmitting,
  errorMessage,
  assigneeName,
  triggerVariant = "default",
  hideTrigger = false,
  onOpenChange,
  onFieldChange,
  onSubmit,
}: CreateTaskDialogProps) {
  const noProjects = projects.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {hideTrigger ? null : (
        <DialogTrigger asChild>
          <Button size="sm" variant={triggerVariant} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Task
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>
            <DialogDescription>
              Add a task and link it to a project. It will appear in both the
              tasks list and the project&apos;s task panel.
              {assigneeName ? (
                <>
                  {" "}
                  Assigned to <strong>{assigneeName}</strong>.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5">
            <div className="space-y-2">
              <Label>Project</Label>
              <ProjectSelect
                projects={projects}
                value={values.projectId}
                onChange={(projectId) =>
                  onFieldChange("projectId", projectId ?? "")
                }
                disabled={isSubmitting || noProjects}
              />
              {noProjects ? (
                <p className="text-[12px] text-muted-foreground">
                  Create a project first before adding tasks.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={values.title}
                onChange={(event) => onFieldChange("title", event.target.value)}
                placeholder="Draft API contract"
                autoFocus={!noProjects}
                disabled={isSubmitting || noProjects}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-body">Notes</Label>
              <Textarea
                id="task-body"
                value={values.body}
                onChange={(event) => onFieldChange("body", event.target.value)}
                placeholder="Optional context or acceptance criteria"
                rows={3}
                disabled={isSubmitting || noProjects}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="task-due">Due date</Label>
                <DatePicker
                  id="task-due"
                  value={values.dueDate || null}
                  onChange={(dueDate) => onFieldChange("dueDate", dueDate ?? "")}
                  disabled={isSubmitting || noProjects}
                  panelLabel="Due date"
                  clearLabel="Clear due date"
                  placeholder="Select due date"
                  ariaLabel="Task due date"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <TaskStatusSelect
                  value={values.status}
                  onChange={(status) => {
                    if (isTaskStatus(status)) {
                      onFieldChange("status", status);
                    }
                  }}
                  disabled={isSubmitting || noProjects}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <ProjectPrioritySelect
                  value={values.priority}
                  onChange={(priority) =>
                    onFieldChange("priority", priority as CreateTaskFormValues["priority"])
                  }
                  disabled={isSubmitting || noProjects}
                  className="w-full"
                />
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Creating…" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
