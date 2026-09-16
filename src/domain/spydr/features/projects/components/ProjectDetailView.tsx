import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArchiveRestore,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { ProjectDetailSaveState } from "../hooks/useProjectDetailPage";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { formatBreadcrumbEntityId } from "@/domain/spydr/features/shell/utils/navigationBreadcrumbs";
import {
  EntityTag,
  PriorityBadge,
} from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { TaskStatusSelect } from "@/domain/spydr/features/tasks/components/TaskStatusSelect";
import { TaskDueDateSelect } from "@/domain/spydr/features/tasks/components/TaskDueDateSelect";
import { useEnsureTaskDueWithinProject } from "@/domain/spydr/features/tasks/hooks/useEnsureTaskDueWithinProject";
import { TaskCompletedAt } from "@/domain/spydr/features/tasks/components/TaskCompletedAt";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import type {
  ProjectDecisionFormValues,
  ProjectDetailFormValues,
  ProjectIdeaFormValues,
  ProjectNoteFormValues,
  ProjectTaskFormValues,
} from "../hooks/useProjectDetailPage";
import { ProjectDecisionLog } from "./ProjectDecisionLog";
import { ProjectIdeasLog } from "./ProjectIdeasLog";
import { ProjectNotesLog } from "./ProjectNotesLog";
import { ProjectResourcesList } from "./ProjectResourcesList";
import {
  ProjectDetailEmpty,
  ProjectDetailField,
  ProjectDetailInlineError,
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailTabs,
  detailFieldClassName,
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
import { ProjectPrioritySelect } from "./ProjectPrioritySelect";
import { ProjectStatusSelect } from "./ProjectStatusSelect";
import { StatusMixChart } from "@/domain/spydr/features/shared/components/StatusMixChart";
import { EntityTransformMenu } from "@/domain/spydr/features/shared/components/EntityTransformMenu";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { SelectionCheckbox } from "@/domain/spydr/features/shared/components/SelectionCheckbox";
import { BulkDeleteBar } from "@/domain/spydr/features/shared/components/BulkDeleteBar";
import { useIsPhone } from "@/hooks/useIsPhone";
import { useItemSelection } from "@/domain/spydr/features/shared/hooks/useItemSelection";
import { SaveAsTemplateDialog } from "./SaveAsTemplateDialog";

type ProjectLogTab = "tasks" | "notes" | "decisions" | "ideas" | "resources";

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
    taskStatusCounts: Record<string, number>;
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
  const isPhone = useIsPhone();
  const dueGuard = useEnsureTaskDueWithinProject();
  const deletedCount = getDeletedItemCount(deleted);
  const personas = project.personas ?? {
    requester: null,
    assignee: null,
    sponsor: null,
    reviewer: null,
  };
  const [trashExpanded, setTrashExpanded] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [logTab, setLogTab] = useState<ProjectLogTab>("tasks");
  const taskIds = useMemo(
    () => project.tasks.map((task) => task.id),
    [project.tasks]
  );
  const taskSelection = useItemSelection(taskIds);
  const isDeletingTasks =
    deletingChildIds.length > 0 &&
    taskSelection.selectedIds.some((id) => deletingChildIds.includes(id));
  const prevDeletedCountRef = useRef(deletedCount);
  const saveLabel = detailSaveLabel(detailSaveState);

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
        <div className="border-b border-border">
          <div className="flex items-stretch">
            <div className="min-w-0 flex-1">
              <PageHeader
                dense={isPhone}
                className="border-b-0"
                titleClassName="w-full max-w-none truncate-none"
                title={
                  <input
                    value={detailForm.title}
                    onChange={(event) => onDetailFieldChange("title", event.target.value)}
                    className={cn(
                      "w-full min-w-0 bg-transparent font-semibold tracking-tight outline-none ring-focus placeholder:text-muted-foreground",
                      isPhone ? "text-[16px] leading-snug" : "text-[1.35rem]"
                    )}
                    placeholder="Project name"
                  />
                }
                meta={
                  isPhone ? (
                    <div className="flex w-full min-w-0 flex-col gap-1.5">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <ProjectStatusSelect
                          value={project.status}
                          onChange={onStatusChange}
                          disabled={isUpdatingStatus}
                          className="w-[6.75rem] shrink-0 h-10 rounded-lg px-3"
                        />
                        <ProjectAreaSelect
                          areas={areas}
                          value={areaNodeId}
                          onChange={onAreaChange}
                          disabled={isUpdatingArea}
                          className="min-w-0 flex-1 h-10 rounded-lg"
                        />
                      </div>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <DatePicker
                          value={detailForm.targetDate || null}
                          onChange={(targetDate) =>
                            onDetailFieldChange("targetDate", targetDate ?? "")
                          }
                          variant="compact"
                          showChevron={false}
                          showIcon={false}
                          placeholder="Target"
                          panelLabel="Target date"
                          clearLabel="Clear target date"
                          ariaLabel="Project target date"
                          className="h-10 w-[5.5rem] shrink-0 rounded-lg"
                        />
                        <PriorityBadge priority={project.priority} />
                        {saveLabel ? (
                          <span className="ml-auto truncate font-mono text-[10px] tabular-nums text-muted-foreground">
                            {saveLabel}
                          </span>
                        ) : (
                          <ProgressMeta
                            className="ml-auto"
                            openCount={stats.openTaskCount}
                            progressPercent={stats.progressPercent}
                            compact
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <ProjectStatusSelect
                        value={project.status}
                        onChange={onStatusChange}
                        disabled={isUpdatingStatus}
                        className="w-[110px] h-10 rounded-lg px-3"
                      />
                      <PriorityBadge priority={project.priority} />
                      <ProjectAreaSelect
                        areas={areas}
                        value={areaNodeId}
                        onChange={onAreaChange}
                        disabled={isUpdatingArea}
                        className="w-[140px] h-10 rounded-lg"
                      />
                      {project.tags.map((tag) => (
                        <EntityTag key={tag} tag={tag} />
                      ))}
                      <span className="text-border">·</span>
                      <ProgressMeta
                        openCount={stats.openTaskCount}
                        progressPercent={stats.progressPercent}
                        showBar={stats.connected.tasks.total > 0}
                      />
                      <span className="font-mono text-[11px] text-muted-foreground">
                        updated {formatRelativeTime(project.updatedAt)}
                        {saveLabel ? ` · ${saveLabel}` : null}
                      </span>
                    </div>
                  )
                }
                actions={
                  isPhone && deletedCount === 0 ? undefined : (
                    <div className="flex items-center gap-2">
                      {isPhone ? null : (
                        <>
                          <EntityTransformMenu
                            nodeId={project.id}
                            sourceType="project"
                            sourceTitle={project.title}
                            projects={projects}
                            excludeProjectId={project.id}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-muted-foreground"
                                aria-label="Project actions"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                className="text-[12px]"
                                onSelect={() => setSaveAsTemplateOpen(true)}
                              >
                                Save as template…
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                      {deletedCount > 0 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                          onClick={openTrash}
                        >
                          <ArchiveRestore className="h-3 w-3" />
                          {isPhone ? null : "Trash"}
                          <span className="rounded-full bg-muted px-1.5 py-px font-mono text-[9px] font-semibold tabular-nums leading-none text-foreground/80">
                            {deletedCount}
                          </span>
                        </Button>
                      ) : null}
                    </div>
                  )
                }
              />
            </div>
            {isPhone ? null : (
              <div className="relative z-10 flex w-[min(22rem,40%)] shrink-0 items-center border-l border-border/60 bg-background/70 px-4 py-3">
                <StatusMixChart
                  className="w-full border-0 bg-transparent p-0"
                  title="Status mix"
                  counts={stats.taskStatusCounts}
                  centerPercent={stats.progressPercent}
                  centerLabel="Tasks completed"
                />
              </div>
            )}
          </div>
        </div>

        <SaveAsTemplateDialog
          project={project}
          open={saveAsTemplateOpen}
          onOpenChange={setSaveAsTemplateOpen}
        />

        {deletedCount > 0 && (
          <div className="px-4 pt-3 md:px-6">
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

        <div className="border-b border-border bg-muted/10 px-4 py-3 md:px-6">
          {isPhone ? (
            <StatusMixChart
              className="mb-3"
              title="Status mix"
              counts={stats.taskStatusCounts}
              centerPercent={stats.progressPercent}
              centerLabel="Tasks completed"
            />
          ) : null}
          <textarea
            value={detailForm.body}
            onChange={(event) => onDetailFieldChange("body", event.target.value)}
            placeholder="Brief — context, intent, and what done looks like."
            rows={3}
            className="min-h-[4.5rem] w-full resize-y rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-[13px] leading-snug outline-none ring-focus placeholder:text-muted-foreground"
          />

          <div
            className={cn(
              "mt-3 grid gap-x-3 gap-y-2",
              isPhone ? "grid-cols-2" : "sm:grid-cols-3"
            )}
          >
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
                className="h-10 rounded-lg"
              />
            </ProjectDetailField>
            {isPhone ? null : (
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
                  className="h-10 rounded-lg"
                />
              </ProjectDetailField>
            )}
            <ProjectDetailField label="Risk" className="space-y-1">
              <ProjectPrioritySelect
                value={detailForm.riskLevel}
                onChange={(riskLevel) =>
                  onDetailFieldChange("riskLevel", riskLevel as SpydrPriority)
                }
                ariaLabel="Project risk"
                menuLabel="Risk"
                className="h-10 w-full rounded-lg px-3"
              />
            </ProjectDetailField>
          </div>

          <div className="mt-3">
            <ProjectPersonasPanel
              people={people}
              personas={personas}
              disabled={isUpdatingPersona}
              onChange={onPersonaChange}
            />
            {personaError ? (
              <p className="mt-2 text-[12px] text-destructive">{personaError}</p>
            ) : null}
          </div>

          {project.details?.outcome ? (
            <p className="mt-3 border-l-2 border-highlight/45 pl-2.5 text-[12px] leading-snug text-foreground/80">
              <span className="font-mono text-[10px] uppercase tracking-wider text-highlight">
                Outcome
              </span>{" "}
              {project.details.outcome}
            </p>
          ) : null}

          {detailError ? (
            <ProjectDetailInlineError>{detailError}</ProjectDetailInlineError>
          ) : null}
        </div>

        <div
          className={cn(
            "flex flex-col gap-2 pb-8 pt-2",
            isPhone ? "px-2" : "px-3 md:px-4"
          )}
        >
          {childMutationError ? (
            <ProjectDetailInlineError>{childMutationError}</ProjectDetailInlineError>
          ) : null}

          <ProjectDetailSection>
            <div
              className={cn(
                "flex min-w-0 items-center gap-2 border-b border-border/70 bg-muted/20 py-2",
                isPhone ? "px-2" : "px-3"
              )}
            >
              <ProjectDetailTabs<ProjectLogTab>
                value={logTab}
                onChange={setLogTab}
                ariaLabel="Project work"
                items={[
                  { id: "tasks", label: "Tasks", count: project.tasks.length },
                  { id: "notes", label: "Notes", count: project.notes.length },
                  {
                    id: "decisions",
                    label: "Decisions",
                    count: project.decisions.length,
                  },
                  { id: "ideas", label: "Ideas", count: project.ideas.length },
                  {
                    id: "resources",
                    label: "Resources",
                    count: project.resources.length,
                  },
                ]}
              />
              {logTab === "tasks" &&
              project.tasks.length > 0 &&
              !isPhone ? (
                <div className="ml-auto flex shrink-0 items-center gap-2">
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
                  ) : null}
                </div>
              ) : null}
            </div>
            <ProjectDetailSectionBody
              className={cn(
                "min-h-0 gap-2 py-2",
                isPhone ? "px-2" : "px-3"
              )}
            >
              {logTab === "tasks" ? (
                <div className="flex min-h-0 flex-1 flex-col gap-2">
                  <form
                    className={cn(
                      "grid items-center gap-2 rounded-sm border border-highlight/20 bg-highlight/[0.04] px-2.5 py-1.5",
                      isPhone
                        ? "grid-cols-[1fr_auto]"
                        : "md:grid-cols-[1fr_140px_auto]"
                    )}
                    onSubmit={(event) => {
                      event.preventDefault();
                      dueGuard.ensure({
                        project,
                        dueDate: taskForm.dueDate || null,
                        onAllowed: onAddTask,
                      });
                    }}
                  >
                    <input
                      value={taskForm.title}
                      onChange={(event) =>
                        onTaskFieldChange("title", event.target.value)
                      }
                      placeholder="Add a task..."
                      className={cn(detailFieldClassName, "min-w-0 bg-background")}
                    />
                    {isPhone ? null : (
                      <TaskDueDateSelect
                        value={taskForm.dueDate || null}
                        onChange={(dueDate) =>
                          onTaskFieldChange("dueDate", dueDate ?? "")
                        }
                        variant="field"
                        placeholder="Due date"
                        project={project}
                      />
                    )}
                    <Button type="submit" className="h-10 rounded-lg" disabled={!canAddTask}>
                      {isAddingTask ? "Adding..." : "Add"}
                    </Button>
                  </form>
                  {taskError ? (
                    <ProjectDetailInlineError>{taskError}</ProjectDetailInlineError>
                  ) : null}
                  {project.tasks.length > 0 ? (
                    <ul className="min-h-0 space-y-1.5">
                      {project.tasks.map((task) =>
                        isPhone ? (
                          <li
                            key={task.id}
                            className="flex min-w-0 items-center gap-1 rounded-sm bg-muted/20 px-1 py-0.5 hover:bg-muted/40"
                          >
                            <TaskStatusSelect
                              value={task.status}
                              disabled={isUpdatingChild}
                              appearance="icon"
                              className="h-9 w-9"
                              onChange={(status) => {
                                if (status !== task.status) {
                                  onUpdateChild("task", task.id, { status });
                                }
                              }}
                            />
                            <Link
                              to={`/tasks/${task.id}`}
                              className="min-w-0 flex-1 truncate text-[13px] font-medium hover:text-primary"
                            >
                              {task.title}
                            </Link>
                            <TaskCompletedAt
                              status={task.status}
                              completedAt={task.details?.completedAt}
                            />
                            <TaskDueDateSelect
                              value={task.details?.dueDate}
                              disabled={isUpdatingChild}
                              placeholder="Due"
                              showChevron={false}
                              showIcon={false}
                              className="h-10 w-[4.25rem] shrink-0 rounded-lg"
                              project={project}
                              onChange={(dueDate) => {
                                const current =
                                  task.details?.dueDate?.slice(0, 10) ?? null;
                                const next = dueDate?.slice(0, 10) ?? null;
                                if (next !== current) {
                                  onUpdateChild("task", task.id, { dueDate });
                                }
                              }}
                            />
                            <Link
                              to={`/tasks/${task.id}`}
                              aria-label={`Open ${task.title}`}
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-highlight/25 bg-highlight/10 text-highlight hover:border-highlight/50 hover:bg-highlight/18"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </li>
                        ) : (
                          <li
                            key={task.id}
                            className="flex min-w-0 items-center gap-2 rounded-sm bg-muted/20 px-2.5 py-1.5 hover:bg-muted/40"
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
                              className="w-[120px] shrink-0 h-10 rounded-lg px-3"
                              onChange={(status) => {
                                if (status !== task.status) {
                                  onUpdateChild("task", task.id, { status });
                                }
                              }}
                            />
                            <Link
                              to={`/tasks/${task.id}`}
                              aria-label={`Open ${task.title}`}
                              className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-highlight/25 bg-highlight/10 text-highlight hover:border-highlight/50 hover:bg-highlight/18"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                            <Link
                              to={`/tasks/${task.id}`}
                              className="min-w-0 flex-1 truncate text-[13px] hover:text-primary"
                            >
                              {task.title}
                            </Link>
                            <TaskCompletedAt
                              status={task.status}
                              completedAt={task.details?.completedAt}
                            />
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
                                  onUpdateChild("task", task.id, {
                                    assigneePersonNodeId,
                                  });
                                }
                              }}
                            />
                            <span className="w-[140px] shrink-0">
                              <TaskDueDateSelect
                                value={task.details?.dueDate}
                                disabled={isUpdatingChild}
                                className="h-10 w-full rounded-lg"
                                project={project}
                                onChange={(dueDate) => {
                                  const current =
                                    task.details?.dueDate?.slice(0, 10) ?? null;
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
                                project={project}
                                values={{
                                  title: task.title,
                                  body: task.body,
                                  dueDate: task.details?.dueDate?.slice(0, 10) ?? "",
                                  priority: task.priority as SpydrPriority,
                                  status: task.status,
                                }}
                                onSave={(input) =>
                                  onUpdateChild("task", task.id, input)
                                }
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
                        )
                      )}
                    </ul>
                  ) : (
                    <ProjectDetailEmpty title="No tasks linked yet." />
                  )}
                </div>
              ) : null}
              {logTab === "notes" ? (
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
              ) : null}
              {logTab === "decisions" ? (
                <ProjectDecisionLog
                  decisions={project.decisions}
                  form={decisionForm}
                  canAdd={canAddDecision}
                  isAdding={isAddingDecision}
                  error={decisionError}
                  onFieldChange={onDecisionFieldChange}
                  onAdd={onAddDecision}
                  onUpdate={(childId, input) =>
                    onUpdateChild("decision", childId, input)
                  }
                  onDelete={(childId) => onDeleteChild("decision", childId)}
                  isUpdating={isUpdatingChild}
                  isDeleting={isDeletingChild}
                />
              ) : null}
              {logTab === "ideas" ? (
                <ProjectIdeasLog
                  ideas={project.ideas}
                  projects={projects}
                  projectId={project.id}
                  form={ideaForm}
                  canAdd={canAddIdea}
                  isAdding={isAddingIdea}
                  error={ideaError}
                  onFieldChange={onIdeaFieldChange}
                  onAdd={onAddIdea}
                  onUpdate={(childId, input) => onUpdateChild("idea", childId, input)}
                  onDelete={(childId) => onDeleteChild("idea", childId)}
                  isUpdating={isUpdatingChild}
                  isDeleting={isDeletingChild}
                />
              ) : null}
              {logTab === "resources" ? (
                <ProjectResourcesList
                  resources={project.resources}
                  onUpdate={(childId, input) =>
                    onUpdateChild("resource", childId, input)
                  }
                  onDelete={(childId) => onDeleteChild("resource", childId)}
                  isUpdating={isUpdatingChild}
                  isDeleting={isDeletingChild}
                />
              ) : null}
            </ProjectDetailSectionBody>
          </ProjectDetailSection>
        </div>
      </div>
      {dueGuard.dialog}
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

function ProgressMeta({
  openCount,
  progressPercent,
  showBar = true,
  compact = false,
  className,
}: {
  openCount: number;
  progressPercent: number;
  showBar?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 font-mono tabular-nums",
        compact ? "text-[10px]" : "text-[11px]",
        className
      )}
    >
      <span
        className={cn(
          "uppercase tracking-[0.12em]",
          openCount > 0 ? "text-highlight" : "text-muted-foreground/70"
        )}
      >
        {openCount} open
      </span>
      {showBar ? (
        <>
          <span
            className="h-1 w-14 overflow-hidden rounded-full bg-muted"
            aria-hidden
          >
            <span
              className="block h-full rounded-full bg-highlight-secondary"
              style={{ width: `${progressPercent}%` }}
            />
          </span>
          <span className="text-muted-foreground">{progressPercent}%</span>
        </>
      ) : null}
    </span>
  );
}
