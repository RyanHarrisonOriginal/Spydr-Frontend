import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { ProjectPrioritySelect } from "@/domain/spydr/features/projects/components/ProjectPrioritySelect";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import type {
  ActiveNoteProposalOperation,
  OperationPayload,
} from "@/domain/spydr/utils/activeNoteTypes";
import type { ProjectNode, SpydrPriority } from "@/domain/spydr/utils/types";
import { validateOperationPayload } from "../utils/validateActiveNote";
import {
  operationActionLabel,
  operationTitle,
} from "../utils/proposalPresentation";

interface ActiveNoteProposalEditorProps {
  operation: ActiveNoteProposalOperation | null;
  projects: ProjectNode[];
  open: boolean;
  onOpenChange(open: boolean): void;
  onSave(payload: OperationPayload): void;
}

export function ActiveNoteProposalEditor({
  operation,
  projects,
  open,
  onOpenChange,
  onSave,
}: ActiveNoteProposalEditorProps) {
  const [payload, setPayload] = useState<OperationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (operation) {
      setPayload({ ...operation.payload });
      setError(null);
    }
  }, [operation]);

  if (!operation || !payload) return null;

  const title = operationTitle(operation);
  const action = operationActionLabel(operation);

  function updatePayload(next: OperationPayload) {
    setPayload(next);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!operation || !payload) return;
    const validationError = validateOperationPayload(operation, payload);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit: {action}</DialogTitle>
            <DialogDescription>
              Adjust details for “{title}” before applying this change.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5">
            {payload.kind === "task" && (
              <>
                <Field label="Title" htmlFor="edit-task-title">
                  <Input
                    id="edit-task-title"
                    value={payload.title}
                    onChange={(e) =>
                      updatePayload({ ...payload, title: e.target.value })
                    }
                  />
                </Field>
                <Field label="Description" htmlFor="edit-task-description">
                  <Textarea
                    id="edit-task-description"
                    value={payload.description ?? ""}
                    onChange={(e) =>
                      updatePayload({
                        ...payload,
                        description: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Priority">
                  <ProjectPrioritySelect
                    value={(payload.priority as SpydrPriority) || "medium"}
                    onChange={(priority) =>
                      updatePayload({ ...payload, priority })
                    }
                  />
                </Field>
                <Field label="Due date">
                  <DatePicker
                    value={payload.dueDate ?? null}
                    onChange={(dueDate) =>
                      updatePayload({ ...payload, dueDate })
                    }
                    variant="field"
                    allowClear
                  />
                </Field>
                <Field label="Parent project">
                  <ProjectSelect
                    projects={projects}
                    value={payload.projectId ?? ""}
                    onChange={(projectId) =>
                      updatePayload({ ...payload, projectId })
                    }
                    allowUnassigned
                  />
                </Field>
              </>
            )}

            {payload.kind === "note" && (
              <>
                <Field label="Title" htmlFor="edit-note-title">
                  <Input
                    id="edit-note-title"
                    value={payload.title}
                    onChange={(e) =>
                      updatePayload({ ...payload, title: e.target.value })
                    }
                  />
                </Field>
                <Field label="Content" htmlFor="edit-note-content">
                  <Textarea
                    id="edit-note-content"
                    className="min-h-[120px]"
                    value={payload.content}
                    onChange={(e) =>
                      updatePayload({ ...payload, content: e.target.value })
                    }
                  />
                </Field>
                <Field label="Category" htmlFor="edit-note-subtype">
                  <Input
                    id="edit-note-subtype"
                    value={payload.subtype ?? ""}
                    onChange={(e) =>
                      updatePayload({
                        ...payload,
                        subtype: e.target.value || null,
                      })
                    }
                    placeholder="e.g. training_observation"
                  />
                </Field>
                <Field label="Parent project">
                  <ProjectSelect
                    projects={projects}
                    value={payload.projectId ?? ""}
                    onChange={(projectId) =>
                      updatePayload({ ...payload, projectId })
                    }
                    allowUnassigned
                  />
                </Field>
              </>
            )}

            {payload.kind === "project" && (
              <>
                <Field label="Title" htmlFor="edit-project-title">
                  <Input
                    id="edit-project-title"
                    value={payload.title}
                    onChange={(e) =>
                      updatePayload({ ...payload, title: e.target.value })
                    }
                  />
                </Field>
                <Field label="Description" htmlFor="edit-project-description">
                  <Textarea
                    id="edit-project-description"
                    value={payload.description ?? ""}
                    onChange={(e) =>
                      updatePayload({
                        ...payload,
                        description: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Status" htmlFor="edit-project-status">
                  <Input
                    id="edit-project-status"
                    value={payload.status ?? ""}
                    onChange={(e) =>
                      updatePayload({ ...payload, status: e.target.value })
                    }
                  />
                </Field>
              </>
            )}

            {payload.kind === "decision" && (
              <>
                <Field label="Title" htmlFor="edit-decision-title">
                  <Input
                    id="edit-decision-title"
                    value={payload.title}
                    onChange={(e) =>
                      updatePayload({ ...payload, title: e.target.value })
                    }
                  />
                </Field>
                <Field label="Description" htmlFor="edit-decision-description">
                  <Textarea
                    id="edit-decision-description"
                    value={payload.description ?? ""}
                    onChange={(e) =>
                      updatePayload({
                        ...payload,
                        description: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Rationale" htmlFor="edit-decision-rationale">
                  <Textarea
                    id="edit-decision-rationale"
                    value={payload.rationale ?? ""}
                    onChange={(e) =>
                      updatePayload({ ...payload, rationale: e.target.value })
                    }
                  />
                </Field>
                <Field label="Parent project">
                  <ProjectSelect
                    projects={projects}
                    value={payload.projectId ?? ""}
                    onChange={(projectId) =>
                      updatePayload({ ...payload, projectId })
                    }
                    allowUnassigned
                  />
                </Field>
              </>
            )}

            {(payload.kind === "goal" || payload.kind === "idea") && (
              <>
                <Field label="Title" htmlFor="edit-generic-title">
                  <Input
                    id="edit-generic-title"
                    value={payload.title}
                    onChange={(e) =>
                      updatePayload({ ...payload, title: e.target.value })
                    }
                  />
                </Field>
                <Field label="Description" htmlFor="edit-generic-description">
                  <Textarea
                    id="edit-generic-description"
                    value={payload.description ?? ""}
                    onChange={(e) =>
                      updatePayload({
                        ...payload,
                        description: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Parent project">
                  <ProjectSelect
                    projects={projects}
                    value={payload.projectId ?? ""}
                    onChange={(projectId) =>
                      updatePayload({ ...payload, projectId })
                    }
                    allowUnassigned
                  />
                </Field>
              </>
            )}

            {payload.kind === "link" && (
              <>
                <Field label="Source" htmlFor="edit-link-source">
                  <Input
                    id="edit-link-source"
                    value={payload.sourceLabel ?? payload.sourceObjectId ?? ""}
                    onChange={(e) =>
                      updatePayload({
                        ...payload,
                        sourceLabel: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Target" htmlFor="edit-link-target">
                  <Input
                    id="edit-link-target"
                    value={payload.targetLabel ?? ""}
                    onChange={(e) =>
                      updatePayload({
                        ...payload,
                        targetLabel: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Target object id" htmlFor="edit-link-target-id">
                  <Input
                    id="edit-link-target-id"
                    value={payload.targetObjectId}
                    onChange={(e) =>
                      updatePayload({
                        ...payload,
                        targetObjectId: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Relationship type" htmlFor="edit-link-rel">
                  <Input
                    id="edit-link-rel"
                    value={payload.relationshipType}
                    onChange={(e) =>
                      updatePayload({
                        ...payload,
                        relationshipType: e.target.value,
                      })
                    }
                  />
                </Field>
              </>
            )}

            {payload.kind === "person" && (
              <>
                <Field label="Name" htmlFor="edit-person-title">
                  <Input
                    id="edit-person-title"
                    value={payload.title}
                    onChange={(e) =>
                      updatePayload({ ...payload, title: e.target.value })
                    }
                  />
                </Field>
                <Field label="Description" htmlFor="edit-person-description">
                  <Textarea
                    id="edit-person-description"
                    value={payload.description ?? ""}
                    onChange={(e) =>
                      updatePayload({
                        ...payload,
                        description: e.target.value,
                      })
                    }
                  />
                </Field>
              </>
            )}

            {error ? (
              <p className="text-[12.5px] text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
