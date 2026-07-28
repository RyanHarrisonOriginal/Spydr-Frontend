import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type {
  PersonWorkProjectEntry,
  PersonWorkTaskEntry,
} from "@/domain/spydr/utils/personWorkApi";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { isPersonOwnedProject } from "@/domain/spydr/utils/personWork";
import { projectPersonaLabels } from "@/domain/spydr/utils/projectPersonas";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { ShowCompletedToggle } from "@/domain/spydr/features/shared/components/ShowCompletedToggle";
import { ProjectStatusSelect } from "@/domain/spydr/features/projects/components/ProjectStatusSelect";
import { ProjectTargetDateSelect } from "@/domain/spydr/features/projects/components/ProjectTargetDateSelect";
import { TaskStatusSelect } from "@/domain/spydr/features/tasks/components/TaskStatusSelect";
import { TaskDueDateSelect } from "@/domain/spydr/features/tasks/components/TaskDueDateSelect";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionDualRank } from "@/domain/spydr/features/shared/components/CollectionDualRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import {
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
} from "@/domain/spydr/features/projects/components/ProjectDetailSection";
import { cn } from "@/lib/utils";

export type PersonWorkViewMode = "tree" | "projects" | "tasks";

interface PersonWorkSectionProps {
  projectEntries: PersonWorkProjectEntry[];
  tasks: PersonWorkTaskEntry[];
  reorderEnabled?: boolean;
  updatingTaskId?: string | null;
  updatingProjectId?: string | null;
  onReorderProjects?(orderedIds: string[]): void;
  onReorderTasks?(orderedIds: string[]): void;
  onDueDateChange?(taskId: string, dueDate: string | null): void;
  onTaskStatusChange?(taskId: string, status: string): void;
  onTargetDateChange?(projectId: string, targetDate: string | null): void;
  onProjectStatusChange?(projectId: string, status: string): void;
  headerActions?: ReactNode;
}

const VIEW_MODES: { id: PersonWorkViewMode; label: string }[] = [
  { id: "tree", label: "Tree" },
  { id: "projects", label: "Projects" },
  { id: "tasks", label: "Tasks" },
];

