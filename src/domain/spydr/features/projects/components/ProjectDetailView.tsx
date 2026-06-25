import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArchiveRestore,
  ArrowRight,
  ArrowUpRight,
  FileText,
  GitBranch,
  Lightbulb,
  Paperclip,
  Tag as TagIcon,
} from "lucide-react";
import { DateInput } from "@/components/ui/date-input";
import { Button } from "@/components/ui/button";
import type {
  ProjectChildKind,
  ProjectDetailNode,
  SpydrPriority,
  UpdateProjectChildInput,
} from "@/domain/spydr/utils/types";
import { taskStatusBucketLabels } from "@/domain/spydr/utils/taskStatus";
import type { ProjectDetailSaveState } from "../hooks/useProjectDetailPage";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EntityTag,
  PriorityBadge,
  StatusDot,
  StatusPill,
} from "@/domain/spydr/features/shared/components/StatusPrimitives";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import type {
  ProjectDecisionFormValues,
  ProjectDetailFormValues,
  ProjectIdeaFormValues,
  ProjectNoteFormValues,
  ProjectTaskFormValues,
} from "../hooks/useProjectDetailPage";
import { ProjectDecisionLog } from "./ProjectDecisionLog";
import { ProjectNotesLog } from "./ProjectNotesLog";
import { ProjectResourcesList } from "./ProjectResourcesList";
import {
  ProjectDetailField,
  ProjectDetailFormPanel,
  ProjectDetailInlineError,
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
  detailFieldClassName,
  detailInsetPanelClassName,
  detailTextareaClassName,
} from "./ProjectDetailSection";
import {
  ProjectDeletedItems,
  PROJECT_TRASH_SECTION_ID,
  getDeletedItemCount,
} from "./ProjectDeletedItems";
import { ProjectItemActions } from "./ProjectItemActions";

interface ProjectDetailViewProps {
  project: ProjectDetailNode;
  deleted: ProjectDetailNode["deleted"];
  stats: {
    connected: {
      tasks: {
        total: number;
        open: number;
        closed: number;
        blocked: number;
      };
      decisions: number;
      notes: number;
      ideas: number;
      resources: number;
    };
    progressPercent: number;
    openTaskCount: number;
  };
  detailForm: ProjectDetailFormValues;
  detailSaveState: ProjectDetailSaveState;
  taskForm: ProjectTaskFormValues;
  noteForm: ProjectNoteFormValues;
  decisionForm: ProjectDecisionFormValues;
  ideaForm: ProjectIdeaFormValues;
  canAddTask: boolean;
  canAddNote: boolean;
  canAddDecision: boolean;
  canAddIdea: boolean;
  isAddingTask: boolean;
  isAddingNote: boolean;
  isAddingDecision: boolean;
  isAddingIdea: boolean;
  detailError: string | null;
  taskError: string | null;
  noteError: string | null;
  decisionError: string | null;
  ideaError: string | null;
  onDetailFieldChange<TField extends keyof ProjectDetailFormValues>(
    field: TField,
    value: ProjectDetailFormValues[TField]
  ): void;
  onTaskFieldChange<TField extends keyof ProjectTaskFormValues>(
    field: TField,
    value: ProjectTaskFormValues[TField]
  ): void;
  onNoteFieldChange<TField extends keyof ProjectNoteFormValues>(
    field: TField,
    value: ProjectNoteFormValues[TField]
  ): void;
  onDecisionFieldChange<TField extends keyof ProjectDecisionFormValues>(
    field: TField,
    value: ProjectDecisionFormValues[TField]
  ): void;
  onIdeaFieldChange<TField extends keyof ProjectIdeaFormValues>(
    field: TField,
    value: ProjectIdeaFormValues[TField]
  ): void;
  onAddTask(): void;
  onAddNote(): void;
  onAddDecision(): void;
  onAddIdea(): void;
  onUpdateChild(
    kind: ProjectChildKind,
    childId: string,
    input: UpdateProjectChildInput
  ): void;
  onDeleteChild(kind: ProjectChildKind, childId: string): void;
  onRestoreChild(kind: ProjectChildKind, childId: string): void;
  isUpdatingChild: boolean;
  isDeletingChild: boolean;
  isRestoringChild: boolean;
  restoringId: string | null;
  childMutationError: string | null;
}

