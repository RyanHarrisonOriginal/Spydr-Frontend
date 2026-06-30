import { Link } from "react-router-dom";
import { ClipboardList, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import { ProjectPrioritySelect } from "@/domain/spydr/features/projects/components/ProjectPrioritySelect";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import { PersonSelect } from "@/domain/spydr/features/projects/components/PersonSelect";
import {
  ProjectDetailEmpty,
  ProjectDetailEntry,
  ProjectDetailField,
  ProjectDetailFormPanel,
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
  detailFieldClassName,
  detailTextareaClassName,
} from "@/domain/spydr/features/projects/components/ProjectDetailSection";
import type { PersonNode, ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { isTaskStatus } from "@/domain/spydr/utils/taskStatus";
import { parseTaskNoteEntries } from "@/domain/spydr/utils/taskNotes";
import type {
  TaskDetailFormValues,
  TaskDetailSaveState,
} from "../hooks/useTaskDetailPage";
import { TaskStatusSelect } from "./TaskStatusSelect";

function saveLabel(state: TaskDetailSaveState) {
  if (state === "saving" || state === "pending") return "Saving…";
  if (state === "saved") return "Saved";
  if (state === "error") return "Save failed";
  return null;
}

function formatNoteTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
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
}: TaskDetailViewProps) {
  const hint = saveLabel(saveState);
  const { entries, preamble } = parseTaskNoteEntries(task.body);

  return (
    <div className="flex min-w-0">
      <div className="min-w-0 flex-1">
        <PageHeader
          eyebrow={
            <span className="flex items-center gap-2">
              <Link to="/tasks" className="hover:text-foreground">
                Tasks
              </Link>
              <span>/</span>
              <span className="font-mono">{task.id.slice(0, 8)}</span>
            </span>
          }
          title={
            <input
              value={form.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              className="w-full bg-transparent text-[1.35rem] font-semibold tracking-tight outline-none ring-focus placeholder:text-muted-foreground"
              placeholder="Task title"
            />
          }
          meta={
            <span className="font-mono text-[11px] text-muted-foreground">
              updated {formatRelativeTime(task.updatedAt)}
              {task.details?.completedAt
                ? ` · completed ${formatRelativeTime(task.details.completedAt)}`
                : null}
            </span>
          }
        />

        <div className="space-y-5 px-6 pb-8 pt-2">
          <ProjectDetailSection>
            <ProjectDetailSectionHeader
              icon={<ClipboardList />}
              label="Overview"
              hint={hint ?? undefined}
              hintClassName={saveState === "error" ? "text-destructive" : undefined}
            />
            <ProjectDetailSectionBody>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ProjectDetailField label="Status">
                  <TaskStatusSelect
                    value={form.status}
                    onChange={(status) => {
                      if (isTaskStatus(status)) {
                        onFieldChange("status", status);
                      }
                    }}
                    className="w-full"
                  />
                </ProjectDetailField>
                <ProjectDetailField label="Priority">
                  <ProjectPrioritySelect
                    value={form.priority}
                    onChange={(priority) =>
                      onFieldChange(
                        "priority",
                        priority as TaskDetailFormValues["priority"]
                      )
                    }
                    className="w-full"
                  />
                </ProjectDetailField>
                <ProjectDetailField label="Project">
                  <ProjectSelect
                    projects={projects}
                    value={form.projectNodeId}
                    allowUnassigned
                    onChange={(projectId) =>
                      onFieldChange("projectNodeId", projectId ?? "")
                    }
                    className="w-full"
                  />
                </ProjectDetailField>
                <ProjectDetailField label="Assignee">
                  <PersonSelect
                    people={people}
                    value={form.assigneePersonNodeId || null}
                    onChange={(personNodeId) =>
                      onFieldChange("assigneePersonNodeId", personNodeId ?? "")
                    }
                    ariaLabel="Task assignee"
                    className="w-full"
                  />
                </ProjectDetailField>
                <ProjectDetailField label="Due date">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => onFieldChange("dueDate", event.target.value)}
                    className="date-input h-8 w-full"
                  />
                </ProjectDetailField>
                <ProjectDetailField label="Estimate" hint="minutes">
                  <input
                    type="number"
                    min={0}
                    value={form.estimatedMinutes}
                    onChange={(event) =>
                      onFieldChange("estimatedMinutes", event.target.value)
                    }
                    placeholder="—"
                    className={detailFieldClassName}
                  />
                </ProjectDetailField>
                {task.project ? (
                  <ProjectDetailField label="Open project">
                    <Link
                      to={`/projects/${task.project.id}`}
                      className="inline-flex h-8 items-center text-[13px] text-primary hover:underline"
                    >
                      {task.project.title}
                    </Link>
                  </ProjectDetailField>
                ) : null}
              </div>
            </ProjectDetailSectionBody>
          </ProjectDetailSection>

          <ProjectDetailSection>
            <ProjectDetailSectionHeader
              icon={<NotebookPen />}
              label="Work log"
              hint={
                entries.length > 0
                  ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`
                  : undefined
              }
            />
            <ProjectDetailSectionBody className="gap-3">
              <ProjectDetailFormPanel>
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
                  className={detailTextareaClassName}
                  disabled={isLoggingNote}
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Ctrl+Enter to log
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={onLogNote}
                    disabled={!noteDraft.trim() || isLoggingNote}
                  >
                    {isLoggingNote ? "Logging…" : "Log note"}
                  </Button>
                </div>
              </ProjectDetailFormPanel>

              {preamble ? (
                <ProjectDetailFormPanel label="Earlier notes">
                  <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-foreground/90">
                    {preamble}
                  </p>
                </ProjectDetailFormPanel>
              ) : null}

              {entries.length > 0 ? (
                <ul className="space-y-2">
                  {entries.map((entry) => (
                    <ProjectDetailEntry key={`${entry.loggedAt}-${entry.text.slice(0, 24)}`}>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {formatNoteTimestamp(entry.loggedAt)}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed">
                        {entry.text}
                      </p>
                    </ProjectDetailEntry>
                  ))}
                </ul>
              ) : !preamble ? (
                <ProjectDetailEmpty
                  title="No notes yet"
                  description="Log updates as you work — decisions, blockers, and handoff context stay with the task."
                />
              ) : null}
            </ProjectDetailSectionBody>
          </ProjectDetailSection>
        </div>
      </div>
    </div>
  );
}