function ViewModeToggle({
  value,
  onChange,
}: {
  value: PersonWorkViewMode;
  onChange(mode: PersonWorkViewMode): void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Work view"
      className="inline-flex h-7 items-center rounded-sm border border-border bg-muted/20 p-0.5"
    >
      {VIEW_MODES.map((mode) => {
        const active = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "h-6 rounded-sm px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(mode.id)}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

function OpenTaskCount({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums",
        count > 0 ? "text-highlight" : "text-muted-foreground/70"
      )}
    >
      {count} open
    </span>
  );
}

function ProjectRow({
  entry,
  busy,
  reorderEnabled,
  dragHandleProps,
  showExpand,
  expanded,
  tone = "flat",
  onToggleExpand,
  onTargetDateChange,
  onStatusChange,
}: {
  entry: PersonWorkProjectEntry;
  busy: boolean;
  reorderEnabled: boolean;
  dragHandleProps?: Record<string, unknown>;
  showExpand?: boolean;
  expanded?: boolean;
  /** Tree parents use a filled rail; flat lists stay quieter. */
  tone?: "flat" | "parent";
  onToggleExpand?(): void;
  onTargetDateChange?(projectId: string, targetDate: string | null): void;
  onStatusChange?(projectId: string, status: string): void;
}) {
  const owned = isPersonOwnedProject(entry.roles);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-sm border px-2.5 py-1.5",
        tone === "parent"
          ? "border-border bg-muted/45"
          : owned
            ? "border-border/80 bg-background"
            : "border-border/60 border-l-2 border-l-border bg-background",
        tone === "parent" && owned && "border-l-2 border-l-highlight/40",
        tone === "parent" && !owned && "border-l-2 border-l-border",
        tone === "parent" && expanded && "rounded-b-none border-b-transparent"
      )}
    >
      {reorderEnabled && dragHandleProps ? (
        <CollectionDragHandle {...dragHandleProps} />
      ) : null}

      {showExpand ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse tasks" : "Expand tasks"}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          onClick={onToggleExpand}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      ) : null}

      <CollectionDualRank
        globalRank={entry.globalRank}
        personRank={entry.personRank}
        className="shrink-0"
      />

      {owned && onStatusChange ? (
        <ProjectStatusSelect
          value={entry.project.status}
          disabled={busy}
          className="w-[100px] shrink-0"
          onChange={(status) => onStatusChange(entry.project.id, status)}
        />
      ) : (
        <span className="flex w-[100px] shrink-0 items-center gap-1.5 px-1">
          <StatusDot status={entry.project.status} className="shrink-0" />
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {entry.project.status.replace(/_/g, " ")}
          </span>
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <Link
            to={`/projects/${entry.project.id}`}
            className="block min-w-0 truncate text-[13px] font-medium text-foreground/90 transition-colors hover:text-highlight"
          >
            {entry.project.title}
          </Link>
          {owned ? (
            <span className="shrink-0 rounded-sm border border-highlight/25 bg-highlight/8 px-1 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-highlight">
              Owned
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          {entry.project.area ? (
            <span className="truncate text-[11px] text-muted-foreground">
              {entry.project.area}
            </span>
          ) : null}
          {entry.roles.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {entry.roles
                .filter((role) => role !== "assignee")
                .map((role) => (
                  <span
                    key={role}
                    className="rounded-sm border border-border/70 bg-muted/20 px-1 py-px font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
                  >
                    {projectPersonaLabels[role]}
                  </span>
                ))}
            </span>
          ) : (
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/80">
              Via tasks
            </span>
          )}
        </div>
      </div>

      <OpenTaskCount count={entry.openTaskCount} />

      <span className="w-[108px] shrink-0">
        <ProjectTargetDateSelect
          value={entry.project.details?.targetDate}
          disabled={!onTargetDateChange || busy}
          className="w-full"
          onChange={(targetDate) =>
            onTargetDateChange?.(entry.project.id, targetDate)
          }
        />
      </span>
    </div>
  );
}

function TaskRow({
  entry,
  busy,
  reorderEnabled,
  dragHandleProps,
  nested,
  hideProjectLink,
  onDueDateChange,
  onStatusChange,
}: {
  entry: PersonWorkTaskEntry;
  busy: boolean;
  reorderEnabled: boolean;
  dragHandleProps?: Record<string, unknown>;
  nested?: boolean;
  hideProjectLink?: boolean;
  onDueDateChange?(taskId: string, dueDate: string | null): void;
  onStatusChange?(taskId: string, status: string): void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-sm border px-2.5 py-1.5",
        nested
          ? "ml-7 border-border/50 border-l-2 border-l-highlight/35 bg-canvas"
          : "border-border/70 bg-background"
      )}
    >
      {reorderEnabled && dragHandleProps ? (
        <CollectionDragHandle {...dragHandleProps} />
      ) : null}
      {!nested ? (
        <CollectionDualRank
          globalRank={entry.globalRank}
          personRank={entry.personRank}
          className="shrink-0"
        />
      ) : null}
      <TaskStatusSelect
        value={entry.task.status}
        disabled={!onStatusChange || busy}
        className="w-[100px] shrink-0"
        onChange={(status) => onStatusChange?.(entry.task.id, status)}
      />
      <div className="min-w-0 flex-1">
        <Link
          to={`/tasks/${entry.task.id}`}
          className="block truncate text-[13px] font-medium text-foreground/90 transition-colors hover:text-highlight"
        >
          {entry.task.title}
        </Link>
        {!hideProjectLink && entry.task.project ? (
          <Link
            to={`/projects/${entry.task.project.id}`}
            className="mt-0.5 block truncate text-[11px] text-muted-foreground hover:text-foreground"
          >
            {entry.task.project.title}
          </Link>
        ) : null}
      </div>
      <span className="w-[108px] shrink-0">
        <TaskDueDateSelect
          value={entry.task.details?.dueDate}
          disabled={!onDueDateChange || busy}
          className="w-full"
          onChange={(dueDate) => onDueDateChange?.(entry.task.id, dueDate)}
        />
      </span>
    </div>
  );
}

export function PersonWorkSection({
  projectEntries,
  tasks,
  reorderEnabled = false,
  updatingTaskId = null,
  updatingProjectId = null,
  onReorderProjects,
  onReorderTasks,
  onDueDateChange,
  onTaskStatusChange,
  onTargetDateChange,
  onProjectStatusChange,
  headerActions,
}: PersonWorkSectionProps) {
  const [viewMode, setViewMode] = useState<PersonWorkViewMode>("tree");
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const seededExpandRef = useRef(false);

  useEffect(() => {
    if (seededExpandRef.current || projectEntries.length === 0) return;
    const initial = new Set<string>();
    for (const entry of projectEntries) {
      if (entry.openTaskCount > 0) initial.add(entry.project.id);
    }
    setExpandedIds(initial);
    seededExpandRef.current = true;
  }, [projectEntries]);

  const visibleProjects = useMemo(
    () =>
      showCompleted
        ? projectEntries
        : projectEntries.filter(
            (entry) => !isClosedCollectionStatus(entry.project.status)
          ),
    [projectEntries, showCompleted]
  );

  const visibleTasks = useMemo(
    () =>
      showCompleted
        ? tasks
        : tasks.filter((entry) => !isClosedCollectionStatus(entry.task.status)),
    [tasks, showCompleted]
  );

  const tasksByProjectId = useMemo(() => {
    const map = new Map<string, PersonWorkTaskEntry[]>();
    for (const entry of visibleTasks) {
      const projectId = entry.task.project?.id;
      if (!projectId) continue;
      const list = map.get(projectId) ?? [];
      list.push(entry);
      map.set(projectId, list);
    }
    return map;
  }, [visibleTasks]);

  const orphanTasks = useMemo(
    () => visibleTasks.filter((entry) => !entry.task.project?.id),
    [visibleTasks]
  );

  const completedCount = useMemo(() => {
    if (viewMode === "projects") {
      return projectEntries.filter((entry) =>
        isClosedCollectionStatus(entry.project.status)
      ).length;
    }
    if (viewMode === "tasks") {
      return tasks.filter((entry) =>
        isClosedCollectionStatus(entry.task.status)
      ).length;
    }
    return (
      projectEntries.filter((entry) =>
        isClosedCollectionStatus(entry.project.status)
      ).length +
      tasks.filter((entry) => isClosedCollectionStatus(entry.task.status)).length
    );
  }, [viewMode, projectEntries, tasks]);

  const openTaskCount = tasks.filter(
    (entry) => !isClosedCollectionStatus(entry.task.status)
  ).length;

  const hint =
    viewMode === "projects"
      ? `${visibleProjects.length} projects`
      : viewMode === "tasks"
        ? `${openTaskCount} open tasks`
        : `${visibleProjects.length} projects · ${openTaskCount} open`;

  const toggleExpanded = (projectId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const sectionLabel =
    viewMode === "projects"
      ? "Projects"
      : viewMode === "tasks"
        ? "Tasks"
        : "Work";

  return (
    <ProjectDetailSection>
      <ProjectDetailSectionHeader
        label={sectionLabel}
        actions={
          <>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
            <ShowCompletedToggle
              showCompleted={showCompleted}
              completedCount={completedCount}
              onChange={setShowCompleted}
            />
            {headerActions}
          </>
        }
        hint={hint}
      />
      <ProjectDetailSectionBody className="gap-1.5 p-2.5">
        {viewMode === "projects" ? (
          visibleProjects.length === 0 ? (
            <EmptyState
              message={
                projectEntries.length === 0
                  ? "No projects yet. Create one they own, or assign them tasks on an existing project."
                  : "All linked projects are completed. Use “Show completed” to view them."
              }
            />
          ) : (
            <CollectionSortableList
              items={visibleProjects.map((entry) => ({
                ...entry,
                id: entry.project.id,
              }))}
              enabled={reorderEnabled}
              className="space-y-1"
              onReorder={(orderedIds) => onReorderProjects?.(orderedIds)}
              renderItem={(entry, sortable) => (
                <ProjectRow
                  entry={entry}
                  busy={updatingProjectId === entry.project.id}
                  reorderEnabled={reorderEnabled}
                  dragHandleProps={sortable.dragHandleProps}
                  onTargetDateChange={onTargetDateChange}
                  onStatusChange={onProjectStatusChange}
                />
              )}
            />
          )
        ) : null}

        {viewMode === "tasks" ? (
          visibleTasks.length === 0 ? (
            <EmptyState
              message={
                tasks.length === 0
                  ? "No tasks assigned yet. Create one to put work on this person’s queue."
                  : "All assigned tasks are completed. Use “Show completed” to view them."
              }
            />
          ) : (
            <CollectionSortableList
              items={visibleTasks.map((entry) => ({
                ...entry,
                id: entry.task.id,
              }))}
              enabled={reorderEnabled}
              className="space-y-1"
              onReorder={(orderedIds) => onReorderTasks?.(orderedIds)}
              renderItem={(entry, sortable) => (
                <TaskRow
                  entry={entry}
                  busy={updatingTaskId === entry.task.id}
                  reorderEnabled={reorderEnabled}
                  dragHandleProps={sortable.dragHandleProps}
                  onDueDateChange={onDueDateChange}
                  onStatusChange={onTaskStatusChange}
                />
              )}
            />
          )
        ) : null}

        {viewMode === "tree" ? (
          visibleProjects.length === 0 && orphanTasks.length === 0 ? (
            <EmptyState message="No work yet. Create a project or assign a task to start the tree." />
          ) : (
            <div className="space-y-1.5">
              <CollectionSortableList
                items={visibleProjects.map((entry) => ({
                  ...entry,
                  id: entry.project.id,
                }))}
                enabled={reorderEnabled}
                className="space-y-1.5"
                onReorder={(orderedIds) => onReorderProjects?.(orderedIds)}
                renderItem={(entry, sortable) => {
                  const projectTasks = tasksByProjectId.get(entry.project.id) ?? [];
                  const expanded = expandedIds.has(entry.project.id);
                  const canExpand = projectTasks.length > 0;

                  return (
                    <div
                      className={cn(
                        "overflow-hidden rounded-sm",
                        expanded && canExpand && "bg-muted/15 ring-1 ring-border/60"
                      )}
                    >
                      <div className="space-y-0">
                        <ProjectRow
                          entry={entry}
                          busy={updatingProjectId === entry.project.id}
                          reorderEnabled={reorderEnabled}
                          dragHandleProps={sortable.dragHandleProps}
                          showExpand={canExpand}
                          expanded={expanded}
                          tone="parent"
                          onToggleExpand={() => toggleExpanded(entry.project.id)}
                          onTargetDateChange={onTargetDateChange}
                          onStatusChange={onProjectStatusChange}
                        />
                        {expanded && canExpand ? (
                          <div className="space-y-1 border-t border-border/50 bg-canvas/80 px-1.5 py-1.5">
                            {projectTasks.map((taskEntry) => (
                              <TaskRow
                                key={taskEntry.task.id}
                                entry={taskEntry}
                                busy={updatingTaskId === taskEntry.task.id}
                                reorderEnabled={false}
                                nested
                                hideProjectLink
                                onDueDateChange={onDueDateChange}
                                onStatusChange={onTaskStatusChange}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                }}
              />

              {orphanTasks.length > 0 ? (
                <div className="space-y-1 pt-2">
                  <div className="px-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    Unlinked tasks
                  </div>
                  {orphanTasks.map((taskEntry) => (
                    <TaskRow
                      key={taskEntry.task.id}
                      entry={taskEntry}
                      busy={updatingTaskId === taskEntry.task.id}
                      reorderEnabled={false}
                      onDueDateChange={onDueDateChange}
                      onStatusChange={onTaskStatusChange}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )
        ) : null}
      </ProjectDetailSectionBody>
    </ProjectDetailSection>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-sm border border-dashed border-border px-3 py-8 text-center text-[12px] text-muted-foreground">
      {message}
    </div>
  );
}
