import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import type { ProjectDetailNode } from "@/domain/spydr/utils/types";
import { useCreateProjectTemplateFromProjectMutation } from "../hooks/useCreateProjectTemplateFromProjectMutation";

interface SaveAsTemplateDialogProps {
  project: ProjectDetailNode;
  open: boolean;
  onOpenChange(open: boolean): void;
}

/** Quick snapshot → opens the full template editor page. */
export function SaveAsTemplateDialog({
  project,
  open,
  onOpenChange,
}: SaveAsTemplateDialogProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const mutation = useCreateProjectTemplateFromProjectMutation();

  const submit = () => {
    const trimmed = name.trim() || `${project.title} template`;
    mutation.mutate(
      {
        projectId: project.id,
        name: trimmed,
        taskIds: project.tasks.map((task) => task.id),
      },
      {
        onSuccess: (template) => {
          onOpenChange(false);
          navigate(`/project-templates/${template.id}/edit`);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setName(`${project.title} template`);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
          <DialogDescription>
            Creates a template from this project, then opens the editor so you
            can add parameters and tune fields.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="save-template-name">Name</Label>
          <Input
            id="save-template-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          {mutation.error instanceof Error ? (
            <p className="text-sm text-destructive">{mutation.error.message}</p>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={submit}
          >
            {mutation.isPending ? "Creating…" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
