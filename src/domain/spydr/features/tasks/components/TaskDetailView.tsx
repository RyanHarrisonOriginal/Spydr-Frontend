import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { EntityTransformMenu } from "@/domain/spydr/features/shared/components/EntityTransformMenu";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { formatBreadcrumbEntityId } from "@/domain/spydr/features/shell/utils/navigationBreadcrumbs";
import {
  formatNoteListDate,
  formatRelativeTime,
} from "@/domain/spydr/features/shared/components/time";
import { EntityTag } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { ProjectPrioritySelect } from "@/domain/spydr/features/projects/components/ProjectPrioritySelect";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import { EmojiPicker } from "@/domain/spydr/features/shared/components/EmojiPicker";
import { PersonSelect } from "@/domain/spydr/features/projects/components/PersonSelect";
import {
  ProjectDetailEmpty,
  ProjectDetailEntry,
  ProjectDetailField,
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailTabs,
  detailQuietControlClassName,
  detailQuietInputClassName,
  detailStrandControlClassName,
} from "@/domain/spydr/features/projects/components/ProjectDetailSection";
import type { PersonNode, ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { isTaskStatus } from "@/domain/spydr/utils/taskStatus";
import { parseTaskNoteEntries } from "@/domain/spydr/utils/taskNotes";
import { useIsPhone } from "@/hooks/useIsPhone";
import type {
  TaskDetailFormValues,
  TaskDetailSaveState,
} from "../hooks/useTaskDetailPage";
import { TaskStatusSelect } from "./TaskStatusSelect";
import { TaskDueDateSelect } from "./TaskDueDateSelect";
import { TaskCompletedAt } from "./TaskCompletedAt";
import { useEnsureTaskDueWithinProject } from "../hooks/useEnsureTaskDueWithinProject";

function saveLabel(state: TaskDetailSaveState) {
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
}: TaskDetailViewProps) {
  const isPhone = useIsPhone();
  const hint = saveLabel(saveState);
  const { entries, preamble } = parseTaskNoteEntries(task.body);
  const noteCount = entries.length + (preamble ? 1 : 0);
  usePageBreadcrumb(formatBreadcrumbEntityId(task.id));
  const selectedProject =
    projects.find((project) => project.id === form.projectNodeId) ?? null;
  const dueGuard = useEnsureTaskDueWithinProject();

  const setProject = (projectId: string | null) => {
    const nextProject =
      projects.find((project) => project.id === (projectId ?? "")) ?? null;
    dueGuard.ensure({
      project: nextProject,
      dueDate: form.dueDate || null,
      onAllowed: () => onFieldChange("projectNodeId", projectId ?? ""),
    });
  };

  return (
    <div className="flex min-w-0">
      <div className="min-w-0 flex-1">
        <div className="border-b border-border spydr-rule">
          <PageHeader
            dense={isPhone}
            className="border-b-0 shadow-none after:hidden"
            titleClassName="w-full max-w-none"
            title={
              <div className="flex min-w-0 items-center gap-2">
                <EmojiPicker
                  value={task.details?.emoji}
                  size="md"
                  ariaLabel={`Emoji for ${task.title}`}
                  onChange={onEmojiChange}
                />
                <input
                  value={form.title}
                  onChange={(event) => onFieldChange("title", event.target.value)}
                  className={cn(
                    "w-full min-w-0 bg-transparent font-semibold tracking-tight outline-none ring-0 placeholder:text-muted-foreground",
                    isPhone ? "text-[16px] leading-snug" : "text-[1.5rem]"
                  )}
                  placeholder="Task title"
                />
              </div>
            }
            meta={
              isPhone ? (
                <div className="flex w-full min-w-0 flex-col gap-1">
                  <div className="flex min-w-0 items-center gap-1">
                    <TaskStatusSelect
                      value={form.status}
                      onChange={(status) => {
                        if (isTaskStatus(status)) {
                          onFieldChange("status", status);
                        }
                      }}
                      fitContent
                      className={cn(detailQuietControlClassName, "w-[6.75rem] shrink-0")}
                    />
                    <ProjectSelect
                      projects={projects}
                      value={form.projectNodeId}
                      allowUnassigned
                      compact
                      onChange={setProject}
                      className={cn(detailQuietControlClassName, "min-w-0 flex-1")}
                    />
                    {selectedProject ? (
                      <Link
                        to={`/projects/${selectedProject.id}`}
                        aria-label={`Open ${selectedProject.title}`}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted/40 hover:text-highlight"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 items-center gap-1">
                    <TaskDueDateSelect
                      value={form.dueDate || null}
                      onChange={(dueDate) => onFieldChange("dueDate", dueDate ?? "")}
                      variant="compact"
                      showChevron={false}
                      showIcon={false}
                      placeholder="Due"
                      project={selectedProject}
                      className={cn(
                        detailQuietControlClassName,
                        "w-[5.5rem] shrink-0 justify-center"
                      )}
                    />
                    <ProjectPrioritySelect
                      value={form.priority}
                      onChange={(priority) =>
                        onFieldChange(
                          "priority",
                          priority as TaskDetailFormValues["priority"]
                        )
                      }
                      ariaLabel="Task priority"
                      fitContent
                      className={detailQuietControlClassName}
                    />
                    {hint ? (
                      <span className="ml-auto truncate font-mono text-[10px] tabular-nums text-muted-foreground">
                        {hint}
                      </span>
                    ) : (
                      <TaskCompletedAt
                        status={task.status}
                        completedAt={task.details?.completedAt}
                        className="ml-auto"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                  <TaskStatusSelect
                    value={form.status}
                    onChange={(status) => {
                      if (isTaskStatus(status)) {
                        onFieldChange("status", status);
                      }
                    }}
                    fitContent
                    className={detailQuietControlClassName}
                  />
                  <ProjectPrioritySelect
                    value={form.priority}
                    onChange={(priority) =>
                      onFieldChange(
                        "priority",
                        priority as TaskDetailFormValues["priority"]
                      )
                    }
                    ariaLabel="Task priority"
                    fitContent
                    className={detailQuietControlClassName}
                  />
                  <ProjectSelect
                    projects={projects}
                    value={form.projectNodeId}
                    allowUnassigned
                    fitContent
                    onChange={setProject}
                    className={detailQuietControlClassName}
                  />
                  {selectedProject ? (
                    <Link
                      to={`/projects/${selectedProject.id}`}
                      aria-label={`Open ${selectedProject.title}`}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted/40 hover:text-highlight"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                  {task.tags.map((tag) => (
                    <EntityTag key={tag} tag={tag} />
                  ))}
                  <TaskCompletedAt
                    status={task.status}
                    completedAt={task.details?.completedAt}
                  />
                  <span className="font-mono text-[11px] text-muted-foreground/80">
                    updated {formatRelativeTime(task.updatedAt)}
                    {hint ? ` · ${hint}` : null}
                  </span>
                </div>
              )
            }
            actions={
              <EntityTransformMenu
                nodeId={task.id}
                sourceType="task"
                sourceTitle={task.title}
                projects={projects}
                compact={isPhone}
                className="border-0 bg-transparent shadow-none"
              />
            }
          />
        </div>

        <div className="px-4 pt-5 md:px-8 md:pt-7">
          <div
            className={cn(
              "flex flex-wrap items-end gap-x-6 gap-y-3",
              isPhone && "grid grid-cols-2 gap-x-4 gap-y-3"
            )}
          >
            <ProjectDetailField label="Assignee" className="w-auto min-w-[10rem] space-y-1">
              <PersonSelect
                people={people}
                value={form.assigneePersonNodeId || null}
                compact
                onChange={(personNodeId) =>
                  onFieldChange("assigneePersonNodeId", personNodeId ?? "")
                }
                ariaLabel="Task assignee"
                triggerClassName={detailStrandControlClassName}
              />
            </ProjectDetailField>
            {isPhone ? null : (
              <ProjectDetailField label="Due" className="w-auto space-y-1">
                <TaskDueDateSelect
                  value={form.dueDate || null}
                  onChange={(dueDate) => onFieldChange("dueDate", dueDate ?? "")}
                  variant="field"
                  placeholder="Select due date"
                  showIcon={false}
                  fitContent
                  project={selectedProject}
                  className={detailStrandControlClassName}
                />
              </ProjectDetailField>
            )}
            <ProjectDetailField
              label="Estimate"
              hint="minutes"
              className="w-auto min-w-[7rem] space-y-1"
            >
              <input
                type="number"
                min={0}
                value={form.estimatedMinutes}
                onChange={(event) =>
                  onFieldChange("estimatedMinutes", event.target.value)
                }
                placeholder="—"
                className={cn(detailQuietInputClassName, "h-8 w-[7rem]")}
              />
            </ProjectDetailField>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col pb-16 pt-8",
            isPhone ? "px-3" : "px-4 md:px-8"
          )}
        >
          <ProjectDetailSection variant="plain">
            <div
              className={cn(
                "flex min-w-0 items-center gap-2 pb-1",
                isPhone ? "px-1" : "px-0"
              )}
            >
              <ProjectDetailTabs<"notes">
                value="notes"
                onChange={() => undefined}
                ariaLabel="Task work"
                items={[{ id: "notes", label: "Notes", count: noteCount }]}
              />
            </div>
            <ProjectDetailSectionBody
              className={cn(
                "min-h-0 gap-3 px-0 py-4",
                isPhone ? "px-1" : "px-0"
              )}
            >
              <form
                className="rounded-md bg-muted/25 px-3 py-2.5"
                onSubmit={(event) => {
                  event.preventDefault();
                  onLogNote();
                }}
              >
                <textarea
                  value={noteDraft}
                  onChange={(event) => onNoteDraftChange(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                      event.preventDefault();
                      onLogNote();
                    }
                  }}
                  rows={3}
                  placeholder="Log a note, blocker, or status update…"
                  disabled={isLoggingNote}
                  className="spydr-strand-field min-h-[4.5rem] w-full resize-y rounded-sm border-0 bg-transparent px-0 py-1 text-[14px] leading-relaxed outline-none ring-0 placeholder:text-muted-foreground"
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Ctrl+Enter to log
                  </span>
                  <Button
                    type="submit"
                    className="h-8 rounded-md px-3 text-[12px]"
                    disabled={!noteDraft.trim() || isLoggingNote}
                  >
                    {isLoggingNote ? "Logging…" : "Log note"}
                  </Button>
                </div>
              </form>

              {noteCount > 0 ? (
                <ul className="min-h-0">
                  {preamble ? (
                    <ProjectDetailEntry>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Earlier notes
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed">
                        {preamble}
                      </p>
                    </ProjectDetailEntry>
                  ) : null}
                  {entries.map((entry) => (
                    <ProjectDetailEntry
                      key={`${entry.loggedAt}-${entry.text.slice(0, 24)}`}
                    >
                      <div className="flex items-baseline gap-2">
                        <p className="min-w-0 flex-1 whitespace-pre-wrap text-[13px] leading-relaxed">
                          {entry.text}
                        </p>
                        <time
                          className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground"
                          dateTime={entry.loggedAt}
                          title={new Date(entry.loggedAt).toLocaleString()}
                        >
                          {formatNoteListDate(entry.loggedAt)}
                        </time>
                      </div>
                    </ProjectDetailEntry>
                  ))}
                </ul>
              ) : (
                <ProjectDetailEmpty
                  title="No notes yet."
                  description="Log updates as you work — decisions, blockers, and handoff context stay with the task."
                />
              )}
            </ProjectDetailSectionBody>
          </ProjectDetailSection>
        </div>
      </div>
      {dueGuard.dialog}
    </div>
  );
}
