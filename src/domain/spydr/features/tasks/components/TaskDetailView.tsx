import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EntityTransformMenu } from "@/domain/spydr/features/shared/components/EntityTransformMenu";
import { EmojiPicker } from "@/domain/spydr/features/shared/components/EmojiPicker";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { LogList } from "@/domain/spydr/features/log/components/LogList";
import type { LogConfig } from "@/domain/spydr/features/log/types";
import { dueFromValue } from "@/domain/spydr/features/work/components/WorkDueDisplay";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { cleanDisplayName } from "@/domain/spydr/utils/projectPersonas";
import { parseTaskNoteEntries } from "@/domain/spydr/utils/taskNotes";
import {
  isTaskStatus,
  taskStatusLabels,
  type TaskStatus,
  type TaskStatusChange,
} from "@/domain/spydr/utils/taskStatus";
import type { PersonNode, ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { cn } from "@/lib/utils";
import type {
  TaskDetailFormValues,
  TaskDetailSaveState,
} from "../hooks/useTaskDetailPage";
import { useEnsureTaskDueWithinProject } from "../hooks/useEnsureTaskDueWithinProject";
import { TaskDetailProperties } from "./TaskDetailProperties";
import { TaskStatusContextDialog } from "./TaskStatusContextDialog";
import "@/domain/spydr/features/projects/pages/project-detail-page.css";
import "../pages/task-detail-page.css";
import "@/domain/spydr/features/log/log-page.css";

interface TaskDetailViewProps {
  task: TaskNode;
  projects: ProjectNode[];
  people: PersonNode[];
  form: TaskDetailFormValues;
  saveState: TaskDetailSaveState;
  noteDraft: string;
  isLoggingNote: boolean;
  onFieldChange<TField extends keyof TaskDetailFormValues>(
    field: TField,
    value: TaskDetailFormValues[TField]
  ): void;
  onNoteDraftChange(value: string): void;
  onLogNote(): void;
  onEmojiChange(emoji: string | null): void;
  onRetrySave(): void;
  onDeleteTask(onDeleted?: () => void): void;
  isDeletingTask?: boolean;
}

type TaskLogNote = {
  id: string;
  text: string;
  loggedAt: string;
};

type UndoCompleteState = {
  status: TaskStatus;
  blockedByTaskId: string;
  followUpAt: string;
  waitingNote: string;
};

type ContextDialogMode = "change" | "reschedule";

function formatUpdatedAgo(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) return `updated ${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `updated ${days}d ago`;
  return `updated ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toLowerCase()}`;
}

function useModKeyLabel() {
  return useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl";
    const platform = navigator.platform ?? "";
    const ua = navigator.userAgent ?? "";
    return /Mac|iPhone|iPad|iPod/i.test(platform) || /Mac OS X/i.test(ua)
      ? "⌘"
      : "Ctrl";
  }, []);
}

function saveHint(
  state: TaskDetailSaveState
): { label: string; tone: "muted" | "danger"; retry?: boolean } | null {
  if (state === "saving") return { label: "Saving…", tone: "muted" };
  if (state === "error") {
    return { label: "Couldn't save · Retry", tone: "danger", retry: true };
  }
  return null;
}

export function TaskDetailView({
  task,
  projects,
  people,
  form,
  saveState,
  noteDraft,
  isLoggingNote,
  onFieldChange,
  onNoteDraftChange,
  onLogNote,
  onEmojiChange,
  onRetrySave,
  onDeleteTask,
  isDeletingTask = false,
}: TaskDetailViewProps) {
  const navigate = useNavigate();
  const modKey = useModKeyLabel();
  const dueGuard = useEnsureTaskDueWithinProject();
  const captureRef = useRef<HTMLTextAreaElement>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [contextMode, setContextMode] = useState<ContextDialogMode | null>(null);
  const [undoComplete, setUndoComplete] = useState<UndoCompleteState | null>(
    null
  );
  const [logMode, setLogMode] = useState<"recent" | "ranked">("recent");
  const [logSearch, setLogSearch] = useState("");
  const [logProjectFilter, setLogProjectFilter] = useState<string | null>(null);

  const displayName =
    cleanDisplayName(form.title) ||
    cleanDisplayName(task.title) ||
    "Untitled task";
  const selectedProject =
    projects.find((project) => project.id === form.projectNodeId) ??
    (task.project
      ? projects.find((project) => project.id === task.project?.id) ?? null
      : null);
  const projectTitle = selectedProject
    ? cleanDisplayName(selectedProject.title) || selectedProject.title
    : task.project
      ? cleanDisplayName(task.project.title) || task.project.title
      : null;
  const projectEmoji = selectedProject?.details?.emoji ?? null;
  const due = dueFromValue(form.dueDate || null);
  const done = isClosedCollectionStatus(form.status);
  const statusLabel = isTaskStatus(form.status)
    ? taskStatusLabels[form.status]
    : form.status;
  const hint = saveHint(saveState);
  const showBlocker =
    form.status === "blocked" || form.status === "waiting";
  const blockedById = form.blockedByTaskId || null;
  const blockedByTitle =
    task.blockedBy?.id === blockedById && task.blockedBy?.title
      ? cleanDisplayName(task.blockedBy.title) || task.blockedBy.title
      : "task";
  const waitingNote = form.waitingNote.trim();
  const followUpAt = form.followUpAt || null;

  usePageBreadcrumb(displayName);

  useEffect(() => {
    const el = captureRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [noteDraft]);

  useEffect(() => {
    return () => clearTimeout(undoTimerRef.current);
  }, []);

  const { entries, preamble } = parseTaskNoteEntries(task.body);
  const noteItems = useMemo<TaskLogNote[]>(() => {
    const items: TaskLogNote[] = [];
    if (preamble) {
      items.push({
        id: "preamble",
        text: preamble,
        loggedAt: task.createdAt,
      });
    }
    for (const [index, entry] of entries.entries()) {
      items.push({
        id: `${entry.loggedAt}-${index}`,
        text: entry.text,
        loggedAt: entry.loggedAt,
      });
    }
    return items;
  }, [entries, preamble, task.createdAt]);
  const noteCount = noteItems.length;

  const logConfig = useMemo<LogConfig<TaskLogNote>>(
    () => ({
      primary: (item) => item.text,
      meta: () => [],
      primaryAction: {
        label: "Edit",
        icon: MoreHorizontal,
        onRun: () => undefined,
      },
      captureTargets: {
        projects,
        projectId: form.projectNodeId || projects[0]?.id || "",
        onProjectChange: () => undefined,
      },
      rankable: false,
      capturePlaceholder: "Log a note, blocker, or status update…",
      emptyMessage: "No notes yet",
      noun: "notes",
      nounSingular: "note",
      getTimestamp: (item) => item.loggedAt,
      getCreatedAt: (item) => item.loggedAt,
      getUpdatedAt: (item) => item.loggedAt,
      getProjectId: () => form.projectNodeId || null,
      onCapture: async () => undefined,
      onEdit: () => undefined,
      onDelete: () => undefined,
    }),
    [form.projectNodeId, projects]
  );

  const applyStatus = (change: TaskStatusChange) => {
    if (!isTaskStatus(change.status)) return;
    onFieldChange("status", change.status);
    onFieldChange(
      "blockedByTaskId",
      change.status === "blocked" ? (change.blockedByTaskId ?? "") : ""
    );
    onFieldChange(
      "followUpAt",
      change.status === "waiting" ? (change.followUpAt ?? "") : ""
    );
    onFieldChange(
      "waitingNote",
      change.status === "waiting" ? (change.waitingNote ?? "") : ""
    );
  };

  const setProject = (projectId: string | null) => {
    const nextProject =
      projects.find((project) => project.id === (projectId ?? "")) ?? null;
    dueGuard.ensure({
      project: nextProject,
      dueDate: form.dueDate || null,
      onAllowed: () => onFieldChange("projectNodeId", projectId ?? ""),
    });
  };

  const clearUndo = () => {
    clearTimeout(undoTimerRef.current);
    setUndoComplete(null);
  };

  const completeTask = () => {
    if (done) {
      applyStatus({ status: "active" });
      clearUndo();
      return;
    }
    const previous: UndoCompleteState = {
      status: isTaskStatus(form.status) ? form.status : "active",
      blockedByTaskId: form.blockedByTaskId,
      followUpAt: form.followUpAt,
      waitingNote: form.waitingNote,
    };
    applyStatus({ status: "completed" });
    setUndoComplete(previous);
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoComplete(null), 6000);
  };

  const undoCompleteAction = () => {
    if (!undoComplete) return;
    applyStatus({
      status: undoComplete.status,
      blockedByTaskId: undoComplete.blockedByTaskId || undefined,
      followUpAt: undoComplete.followUpAt || undefined,
      waitingNote: undoComplete.waitingNote || null,
    });
    clearUndo();
  };

  const markResolved = () => {
    applyStatus({ status: "active" });
  };

  const followUpPast = (() => {
    if (!followUpAt) return false;
    const date = new Date(followUpAt);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return day.getTime() < today.getTime();
  })();

  const followUpLabel = (() => {
    if (!followUpAt) return null;
    const date = new Date(followUpAt);
    if (Number.isNaN(date.getTime())) return followUpAt;
    return date
      .toLocaleDateString(undefined, { month: "short", day: "numeric" })
      .toLowerCase();
  })();

  const emoji = task.details?.emoji?.trim() || null;

  return (
    <div className="task-detail-page project-detail-page flex h-full min-h-0 w-full min-w-0 flex-col overflow-y-auto">
      <header className="project-detail-header">
        <nav className="project-detail-crumb" aria-label="Breadcrumb">
          <Link to="/work">Work</Link>
          {selectedProject || task.project ? (
            <>
              <ChevronRight className="project-detail-crumb-sep" aria-hidden />
              <Link
                to={`/projects/${selectedProject?.id ?? task.project?.id}`}
                className="truncate"
              >
                {projectTitle}
              </Link>
            </>
          ) : null}
          <ChevronRight className="project-detail-crumb-sep" aria-hidden />
          <span className="truncate">{displayName}</span>
        </nav>

        <div className="project-detail-title-row">
          <button
            type="button"
            className="task-detail-title-check"
            data-checked={done ? "true" : "false"}
            aria-label={done ? "Reopen task" : "Complete task"}
            onClick={completeTask}
          >
            {done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
          </button>
          <h1>
            <input
              value={form.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              className="w-full min-w-0 bg-transparent text-[inherit] font-[inherit] tracking-[inherit] text-[var(--fg)] outline-none placeholder:text-[var(--muted-2)]"
              placeholder="Task title"
              aria-label="Task title"
            />
          </h1>
          {emoji ? (
            <span className="project-detail-title-emoji" aria-hidden>
              {emoji}
            </span>
          ) : null}
          <div className="project-detail-title-actions">
            <EntityTransformMenu
              nodeId={task.id}
              sourceType="task"
              sourceTitle={displayName}
              projects={projects}
              defaultProjectId={form.projectNodeId || null}
              compact
              triggerLabel="Convert"
              className="project-detail-control border-[#1a1d23] bg-[var(--control)] shadow-none"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="project-detail-control project-detail-control-icon"
                  aria-label="Task actions"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="text-[12px]"
                  onSelect={(event) => event.preventDefault()}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span>Emoji</span>
                    <EmojiPicker
                      value={task.details?.emoji}
                      size="sm"
                      ariaLabel={`Emoji for ${displayName}`}
                      onChange={onEmojiChange}
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-[12px] text-destructive focus:text-destructive"
                  disabled={isDeletingTask}
                  onSelect={() => onDeleteTask(() => navigate("/work"))}
                >
                  Delete task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          className={cn(
            "project-detail-meta task-detail-meta-indent"
          )}
        >
          <span className="project-detail-meta-item">
            <StatusDot status={form.status} />
            <span className="capitalize text-[var(--fg)]">{statusLabel}</span>
          </span>

          {projectTitle && (selectedProject || task.project) ? (
            <Link
              to={`/projects/${selectedProject?.id ?? task.project?.id}`}
              className="project-detail-meta-item text-[var(--muted)] hover:text-[var(--fg)]"
            >
              {projectEmoji ? <span aria-hidden>{projectEmoji}</span> : null}
              <span className="truncate">{projectTitle}</span>
            </Link>
          ) : null}

          {form.dueDate && !due.empty ? (
            <span className="project-detail-meta-item project-detail-meta-mono">
              {due.overdue ? (
                <>
                  <span className="project-detail-meta-late">{due.label}</span>
                  <span className="text-[var(--muted-2)]">
                    {" "}
                    · due {due.dateLabel.toLowerCase()}
                  </span>
                </>
              ) : (
                <span className="text-[var(--muted-2)]">
                  {due.label
                    ? `${due.label} · due ${due.dateLabel.toLowerCase()}`
                    : `due ${due.dateLabel.toLowerCase()}`}
                </span>
              )}
            </span>
          ) : null}

          <span className="project-detail-meta-updated">
            {formatUpdatedAgo(task.updatedAt)}
          </span>

          {hint ? (
            <span
              className="task-detail-save"
              data-tone={hint.tone === "danger" ? "danger" : undefined}
            >
              {hint.retry ? (
                <button
                  type="button"
                  className="task-detail-save-retry"
                  onClick={onRetrySave}
                >
                  {hint.label}
                </button>
              ) : (
                hint.label
              )}
            </span>
          ) : null}
        </div>
      </header>

      <div className="project-detail-body">
        <div className="project-detail-main">
          {showBlocker ? (
            <section className="project-detail-panel task-detail-blocker">
              <div className="task-detail-blocker-main">
                <div className="task-detail-blocker-line">
                  <span
                    className="task-detail-blocker-dot"
                    data-tone={form.status === "blocked" ? "danger" : "warn"}
                    aria-hidden
                  />
                  {form.status === "blocked" ? (
                    <span>
                      Blocked by{" "}
                      {blockedById ? (
                        <Link to={`/tasks/${blockedById}`}>{blockedByTitle}</Link>
                      ) : (
                        <span>not set</span>
                      )}
                    </span>
                  ) : (
                    <span>
                      {waitingNote ? (
                        <>Waiting on {waitingNote}</>
                      ) : (
                        <>Waiting</>
                      )}
                    </span>
                  )}
                </div>
                {/* blocked-at is not stored on task details — omit "since …" line */}
                {form.status === "waiting" && followUpLabel ? (
                  <p className="task-detail-blocker-sub">
                    {followUpPast
                      ? `follow-up was ${followUpLabel}`
                      : `follow-up ${followUpLabel}`}
                    {" · "}
                    <button type="button" onClick={() => setContextMode("reschedule")}>
                      Reschedule
                    </button>
                  </p>
                ) : null}
              </div>
              <div className="task-detail-blocker-actions">
                <button
                  type="button"
                  className="project-detail-control"
                  onClick={() => setContextMode("change")}
                >
                  Change
                </button>
                <button
                  type="button"
                  className="project-detail-control"
                  onClick={markResolved}
                >
                  {form.status === "blocked" ? "Mark unblocked" : "Mark resolved"}
                </button>
              </div>
            </section>
          ) : null}

          <section className="project-detail-panel task-detail-activity">
            <div
              role="tablist"
              aria-label="Task activity"
              className="project-detail-tabs"
            >
              <button
                type="button"
                role="tab"
                aria-selected="true"
                className="project-detail-tab"
              >
                Notes
                <span className="project-detail-tab-count">{noteCount}</span>
              </button>
            </div>

            <div className="task-detail-activity-body">
              <form
                className="task-detail-capture"
                onSubmit={(event) => {
                  event.preventDefault();
                  onLogNote();
                }}
              >
                <textarea
                  ref={captureRef}
                  value={noteDraft}
                  onChange={(event) => onNoteDraftChange(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                      event.preventDefault();
                      onLogNote();
                    }
                  }}
                  rows={2}
                  placeholder="Log a note, blocker, or status update…"
                  disabled={isLoggingNote}
                  className="task-detail-capture-textarea"
                />
                <div className="task-detail-capture-row">
                  <span className="task-detail-capture-hint">
                    {modKey} + Enter to log
                  </span>
                  <button
                    type="submit"
                    className="task-detail-capture-submit"
                    disabled={!noteDraft.trim() || isLoggingNote}
                  >
                    {isLoggingNote ? "Logging…" : "Log note"}
                  </button>
                </div>
              </form>

              {noteCount === 0 ? (
                <div className="task-detail-empty">
                  <p className="task-detail-empty-title">No notes yet</p>
                  <p className="task-detail-empty-copy">
                    Log updates as you work. Decisions, blockers and handoff
                    context stay with the task.
                  </p>
                </div>
              ) : (
                <LogList
                  title="Notes"
                  items={noteItems}
                  config={logConfig}
                  projects={projects}
                  mode={logMode}
                  onModeChange={setLogMode}
                  search={logSearch}
                  onSearchChange={setLogSearch}
                  projectFilter={logProjectFilter}
                  onProjectFilterChange={setLogProjectFilter}
                  className="task-detail-log"
                />
              )}
            </div>
          </section>
        </div>

        <TaskDetailProperties
          form={form}
          projects={projects}
          people={people}
          createdAt={task.details?.createdAt ?? task.createdAt}
          updatedAt={task.updatedAt}
          excludeTaskId={task.id}
          onFieldChange={onFieldChange}
          onStatusChange={applyStatus}
          onProjectChange={setProject}
        />
      </div>

      {contextMode &&
      (form.status === "blocked" || form.status === "waiting") ? (
        <TaskStatusContextDialog
          open
          status={form.status}
          excludeTaskId={task.id}
          initialBlockedByTaskId={form.blockedByTaskId}
          initialFollowUpAt={form.followUpAt}
          initialWaitingNote={form.waitingNote}
          onOpenChange={(open) => {
            if (!open) setContextMode(null);
          }}
          onConfirm={(change) => {
            applyStatus(change);
            setContextMode(null);
          }}
        />
      ) : null}

      {undoComplete ? (
        <div className="task-detail-undo" role="status">
          <span>Task completed</span>
          <button type="button" onClick={undoCompleteAction}>
            Undo
          </button>
        </div>
      ) : null}

      {dueGuard.dialog}
    </div>
  );
}
