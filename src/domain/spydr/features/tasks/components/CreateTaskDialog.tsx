import { useMemo, useState } from "react";
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
import { ProjectPrioritySelect } from "@/domain/spydr/features/projects/components/ProjectPrioritySelect";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import type { ProjectNode, SpydrPriority } from "@/domain/spydr/utils/types";
import { useTasksQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { isTaskStatus } from "@/domain/spydr/utils/taskStatus";
import { cn } from "@/lib/utils";
import type { CreateTaskFormValues } from "../hooks/useCreateTaskForm";
import { useEnsureTaskDueWithinProject } from "../hooks/useEnsureTaskDueWithinProject";
import { TaskDueDateSelect } from "./TaskDueDateSelect";
import { TaskStatusSelect } from "./TaskStatusSelect";
import { EmojiPicker } from "@/domain/spydr/features/shared/components/EmojiPicker";

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
  const selectedProject =
    projects.find((project) => project.id === values.projectId) ?? null;
  const dueGuard = useEnsureTaskDueWithinProject();
  const tasksQuery = useTasksQuery();
  const [blockerQuery, setBlockerQuery] = useState("");
  const blockerTasks = useMemo(() => {
    const needle = blockerQuery.trim().toLowerCase();
    return (tasksQuery.data ?? []).filter((task) =>
      needle ? task.title.toLowerCase().includes(needle) : true
    );
  }, [blockerQuery, tasksQuery.data]);

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
            dueGuard.ensure({
              project: selectedProject,
              dueDate: values.dueDate || null,
              onAllowed: onSubmit,
            });
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
                onChange={(projectId) => {
                  const nextProject =
                    projects.find((project) => project.id === (projectId ?? "")) ??
                    null;
                  dueGuard.ensure({
                    project: nextProject,
                    dueDate: values.dueDate || null,
                    onAllowed: () => onFieldChange("projectId", projectId ?? ""),
                  });
                }}
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
              <div className="flex items-center gap-2">
                <EmojiPicker
                  value={values.emoji}
                  size="md"
                  ariaLabel="Task emoji"
                  onChange={(emoji) => onFieldChange("emoji", emoji)}
                />
                <Input
                  id="task-title"
                  value={values.title}
                  onChange={(event) => onFieldChange("title", event.target.value)}
                  placeholder="Draft API contract"
                  autoFocus={!noProjects}
                  disabled={isSubmitting || noProjects}
                  className="flex-1"
                />
              </div>
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
                <TaskDueDateSelect
                  id="task-due"
                  value={values.dueDate || null}
                  onChange={(dueDate) => onFieldChange("dueDate", dueDate ?? "")}
                  disabled={isSubmitting || noProjects}
                  variant="field"
                  placeholder="Select due date"
                  project={selectedProject}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <TaskStatusSelect
                  value={values.status}
                  collectContext={false}
                  onChange={(change) => {
                    if (!isTaskStatus(change.status)) return;
                    onFieldChange("status", change.status);
                    if (change.status !== "blocked") onFieldChange("blockedByTaskId", "");
                    if (change.status !== "waiting") {
                      onFieldChange("followUpAt", "");
                      onFieldChange("waitingNote", "");
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

            {values.status === "blocked" ? (
              <div className="space-y-2">
                <Label htmlFor="create-blocker-search">Blocking task</Label>
                <Input
                  id="create-blocker-search"
                  value={blockerQuery}
                  onChange={(event) => setBlockerQuery(event.target.value)}
                  placeholder="Search tasks"
                  disabled={isSubmitting || noProjects}
                />
                <div className="max-h-40 overflow-y-auto rounded-md border border-border">
                  {blockerTasks.length === 0 ? (
                    <p className="px-3 py-2 text-[12px] text-muted-foreground">No tasks found.</p>
                  ) : (
                    blockerTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        className={cn(
                          "block w-full truncate px-3 py-2 text-left text-[13px] hover:bg-muted/40",
                          task.id === values.blockedByTaskId && "bg-muted/60"
                        )}
                        disabled={isSubmitting}
                        onClick={() => onFieldChange("blockedByTaskId", task.id)}
                      >
                        {task.title}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {values.status === "waiting" ? (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-follow-up">Follow-up time</Label>
                  <Input
                    id="create-follow-up"
                    type="datetime-local"
                    value={values.followUpAt}
                    onChange={(event) => onFieldChange("followUpAt", event.target.value)}
                    disabled={isSubmitting || noProjects}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-waiting-note">Note</Label>
                  <Textarea
                    id="create-waiting-note"
                    value={values.waitingNote}
                    onChange={(event) => onFieldChange("waitingNote", event.target.value)}
                    placeholder="What are you waiting on?"
                    rows={3}
                    disabled={isSubmitting || noProjects}
                  />
                </div>
              </div>
            ) : null}

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
        {dueGuard.dialog}
      </DialogContent>
    </Dialog>
  );
}
