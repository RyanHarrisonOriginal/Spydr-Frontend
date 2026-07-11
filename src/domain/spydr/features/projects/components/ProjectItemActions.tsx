import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { RichTextEditor } from "@/domain/spydr/features/shared/components/RichTextEditor";
import type { SpydrPriority } from "@/domain/spydr/utils/types";
import type { UpdateProjectChildInput } from "@/domain/spydr/utils/types";
import { taskStatuses } from "@/domain/spydr/utils/taskStatus";
import { cn } from "@/lib/utils";

export type ProjectItemFieldSet =
  | "task"
  | "note"
  | "decision"
  | "idea"
  | "resource";

export interface ProjectItemEditValues {
  title: string;
  body?: string;
  rationale?: string;
  dueDate?: string;
  priority?: SpydrPriority;
  status?: string;
}

interface ProjectItemActionsProps {
  fieldSet: ProjectItemFieldSet;
  values: ProjectItemEditValues;
  onSave: (input: UpdateProjectChildInput) => void;
  onDelete: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
  className?: string;
}

const priorityOptions: SpydrPriority[] = ["low", "medium", "high", "critical"];

export function ProjectItemActions({
  fieldSet,
  values,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
  className,
}: ProjectItemActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectItemEditValues>(values);

  const openEdit = () => {
    setDraft(values);
    setEditOpen(true);
  };

  const handleSave = () => {
    const input: UpdateProjectChildInput = {
      title: draft.title.trim() || undefined,
    };

    if (fieldSet === "task") {
      if (!draft.title.trim()) return;
      input.title = draft.title.trim();
      input.body = draft.body?.trim() ?? "";
      input.dueDate = draft.dueDate || null;
      input.priority = draft.priority;
      input.status = draft.status;
    } else if (fieldSet === "note") {
      input.body = draft.body ?? "";
    } else if (fieldSet === "idea" || fieldSet === "resource") {
      if (!draft.title.trim()) return;
      input.title = draft.title.trim();
      input.body = draft.body?.trim() ?? "";
    } else if (fieldSet === "decision") {
      if (!draft.title.trim()) return;
      input.title = draft.title.trim();
      input.rationale = draft.rationale?.trim() ?? "";
    }

    onSave(input);
    setEditOpen(false);
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        "Move this item to trash? Use the Trash button at the top of the page to restore it later."
      )
    ) {
      return;
    }
    onDelete();
  };

  return (
    <>
      <div className={cn("flex shrink-0 items-center gap-0.5", className)}>
        <button
          type="button"
          onClick={openEdit}
          disabled={isSaving || isDeleting}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          aria-label="Edit"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving || isDeleting}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          aria-label="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md gap-3 p-4">
          <DialogHeader>
            <DialogTitle className="text-base">Edit {fieldSet}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Title
              </span>
              <input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                placeholder={fieldSet === "note" ? "Title (optional)" : undefined}
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px] ring-focus"
              />
            </label>

            {fieldSet === "note" && (
              <label className="block space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Body
                </span>
                <RichTextEditor
                  value={draft.body ?? ""}
                  onChange={(body) => setDraft((current) => ({ ...current, body }))}
                  minHeightClassName="min-h-[7rem]"
                />
              </label>
            )}

            {(fieldSet === "idea" || fieldSet === "resource" || fieldSet === "task") && (
              <label className="block space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {fieldSet === "task" ? "Description" : "Body"}
                </span>
                <textarea
                  value={draft.body ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, body: event.target.value }))
                  }
                  rows={3}
                  className="w-full resize-y rounded-md border border-input bg-background px-2.5 py-1.5 text-[12px] ring-focus"
                />
              </label>
            )}

            {fieldSet === "decision" && (
              <label className="block space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Rationale
                </span>
                <textarea
                  value={draft.rationale ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      rationale: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full resize-y rounded-md border border-input bg-background px-2.5 py-1.5 text-[12px] ring-focus"
                />
              </label>
            )}

            {fieldSet === "task" && (
              <>
                <label className="block space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Due date
                  </span>
                  <DatePicker
                    value={draft.dueDate || null}
                    onChange={(dueDate) =>
                      setDraft((current) => ({
                        ...current,
                        dueDate: dueDate ?? "",
                      }))
                    }
                    panelLabel="Due date"
                    clearLabel="Clear due date"
                    placeholder="Select due date"
                    ariaLabel="Task due date"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Status
                    </span>
                    <select
                      value={draft.status ?? "active"}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-[12px] ring-focus"
                    >
                      {taskStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Priority
                    </span>
                    <select
                      value={draft.priority ?? "medium"}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          priority: event.target.value as SpydrPriority,
                        }))
                      }
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-[12px] ring-focus"
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={(fieldSet !== "note" && !draft.title.trim()) || isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
