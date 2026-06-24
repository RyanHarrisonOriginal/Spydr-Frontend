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
import type { ProjectAreaNode } from "@/domain/spydr/utils/types";
import type { ProjectFormValues } from "../hooks/useCreateProjectForm";
import { ProjectAreaSelect } from "./ProjectAreaSelect";

interface CreateProjectDialogProps {
  areas: ProjectAreaNode[];
  open: boolean;
  values: ProjectFormValues;
  canSubmit: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onOpenChange(open: boolean): void;
  onFieldChange<TField extends keyof ProjectFormValues>(
    field: TField,
    value: ProjectFormValues[TField]
  ): void;
  onSubmit(): void;
}

const statusOptions = ["active", "waiting", "blocked", "inactive"] as const;
const priorityOptions = ["low", "medium", "high", "critical"] as const;

export function CreateProjectDialog({
  areas,
  open,
  values,
  canSubmit,
  isSubmitting,
  errorMessage,
  onOpenChange,
  onFieldChange,
  onSubmit,
}: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Capture the core project node fields and project-specific planning details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5">
            <div className="space-y-2">
              <Label htmlFor="project-title">Title</Label>
              <Input
                id="project-title"
                value={values.title}
                onChange={(event) => onFieldChange("title", event.target.value)}
                placeholder="Atlas platform migration"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-body">Body</Label>
              <Textarea
                id="project-body"
                value={values.body}
                onChange={(event) => onFieldChange("body", event.target.value)}
                placeholder="What is this project about?"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>
                <select
                  id="project-status"
                  value={values.status}
                  onChange={(event) =>
                    onFieldChange("status", event.target.value as ProjectFormValues["status"])
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-focus"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-priority">Priority</Label>
                <select
                  id="project-priority"
                  value={values.priority}
                  onChange={(event) =>
                    onFieldChange("priority", event.target.value as ProjectFormValues["priority"])
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-focus"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-risk">Delivery risk</Label>
                <select
                  id="project-risk"
                  value={values.riskLevel}
                  onChange={(event) =>
                    onFieldChange("riskLevel", event.target.value as ProjectFormValues["riskLevel"])
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-focus"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  How likely this project is to slip or fail.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="project-area">Area</Label>
                <ProjectAreaSelect
                  areas={areas}
                  value={values.areaNodeId}
                  onChange={(areaNodeId) =>
                    onFieldChange("areaNodeId", areaNodeId ?? "")
                  }
                  className="h-10 text-sm normal-case tracking-normal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-start-date">Start date</Label>
                <Input
                  id="project-start-date"
                  type="date"
                  value={values.startDate}
                  onChange={(event) => onFieldChange("startDate", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-target-date">Target date</Label>
                <Input
                  id="project-target-date"
                  type="date"
                  value={values.targetDate}
                  onChange={(event) => onFieldChange("targetDate", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-outcome">Outcome</Label>
              <Input
                id="project-outcome"
                value={values.outcome}
                onChange={(event) => onFieldChange("outcome", event.target.value)}
                placeholder="The measurable result this project should produce"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-tags">Tags</Label>
              <Input
                id="project-tags"
                value={values.tags}
                onChange={(event) => onFieldChange("tags", event.target.value)}
                placeholder="infra, platform, q3"
              />
              <p className="text-[11px] text-muted-foreground">
                Separate tags with commas.
              </p>
            </div>

            {errorMessage && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