const priorityOptions: SpydrPriority[] = ["low", "medium", "high", "critical"];

export function ProjectDetailView({
  project,
  deleted,
  stats,
  detailForm,
  detailSaveState,
  taskForm,
  noteForm,
  decisionForm,
  ideaForm,
  canAddTask,
  canAddNote,
  canAddDecision,
  canAddIdea,
  isAddingTask,
  isAddingNote,
  isAddingDecision,
  isAddingIdea,
  detailError,
  taskError,
  noteError,
  decisionError,
  ideaError,
  onDetailFieldChange,
  onTaskFieldChange,
  onNoteFieldChange,
  onDecisionFieldChange,
  onIdeaFieldChange,
  onAddTask,
  onAddNote,
  onAddDecision,
  onAddIdea,
  onUpdateChild,
  onDeleteChild,
  onRestoreChild,
  isUpdatingChild,
  isDeletingChild,
  isRestoringChild,
  restoringId,
  childMutationError,
}: ProjectDetailViewProps) {
  const deletedCount = getDeletedItemCount(deleted);
  const [trashExpanded, setTrashExpanded] = useState(false);
  const prevDeletedCountRef = useRef(deletedCount);

  useEffect(() => {
    if (deletedCount > prevDeletedCountRef.current) {
      setTrashExpanded(true);
      requestAnimationFrame(() => {
        document
          .getElementById(PROJECT_TRASH_SECTION_ID)
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
    prevDeletedCountRef.current = deletedCount;
  }, [deletedCount]);

  const openTrash = () => {
    setTrashExpanded(true);
    requestAnimationFrame(() => {
      document
        .getElementById(PROJECT_TRASH_SECTION_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="flex min-w-0">
      <div className="min-w-0 flex-1">
        <PageHeader
          eyebrow={
            <span className="flex items-center gap-2">
              <Link to="/projects" className="hover:text-foreground">
                Projects
              </Link>
              <span>/</span>
              <span>{project.id.slice(0, 8)}</span>
            </span>
          }
          title={project.title}
          meta={
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] capitalize">
                <StatusDot status={project.status} /> {project.status.replace(/_/g, " ")}
              </span>
              <PriorityBadge priority={project.priority} />
              {project.area && <EntityTag tag={project.area} />}
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-px font-mono text-[10px] uppercase"
                >
                  <TagIcon className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
              <span className="text-border">·</span>
              <span className="font-mono text-[11px]">
                updated {formatRelativeTime(project.updatedAt)}
              </span>
            </div>
          }
          actions={
            deletedCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={openTrash}
              >
                <ArchiveRestore className="h-3 w-3" />
                Trash
                <span className="rounded-full bg-muted px-1.5 py-px font-mono text-[9px] font-semibold tabular-nums leading-none text-foreground/80">
                  {deletedCount}
                </span>
              </Button>
            ) : undefined
          }
        />

        {deletedCount > 0 && (
          <div className="px-6 pt-2">
            <ProjectDeletedItems
              deleted={deleted}
              expanded={trashExpanded}
              onExpandedChange={setTrashExpanded}
              onRestore={onRestoreChild}
              isRestoring={isRestoringChild}
              restoringId={restoringId}
            />
          </div>
        )}

        <div className="space-y-5 px-6 pb-5 pt-2">
          <ProjectDetailSection>
            <ProjectDetailSectionHeader
              label="Overview"
              hint={detailSaveLabel(detailSaveState) ?? undefined}
              hintClassName={
                detailSaveState === "error" ? "text-destructive" : undefined
              }
            />
            <ProjectDetailSectionBody className="gap-5">
              <div className={detailInsetPanelClassName}>
                <ConnectedSummary connected={stats.connected} />
              </div>

              <ProjectDetailField label="Brief">
                <textarea
                  value={detailForm.body}
                  onChange={(event) =>
                    onDetailFieldChange("body", event.target.value)
                  }
                  placeholder="Describe the project brief, context, and intent."
                  rows={4}
                  className={detailTextareaClassName}
                />
              </ProjectDetailField>

              <ProjectDetailFormPanel label="Timeline">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <ProjectDetailField label="Start">
                      <DateInput
                        value={detailForm.startDate}
                        onChange={(event) =>
                          onDetailFieldChange("startDate", event.target.value)
                        }
                        className="h-8"
                      />
                    </ProjectDetailField>
                    <ArrowRight
                      aria-hidden
                      className="mb-2 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    />
                    <ProjectDetailField label="Target">
                      <DateInput
                        value={detailForm.targetDate}
                        onChange={(event) =>
                          onDetailFieldChange("targetDate", event.target.value)
                        }
                        className="h-8"
                      />
                    </ProjectDetailField>
                  </div>
                  <ProjectDetailField
                    label="Delivery risk"
                    hint="Likelihood this project slips or fails"
                    className="lg:w-44"
                  >
                    <select
                      value={detailForm.riskLevel}
                      onChange={(event) =>
                        onDetailFieldChange(
                          "riskLevel",
                          event.target.value as SpydrPriority
                        )
                      }
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-[12px] ring-focus"
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </ProjectDetailField>
                </div>
              </ProjectDetailFormPanel>

              {project.details?.outcome && (
                <div className={detailInsetPanelClassName}>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Outcome
                  </p>
                  <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed">
                    {project.details.outcome}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/15 px-3 py-2.5">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-highlight-secondary transition-[width]"
                    style={{ width: `${stats.progressPercent}%` }}
                  />
                </div>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {stats.progressPercent}% tasks closed
                </span>
              </div>

              {detailError && (
                <ProjectDetailInlineError>{detailError}</ProjectDetailInlineError>
              )}
            </ProjectDetailSectionBody>
          </ProjectDetailSection>

          {childMutationError && (
            <ProjectDetailInlineError>{childMutationError}</ProjectDetailInlineError>
          )}
        </div>

        <div className="grid gap-5 px-6 pb-8 xl:grid-cols-2">
          <ProjectDetailSection>
            <ProjectDetailSectionHeader
              icon={<Activity className="h-3.5 w-3.5" />}
              label="In motion"
              hint={`${stats.openTaskCount} open`}
            />
            <ProjectDetailSectionBody>
            <ProjectDetailFormPanel>
            <form
              className="grid gap-2 md:grid-cols-[1fr_118px_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                onAddTask();
              }}
            >
              <input
                value={taskForm.title}
                onChange={(event) => onTaskFieldChange("title", event.target.value)}
                placeholder="Add a task..."
                className={cn(detailFieldClassName, "h-8")}
              />
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(event) => onTaskFieldChange("dueDate", event.target.value)}
                className="date-input h-8 rounded-md"
              />
              <Button type="submit" size="sm" disabled={!canAddTask}>
                {isAddingTask ? "Adding..." : "Add"}
              </Button>
            </form>
            </ProjectDetailFormPanel>
            {taskError && <ProjectDetailInlineError>{taskError}</ProjectDetailInlineError>}
            <ul className="max-h-[280px] space-y-2 overflow-y-auto">
              {project.tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 shadow-sm"
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={task.status === "completed"}
                    className="h-3.5 w-3.5 shrink-0 accent-primary"
                  />
                  <StatusPill status={task.status} />
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {task.title}
                  </span>
                  <span className="w-20 shrink-0 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                    {formatShortDate(task.details?.dueDate)}
                  </span>
                  <ProjectItemActions
                    fieldSet="task"
                    values={{
                      title: task.title,
                      body: task.body,
                      dueDate: task.details?.dueDate?.slice(0, 10) ?? "",
                      priority: task.priority as SpydrPriority,
                      status: task.status,
                    }}
                    onSave={(input) => onUpdateChild("task", task.id, input)}
                    onDelete={() => onDeleteChild("task", task.id)}
                    isSaving={isUpdatingChild}
                    isDeleting={isDeletingChild}
                  />
                </li>
              ))}
              {!project.tasks.length && (
                <li className="rounded-lg border border-dashed border-border/80 bg-muted/10 py-6 text-center text-sm text-muted-foreground">
                  No tasks linked yet.
                </li>
              )}
            </ul>
            </ProjectDetailSectionBody>
          </ProjectDetailSection>

          <ProjectDecisionLog
            decisions={project.decisions}
            form={decisionForm}
            canAdd={canAddDecision}
            isAdding={isAddingDecision}
            error={decisionError}
            onFieldChange={onDecisionFieldChange}
            onAdd={onAddDecision}
            onUpdate={(childId, input) => onUpdateChild("decision", childId, input)}
            onDelete={(childId) => onDeleteChild("decision", childId)}
            isUpdating={isUpdatingChild}
            isDeleting={isDeletingChild}
          />

          <ProjectDetailSection>
            <ProjectDetailSectionHeader
              icon={<Lightbulb className="h-3.5 w-3.5" />}
              label="Thinking"
              hint={`${project.ideas.length} ideas`}
            />
            <ProjectDetailSectionBody>
            <ProjectDetailFormPanel>
            <form
              className="grid gap-2 md:grid-cols-[1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                onAddIdea();
              }}
            >
              <input
                value={ideaForm.title}
                onChange={(event) => onIdeaFieldChange("title", event.target.value)}
                placeholder="Capture an idea..."
                className={cn(detailFieldClassName, "h-8")}
              />
              <Button type="submit" size="sm" disabled={!canAddIdea}>
                {isAddingIdea ? "Adding..." : "Add"}
              </Button>
            </form>
            </ProjectDetailFormPanel>
            {ideaError && <ProjectDetailInlineError>{ideaError}</ProjectDetailInlineError>}
            <div className="max-h-[220px] space-y-2 overflow-y-auto">
              {project.ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="rounded-md border border-border/60 bg-background px-3 py-2.5 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                      {idea.title}
                    </h3>
                    <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {formatRelativeTime(idea.updatedAt)}
                    </span>
                    <ProjectItemActions
                      fieldSet="idea"
                      values={{ title: idea.title, body: idea.body }}
                      onSave={(input) => onUpdateChild("idea", idea.id, input)}
                      onDelete={() => onDeleteChild("idea", idea.id)}
                      isSaving={isUpdatingChild}
                      isDeleting={isDeletingChild}
                    />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                    {idea.body}
                  </p>
                </div>
              ))}
              {!project.ideas.length && (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 py-6 text-center text-sm text-muted-foreground">
                  No ideas linked yet.
                </div>
              )}
            </div>
            </ProjectDetailSectionBody>
          </ProjectDetailSection>

          <ProjectNotesLog
            notes={project.notes}
            form={noteForm}
            canAdd={canAddNote}
            isAdding={isAddingNote}
            error={noteError}
            onFieldChange={onNoteFieldChange}
            onAdd={onAddNote}
            onUpdate={(childId, input) => onUpdateChild("note", childId, input)}
            onDelete={(childId) => onDeleteChild("note", childId)}
            isUpdating={isUpdatingChild}
            isDeleting={isDeletingChild}
          />

          <ProjectResourcesList
            resources={project.resources}
            onUpdate={(childId, input) => onUpdateChild("resource", childId, input)}
            onDelete={(childId) => onDeleteChild("resource", childId)}
            isUpdating={isUpdatingChild}
            isDeleting={isDeletingChild}
          />
        </div>
      </div>
    </div>
  );
}

