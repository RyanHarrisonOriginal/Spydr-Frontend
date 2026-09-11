import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
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
import type {
  ProjectAreaNode,
  ProjectTemplate,
  ProjectTemplateListItem,
} from "@/domain/spydr/utils/types";
import type { ProjectFormValues } from "../hooks/useCreateProjectForm";
import { renderTemplatePreview } from "../utils/renderTemplatePreview";
import { ProjectAreaSelect } from "./ProjectAreaSelect";

interface CreateProjectDialogProps {
  areas: ProjectAreaNode[];
  open: boolean;
  values: ProjectFormValues;
  canSubmit: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  linkPersonName?: string;
  triggerVariant?: "default" | "outline";
  hideTrigger?: boolean;
  templates?: ProjectTemplateListItem[];
  hasAnyTemplates?: boolean;
  templateId?: string;
  selectedTemplate?: ProjectTemplate | null;
  templateLoading?: boolean;
  paramValues?: Record<string, string>;
  onOpenChange(open: boolean): void;
  onFieldChange<TField extends keyof ProjectFormValues>(
    field: TField,
    value: ProjectFormValues[TField]
  ): void;
  onTemplateChange?(templateId: string): void;
  onParamChange?(key: string, value: string): void;
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
  linkPersonName,
  triggerVariant = "default",
  hideTrigger = false,
  templates = [],
  hasAnyTemplates = false,
  templateId = "",
  selectedTemplate = null,
  templateLoading = false,
  paramValues = {},
  onOpenChange,
  onFieldChange,
  onTemplateChange,
  onParamChange,
  onSubmit,
}: CreateProjectDialogProps) {
  const usingTemplate = Boolean(templateId);
  const showTemplateSelect = templates.length > 0 || hasAnyTemplates || Boolean(templateId);

  const previewTitle = selectedTemplate
    ? renderTemplatePreview(selectedTemplate.titleTemplate, paramValues)
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {hideTrigger ? null : (
        <DialogTrigger asChild>
          <Button size="sm" variant={triggerVariant} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Button>
        </DialogTrigger>
      )}
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
              {usingTemplate
                ? "Fill in the template parameters to create a ready project with tasks."
                : "Capture the core project node fields and project-specific planning details."}
              {linkPersonName ? (
                <>
                  {" "}
                  <strong>{linkPersonName}</strong> will be set as assignee.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5">
            {showTemplateSelect ? (
              <div className="space-y-2">
                <Label htmlFor="project-template">Template</Label>
                <select
                  id="project-template"
                  value={templateId}
                  onChange={(event) =>
                    onTemplateChange?.(event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-focus"
                >
                  <option value="">Blank</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                      {template.taskCount > 0
                        ? ` (${template.taskCount} tasks)`
                        : ""}
                    </option>
                  ))}
                </select>
                <Link
                  to="/project-templates"
                  className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Manage templates…
                </Link>
              </div>
            ) : null}

              {usingTemplate ? (
                <>
                  <div className="space-y-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Preview
                    </p>
                    <p className="text-sm font-medium">
                      {templateLoading
                        ? "Loading template…"
                        : previewTitle || "—"}
                    </p>
                    {selectedTemplate?.description ? (
                      <p className="text-[12px] text-muted-foreground">
                        {selectedTemplate.description}
                      </p>
                    ) : null}
                  </div>

                  {(selectedTemplate?.parameters ?? []).map((param) => (
                    <div key={param.id} className="space-y-2">
                      <Label htmlFor={`template-param-${param.key}`}>
                        {param.label}
                        {param.required ? "" : " (optional)"}
                      </Label>
                      <Input
                        id={`template-param-${param.key}`}
                        value={paramValues[param.key] ?? ""}
                        onChange={(event) =>
                          onParamChange?.(param.key, event.target.value)
                        }
                        placeholder={param.key}
                        autoFocus={
                          param.sortOrder ===
                          Math.min(
                            ...(selectedTemplate?.parameters.map(
                              (p) => p.sortOrder
                            ) ?? [0])
                          )
                        }
                      />
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label htmlFor="project-area-template">Area</Label>
                    <ProjectAreaSelect
                      areas={areas}
                      value={values.areaNodeId}
                      onChange={(areaNodeId) =>
                        onFieldChange("areaNodeId", areaNodeId ?? "")
                      }
                      className="h-10 text-sm normal-case tracking-normal"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="project-title">Title</Label>
                    <Input
                      id="project-title"
                      value={values.title}
                      onChange={(event) =>
                        onFieldChange("title", event.target.value)
                      }
                      placeholder="Atlas platform migration"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-body">Body</Label>
                    <Textarea
                      id="project-body"
                      value={values.body}
                      onChange={(event) =>
                        onFieldChange("body", event.target.value)
                      }
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
                          onFieldChange(
                            "status",
                            event.target.value as ProjectFormValues["status"]
                          )
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
                          onFieldChange(
                            "priority",
                            event.target.value as ProjectFormValues["priority"]
                          )
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
                          onFieldChange(
                            "riskLevel",
                            event.target.value as ProjectFormValues["riskLevel"]
                          )
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
                      <DatePicker
                        id="project-start-date"
                        value={values.startDate || null}
                        onChange={(startDate) =>
                          onFieldChange("startDate", startDate ?? "")
                        }
                        panelLabel="Start date"
                        clearLabel="Clear start date"
                        placeholder="Select start date"
                        ariaLabel="Project start date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-target-date">Target date</Label>
                      <DatePicker
                        id="project-target-date"
                        value={values.targetDate || null}
                        onChange={(targetDate) =>
                          onFieldChange("targetDate", targetDate ?? "")
                        }
                        panelLabel="Target date"
                        clearLabel="Clear target date"
                        placeholder="Select target date"
                        ariaLabel="Project target date"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-outcome">Outcome</Label>
                    <Input
                      id="project-outcome"
                      value={values.outcome}
                      onChange={(event) =>
                        onFieldChange("outcome", event.target.value)
                      }
                      placeholder="The measurable result this project should produce"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-tags">Tags</Label>
                    <Input
                      id="project-tags"
                      value={values.tags}
                      onChange={(event) =>
                        onFieldChange("tags", event.target.value)
                      }
                      placeholder="infra, platform, q3"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Separate tags with commas.
                    </p>
                  </div>
                </>
              )}

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
