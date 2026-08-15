import { useEffect, useMemo, useRef, useState } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import type {
  PersonNode,
  ProjectAreaNode,
  ProjectChildKind,
  ProjectDetailNode,
  ProjectNode,
  SpydrPriority,
  UpdateProjectChildInput,
} from "@/domain/spydr/utils/types";
import type { ProjectPersonaRole } from "@/domain/spydr/utils/projectPersonas";
import { taskStatusBucketLabels } from "@/domain/spydr/utils/taskStatus";
import type { ProjectDetailSaveState } from "../hooks/useProjectDetailPage";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { formatBreadcrumbEntityId } from "@/domain/spydr/features/shell/utils/navigationBreadcrumbs";
import { PriorityBadge } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { TaskStatusSelect } from "@/domain/spydr/features/tasks/components/TaskStatusSelect";
import { TaskDueDateSelect } from "@/domain/spydr/features/tasks/components/TaskDueDateSelect";
import {
  formatRelativeTime,
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
import { ProjectPersonasPanel } from "./ProjectPersonasPanel";
import { PersonSelect } from "./PersonSelect";
import { ProjectAreaSelect } from "./ProjectAreaSelect";
import { ProjectStatusSelect } from "./ProjectStatusSelect";
import { EntityTransformMenu } from "@/domain/spydr/features/shared/components/EntityTransformMenu";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { SelectionCheckbox } from "@/domain/spydr/features/shared/components/SelectionCheckbox";
import { BulkDeleteBar } from "@/domain/spydr/features/shared/components/BulkDeleteBar";
import { useItemSelection } from "@/domain/spydr/features/shared/hooks/useItemSelection";

interface ProjectDetailViewProps {
  project: ProjectDetailNode;
  projects: ProjectNode[];
  people: PersonNode[];
  areas: ProjectAreaNode[];
  areaNodeId: string;
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
  noteFormResetKey: number;
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
  personaError: string | null;
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
  onStatusChange(status: string): void;
  isUpdatingStatus?: boolean;
  onAreaChange(areaNodeId: string | null): void;
  isUpdatingArea?: boolean;
  onPersonaChange(role: ProjectPersonaRole, personNodeId: string | null): void;
  isUpdatingPersona?: boolean;
  onDeleteChild(kind: ProjectChildKind, childId: string): void;
  onDeleteSelectedChildren(kind: ProjectChildKind, childIds: string[]): void;
  onRestoreChild(kind: ProjectChildKind, childId: string): void;
  isUpdatingChild: boolean;
  isDeletingChild: boolean;
  isRestoringChild: boolean;
  restoringId: string | null;
  deletingChildIds: string[];
  childMutationError: string | null;
}

const priorityOptions: SpydrPriority[] = ["low", "medium", "high", "critical"];

export function ProjectDetailView({
  project,
  projects,
  people,
  areas,
  areaNodeId,
  deleted,
  stats,
  detailForm,
  detailSaveState,
  taskForm,
  noteForm,
  noteFormResetKey,
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
  personaError,
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
  onStatusChange,
  isUpdatingStatus = false,
  onAreaChange,
  isUpdatingArea = false,
  onPersonaChange,
  isUpdatingPersona = false,
  onDeleteChild,
  onDeleteSelectedChildren,
  onRestoreChild,
  isUpdatingChild,
  isDeletingChild,
  isRestoringChild,
  restoringId,
  deletingChildIds,
  childMutationError,
}: ProjectDetailViewProps) {
  const deletedCount = getDeletedItemCount(deleted);
  const personas = project.personas ?? {
    requester: null,
    assignee: null,
    sponsor: null,
    reviewer: null,
  };
  const [trashExpanded, setTrashExpanded] = useState(false);
  const taskIds = useMemo(
    () => project.tasks.map((task) => task.id),
    [project.tasks]
  );
  const taskSelection = useItemSelection(taskIds);
  const isDeletingTasks =
    deletingChildIds.length > 0 &&
    taskSelection.selectedIds.some((id) => deletingChildIds.includes(id));
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

  usePageBreadcrumb(formatBreadcrumbEntityId(project.id));

  return (
    <div className="flex min-w-0">
      <div className="min-w-0 flex-1">
        <PageHeader
          titleClassName="w-full max-w-none truncate-none"
          title={
            <input
              value={detailForm.title}
              onChange={(event) => onDetailFieldChange("title", event.target.value)}
              className="w-full min-w-0 bg-transparent text-[1.35rem] font-semibold tracking-tight outline-none ring-focus placeholder:text-muted-foreground"
              placeholder="Project name"
            />
          }
          meta={
            <div className="flex flex-wrap items-center gap-2">
              <ProjectStatusSelect
                value={project.status}
                onChange={onStatusChange}
                disabled={isUpdatingStatus}
                className="w-[110px]"
              />
              <PriorityBadge priority={project.priority} />
              <ProjectAreaSelect
                areas={areas}
                value={areaNodeId}
                onChange={onAreaChange}
                disabled={isUpdatingArea}
                className="w-[140px]"
              />
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
                {detailSaveLabel(detailSaveState)
                  ? ` · ${detailSaveLabel(detailSaveState)}`
                  : null}
              </span>
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <EntityTransformMenu
                nodeId={project.id}
                sourceType="project"
                sourceTitle={project.title}
                projects={projects}
                excludeProjectId={project.id}
              />
              {deletedCount > 0 ? (
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
              ) : null}
            </div>
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

        <div className="space-y-3 px-6 pb-3 pt-2">
          <ProjectDetailSection>
            <ProjectDetailSectionHeader
              label="Overview"
              hint={detailSaveLabel(detailSaveState) ?? undefined}
              hintClassName={
                detailSaveState === "error" ? "text-destructive" : undefined
              }
            />
            <ProjectDetailSectionBody className="gap-3 p-3">
              <ConnectedSummary
                connected={stats.connected}
                progressPercent={stats.progressPercent}
              />

              <ProjectDetailField label="Brief" className="space-y-1">
                <textarea
                  value={detailForm.body}
                  onChange={(event) =>
                    onDetailFieldChange("body", event.target.value)
                  }
                  placeholder="Describe the project brief, context, and intent."
                  rows={2}
                  className={cn(detailTextareaClassName, "min-h-[3.25rem]")}
                />
              </ProjectDetailField>

              <div className="grid gap-3 lg:grid-cols-2">
                <ProjectDetailFormPanel label="Timeline" className="p-2.5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <ProjectDetailField label="Start" className="space-y-1">
                        <DatePicker
                          value={detailForm.startDate || null}
                          onChange={(startDate) =>
                            onDetailFieldChange("startDate", startDate ?? "")
                          }
                          panelLabel="Start date"
                          clearLabel="Clear start date"
                          placeholder="Select start date"
                          ariaLabel="Project start date"
                          className="h-7"
                        />
                      </ProjectDetailField>
                      <ArrowRight
                        aria-hidden
                        className="mb-1.5 h-3 w-3 shrink-0 text-muted-foreground"
                      />
                      <ProjectDetailField label="Target" className="space-y-1">
                        <DatePicker
                          value={detailForm.targetDate || null}
                          onChange={(targetDate) =>
                            onDetailFieldChange("targetDate", targetDate ?? "")
                          }
                          panelLabel="Target date"
                          clearLabel="Clear target date"
                          placeholder="Select target date"
                          ariaLabel="Project target date"
                          className="h-7"
                        />
                      </ProjectDetailField>
                    </div>
                    <ProjectDetailField
                      label="Risk"
                      className="space-y-1 sm:w-28"
                    >
                      <select
                        value={detailForm.riskLevel}
                        onChange={(event) =>
                          onDetailFieldChange(
                            "riskLevel",
                            event.target.value as SpydrPriority
                          )
                        }
                        className="h-7 w-full rounded-md border border-input bg-background px-2 text-[11px] ring-focus"
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

                <div>
                  <ProjectPersonasPanel
                    people={people}
                    personas={personas}
                    disabled={isUpdatingPersona}
                    onChange={onPersonaChange}
                  />
                  {personaError ? (
                    <p className="mt-2 rounded-md border border-destructive/25 bg-destructive/8 px-3 py-2 text-[12px] text-destructive">
                      {personaError}
                    </p>
                  ) : null}
                </div>
              </div>

              {project.details?.outcome && (
                <div className={cn(detailInsetPanelClassName, "p-2.5")}>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    Outcome
                  </p>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-snug">
                    {project.details.outcome}
                  </p>
                </div>
              )}

              {detailError && (
                <ProjectDetailInlineError>{detailError}</ProjectDetailInlineError>
              )}
            </ProjectDetailSectionBody>
          </ProjectDetailSection>

          {childMutationError && (
            <ProjectDetailInlineError>{childMutationError}</ProjectDetailInlineError>
          )}
        </div>

        <div className="grid gap-4 px-6 pb-8 xl:grid-cols-2">
          <ProjectDetailSection className="min-h-[360px]">
            <ProjectDetailSectionHeader
              icon={<Activity className="h-3.5 w-3.5" />}
              label="In motion"
              hint={`${stats.openTaskCount} open`}
            />
            <ProjectDetailSectionBody className="min-h-0 flex-1 gap-3 p-3">
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
              <DatePicker
                value={taskForm.dueDate || null}
                onChange={(dueDate) => onTaskFieldChange("dueDate", dueDate ?? "")}
                panelLabel="Due date"
                clearLabel="Clear due date"
                placeholder="Due date"
                ariaLabel="Task due date"
              />
              <Button type="submit" size="sm" disabled={!canAddTask}>
                {isAddingTask ? "Adding..." : "Add"}
              </Button>
            </form>
            </ProjectDetailFormPanel>
            {taskError && <ProjectDetailInlineError>{taskError}</ProjectDetailInlineError>}
            {project.tasks.length > 0 ? (
              <div className="flex items-center gap-2 px-0.5">
                <SelectionCheckbox
                  checked={taskSelection.allSelected}
                  indeterminate={taskSelection.someSelected}
                  disabled={deletingChildIds.length > 0}
                  label="Select all tasks"
                  onChange={taskSelection.setAll}
                />
                {taskSelection.selectedCount > 0 ? (
                  <BulkDeleteBar
                    count={taskSelection.selectedCount}
                    noun="task"
                    isDeleting={isDeletingTasks}
                    disabled={deletingChildIds.length > 0}
                    onDelete={() =>
                      onDeleteSelectedChildren("task", taskSelection.selectedIds)
                    }
                    onClear={taskSelection.clear}
                  />
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Select tasks to delete
                  </span>
                )}
              </div>
            ) : null}
            <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
              {project.tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex min-w-0 items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 shadow-sm"
                >
                  <SelectionCheckbox
                    checked={taskSelection.isSelected(task.id)}
                    disabled={deletingChildIds.length > 0}
                    label={`Select ${task.title}`}
                    onChange={() => taskSelection.toggle(task.id)}
                  />
                  <TaskStatusSelect
                    value={task.status}
                    disabled={isUpdatingChild}
                    className="w-[108px] shrink-0"
                    onChange={(status) => {
                      if (status !== task.status) {
                        onUpdateChild("task", task.id, { status });
                      }
                    }}
                  />
                  <Link
                    to={`/tasks/${task.id}`}
                    className="min-w-0 flex-1 truncate text-[13px] hover:text-primary"
                  >
                    {task.title}
                  </Link>
                  <PersonSelect
                    people={people}
                    value={
                      task.assignee?.id ??
                      task.details?.assigneePersonNodeId ??
                      null
                    }
                    compact
                    disabled={isUpdatingChild}
                    className="w-[132px] shrink-0"
                    ariaLabel="Task assignee"
                    onChange={(assigneePersonNodeId) => {
                      const current =
                        task.assignee?.id ??
                        task.details?.assigneePersonNodeId ??
                        null;
                      if (assigneePersonNodeId !== current) {
                        onUpdateChild("task", task.id, { assigneePersonNodeId });
                      }
                    }}
                  />
                  <span className="w-[118px] shrink-0">
                    <TaskDueDateSelect
                      value={task.details?.dueDate}
                      disabled={isUpdatingChild}
                      className="w-full"
                      onChange={(dueDate) => {
                        const current = task.details?.dueDate?.slice(0, 10) ?? null;
                        const next = dueDate?.slice(0, 10) ?? null;
                        if (next !== current) {
                          onUpdateChild("task", task.id, { dueDate });
                        }
                      }}
                    />
                  </span>
                  <div className="ml-auto flex shrink-0 items-center gap-0.5">
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
                      isDeleting={deletingChildIds.includes(task.id)}
                      showDelete={false}
                    />
                    <InlineDeleteButton
                      label={task.title}
                      isDeleting={deletingChildIds.includes(task.id)}
                      disabled={
                        deletingChildIds.length > 0 &&
                        !deletingChildIds.includes(task.id)
                      }
                      onDelete={() => onDeleteChild("task", task.id)}
                    />
                  </div>
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

          <ProjectDetailSection className="min-h-[360px]">
            <ProjectDetailSectionHeader
              icon={<Lightbulb className="h-3.5 w-3.5" />}
              label="Thinking"
              hint={`${project.ideas.length} ideas`}
            />
            <ProjectDetailSectionBody className="min-h-0 flex-1 gap-3 p-3">
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
            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
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
                    <EntityTransformMenu
                      nodeId={idea.id}
                      sourceType="idea"
                      sourceTitle={idea.title}
                      projects={projects}
                      defaultProjectId={project.id}
                      compact
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
            projects={projects}
            projectId={project.id}
            form={noteForm}
            formResetKey={noteFormResetKey}
            canAdd={canAddNote}
            isAdding={isAddingNote}
            error={noteError}
            onFieldChange={onNoteFieldChange}
            onAdd={onAddNote}
            onUpdate={(childId, input) => onUpdateChild("note", childId, input)}
            onDelete={(childId) => onDeleteChild("note", childId)}
            onDeleteSelected={(childIds) =>
              onDeleteSelectedChildren("note", childIds)
            }
            isUpdating={isUpdatingChild}
            isDeleting={isDeletingChild}
            deletingChildIds={deletingChildIds}
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
  progressPercent,
}: {
  connected: ProjectDetailViewProps["stats"]["connected"];
  progressPercent: number;
}) {
  const items = [
    {
      label: "Tasks",
      icon: Activity,
      value: String(connected.tasks.total),
      title: `${connected.tasks.open} ${taskStatusBucketLabels.open.toLowerCase()} · ${connected.tasks.blocked} ${taskStatusBucketLabels.blocked.toLowerCase()} · ${connected.tasks.closed} ${taskStatusBucketLabels.closed.toLowerCase()}`,
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
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/50 bg-muted/15 px-2 py-1.5">
      {items.map(({ label, icon: Icon, value, title }) => (
        <div
          key={label}
          title={title}
          className="inline-flex min-w-0 items-center gap-1 rounded border border-border/40 bg-background/80 px-1.5 py-0.5"
        >
          <Icon className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
          <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="font-semibold tabular-nums text-[12px] leading-none">
            {value}
          </span>
        </div>
      ))}
      <div className="ml-auto flex min-w-[120px] max-w-full items-center gap-2 pl-1 sm:min-w-[160px]">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-highlight-secondary transition-[width]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-[9px] tabular-nums text-muted-foreground">
          {progressPercent}%
        </span>
      </div>
    </div>
  );
}