function detailSaveLabel(state: ProjectDetailSaveState) {
  switch (state) {
    case "pending":
      return "Unsaved";
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      return "Save failed";
    default:
      return null;
  }
}

function ConnectedSummary({
  connected,
}: {
  connected: ProjectDetailViewProps["stats"]["connected"];
}) {
  const items = [
    {
      label: "Tasks",
      icon: Activity,
      value: String(connected.tasks.total),
      detail: `${connected.tasks.open} ${taskStatusBucketLabels.open.toLowerCase()} · ${connected.tasks.blocked} ${taskStatusBucketLabels.blocked.toLowerCase()} · ${connected.tasks.closed} ${taskStatusBucketLabels.closed.toLowerCase()}`,
    },
    {
      label: "Decisions",
      icon: GitBranch,
      value: String(connected.decisions),
    },
    {
      label: "Notes",
      icon: FileText,
      value: String(connected.notes),
    },
    {
      label: "Ideas",
      icon: Lightbulb,
      value: String(connected.ideas),
    },
    {
      label: "Resources",
      icon: Paperclip,
      value: String(connected.resources),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {items.map(({ label, icon: Icon, value, detail }) => (
        <div
          key={label}
          className="min-w-0 rounded-md border border-border/50 bg-background/70 px-2.5 py-2"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="h-3 w-3 shrink-0" />
            <span className="font-mono text-[9px] uppercase tracking-wider">
              {label}
            </span>
          </div>
          <div className="mt-1 text-xl font-semibold tabular-nums leading-none">
            {value}
          </div>
          {detail && (
            <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
              {detail}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

