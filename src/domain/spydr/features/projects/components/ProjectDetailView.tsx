import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  FileText,
  GitBranch,
  Lightbulb,
  Paperclip,
  Tag as TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ProjectDetailNode,
  SpydrPriority,
} from "@/domain/spydr/utils/types";
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
  ProjectDetailFormValues,
  ProjectTaskFormValues,
} from "../hooks/useProjectDetailPage";

interface ProjectDetailViewProps {
  project: ProjectDetailNode;
  stats: {
    openTasks: number;
    totalTasks: number;
    progressPercent: number;
    decisionCount: number;
  };
  detailForm: ProjectDetailFormValues;
  taskForm: ProjectTaskFormValues;
  canSaveDetails: boolean;
  canAddTask: boolean;
  isSavingDetails: boolean;
  isAddingTask: boolean;
  detailError: string | null;
  taskError: string | null;
  onDetailFieldChange<TField extends keyof ProjectDetailFormValues>(
    field: TField,
    value: ProjectDetailFormValues[TField]
  ): void;
  onTaskFieldChange<TField extends keyof ProjectTaskFormValues>(
    field: TField,
    value: ProjectTaskFormValues[TField]
  ): void;
  onSaveDetails(): void;
  onAddTask(): void;
}

const priorityOptions: SpydrPriority[] = ["low", "medium", "high", "critical"];

export function ProjectDetailView({
  project,
  stats,
  detailForm,
  taskForm,
  canSaveDetails,
  canAddTask,
  isSavingDetails,
  isAddingTask,
  detailError,
  taskError,
  onDetailFieldChange,
  onTaskFieldChange,
  onSaveDetails,
  onAddTask,
}: ProjectDetailViewProps) {
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
              <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/40 px-2 py-1 text-[11px]">
                <StatusDot status={project.status} /> {project.status}
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
        />

        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/30 px-3 py-2">
            <div className="min-w-0">
              <SectionHead label="Project details" hint="brief + planning" />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Save updates to the project brief, dates, and risk together.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={!canSaveDetails}
              onClick={onSaveDetails}
            >
              {isSavingDetails ? "Saving..." : "Save changes"}
            </Button>
          </div>

          <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="flex min-h-[260px] flex-col rounded-lg border border-border bg-card/30 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <SectionHead label="Brief" hint="editable" />
            </div>
            <textarea
              value={detailForm.body}
              onChange={(event) => onDetailFieldChange("body", event.target.value)}
              placeholder="Describe the project brief, context, and intent."
              className="min-h-0 flex-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-[13px] leading-relaxed ring-focus placeholder:text-muted-foreground"
            />
          </section>

          <aside className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border sm:col-span-2 xl:col-span-1">
              <Stat label="Open" value={`${stats.openTasks}`} sub={`of ${stats.totalTasks}`} />
              <Stat label="Progress" value={`${stats.progressPercent}%`} />
              <Stat label="Decisions" value={`${stats.decisionCount}`} />
            </div>

            <div className="rounded-lg border border-border bg-card/30 p-3 sm:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between gap-3">
                <SectionHead label="Planning" hint="editable" />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
              <Field label="Start">
                <input
                  type="date"
                  value={detailForm.startDate}
                  onChange={(event) =>
                    onDetailFieldChange("startDate", event.target.value)
                  }
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-[12px] ring-focus"
                />
              </Field>
              <Field label="Target">
                <input
                  type="date"
                  value={detailForm.targetDate}
                  onChange={(event) =>
                    onDetailFieldChange("targetDate", event.target.value)
                  }
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-[12px] ring-focus"
                />
              </Field>
              <Field label="Risk">
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
              </Field>
              </div>
              {detailError && (
                <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {detailError}
                </p>
              )}
            </div>

            {project.details?.outcome && (
              <div className="rounded-lg border border-border bg-card/30 p-3 sm:col-span-2 xl:col-span-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Outcome
                </div>
                <p className="mt-1 line-clamp-3 text-[12.5px] leading-relaxed">
                  {project.details.outcome}
                </p>
              </div>
            )}
          </aside>
          </div>
        </div>

        <div className="grid gap-4 px-4 pb-4 xl:grid-cols-2">
          <Panel
            icon={<Activity className="h-3.5 w-3.5" />}
            label="In motion"
            hint={`${stats.openTasks} open`}
          >
            <form
              className="grid gap-2 border-b border-border pb-3 md:grid-cols-[1fr_118px_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                onAddTask();
              }}
            >
              <input
                value={taskForm.title}
                onChange={(event) => onTaskFieldChange("title", event.target.value)}
                placeholder="Add a task..."
                className="h-8 rounded-md border border-input bg-background px-3 text-[13px] ring-focus placeholder:text-muted-foreground"
              />
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(event) => onTaskFieldChange("dueDate", event.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-[12px] ring-focus"
              />
              <Button type="submit" size="sm" disabled={!canAddTask}>
                {isAddingTask ? "Adding..." : "Add"}
              </Button>
            </form>
            {taskError && (
              <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {taskError}
              </p>
            )}
            <ul className="mt-2 max-h-[280px] divide-y divide-border overflow-y-auto pr-1">
              {project.tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    readOnly
                    checked={task.status === "completed"}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  <StatusPill status={task.status} />
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {task.title}
                  </span>
                  <span className="w-20 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                    {formatShortDate(task.details?.dueDate)}
                  </span>
                </li>
              ))}
              {!project.tasks.length && (
                <li className="py-3 text-sm text-muted-foreground">
                  No tasks linked yet.
                </li>
              )}
            </ul>
          </Panel>

          <Panel
            icon={<GitBranch className="h-3.5 w-3.5" />}
            label="Decision log"
            hint={`${project.decisions.length} recorded`}
          >
            <ol className="max-h-[340px] space-y-3 overflow-y-auto border-l border-border pl-5 pr-1">
              {project.decisions.map((decision) => (
                <li key={decision.id} className="relative">
                  <span className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-card" />
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[13px] font-semibold">
                      {decision.title}
                    </h3>
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                      {formatRelativeTime(decision.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                    {decision.details?.rationale || decision.body}
                  </p>
                </li>
              ))}
              {!project.decisions.length && (
                <li className="text-sm text-muted-foreground">
                  No decisions recorded.
                </li>
              )}
            </ol>
          </Panel>

          <Panel
            icon={<Lightbulb className="h-3.5 w-3.5" />}
            label="Thinking"
            hint={`${project.ideas.length} ideas`}
          >
            <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
              {project.ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="rounded-md border border-border/70 bg-background/40 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[13px] font-semibold">{idea.title}</h3>
                    <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                      {formatRelativeTime(idea.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                    {idea.body}
                  </p>
                </div>
              ))}
              {!project.ideas.length && (
                <p className="text-sm text-muted-foreground">No ideas linked yet.</p>
              )}
            </div>
          </Panel>

          <Panel
            icon={<Paperclip className="h-3.5 w-3.5" />}
            label="Knowledge"
            hint={`${project.notes.length + project.resources.length} items`}
          >
            <div className="grid max-h-[260px] gap-4 overflow-y-auto pr-1 md:grid-cols-2">
              <div>
                <SectionHead
                  icon={<FileText className="h-3.5 w-3.5" />}
                  label="Notes"
                  hint={`${project.notes.length}`}
                />
                <ul className="mt-2 space-y-1.5">
                  {project.notes.map((note) => (
                    <li
                      key={note.id}
                      className="flex items-baseline gap-2 rounded px-1.5 py-1 row-hover"
                    >
                      <span className="truncate text-[13px]">{note.title}</span>
                      <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                        {formatRelativeTime(note.updatedAt)}
                      </span>
                    </li>
                  ))}
                  {!project.notes.length && (
                    <li className="text-sm text-muted-foreground">None yet.</li>
                  )}
                </ul>
              </div>
              <div>
                <SectionHead
                  icon={<Paperclip className="h-3.5 w-3.5" />}
                  label="Resources"
                  hint={`${project.resources.length}`}
                />
                <ul className="mt-2 space-y-1.5">
                  {project.resources.map((resource) => (
                    <li
                      key={resource.id}
                      className="flex items-baseline gap-2 rounded px-1.5 py-1 row-hover"
                    >
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">
                        {resource.details?.resourceType ?? "resource"}
                      </span>
                      <span className="truncate text-[13px]">{resource.title}</span>
                      <ArrowUpRight className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" />
                    </li>
                  ))}
                  {!project.resources.length && (
                    <li className="text-sm text-muted-foreground">None yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function SectionHead({
  icon,
  label,
  hint,
}: {
  icon?: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </h2>
      <span className="h-px flex-1 bg-border" />
      {hint && (
        <span className="font-mono text-[10px] text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}

function Panel({
  icon,
  label,
  hint,
  children,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-h-0 rounded-lg border border-border bg-card/30 p-3">
      <SectionHead icon={icon} label={label} hint={hint} />
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-card p-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-xl font-semibold tabular-nums">{value}</span>
        {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

