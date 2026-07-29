import type { ReactNode } from "react";
import type { PersonWorkProjectEntry, PersonWorkTaskEntry } from "@/domain/spydr/utils/personWorkApi";
import type { ProjectAreaNode, ProjectNode } from "@/domain/spydr/utils/types";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { PersonMeBadge } from "@/domain/spydr/features/people/components/PersonIdentity";
import { CreateProjectDialog } from "@/domain/spydr/features/projects/components/CreateProjectDialog";
import { CreateTaskDialog } from "@/domain/spydr/features/tasks/components/CreateTaskDialog";
import type { useCreateProjectForm } from "@/domain/spydr/features/projects/hooks/useCreateProjectForm";
import type { useCreateTaskForm } from "@/domain/spydr/features/tasks/hooks/useCreateTaskForm";
import type {
  PersonDetailFormValues,
  PersonDetailSaveState,
} from "../hooks/usePersonDetailPage";
import { PersonWorkSection } from "./PersonWorkSection";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-8 w-full rounded-sm border border-input bg-background px-2 text-[12.5px] ring-focus placeholder:text-muted-foreground";

function saveLabel(state: PersonDetailSaveState) {
  if (state === "saving" || state === "pending") return "Saving…";
  if (state === "saved") return "Saved";
  if (state === "error") return "Save failed";
  return null;
}

function CompactField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("min-w-0 space-y-1", className)}>
      <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

interface PersonDetailViewProps {
  form: PersonDetailFormValues;
  saveState: PersonDetailSaveState;
  personId: string;
  displayName: string;
  updatedAt: string;
  projectEntries: PersonWorkProjectEntry[];
  assignedTasks: PersonWorkTaskEntry[];
  projects: ProjectNode[];
  projectAreas: ProjectAreaNode[];
  createProject: ReturnType<typeof useCreateProjectForm>;
  createTask: ReturnType<typeof useCreateTaskForm>;
  deleteError: string | null;
  isDeleting: boolean;
  isReorderingCollection?: boolean;
  updatingTaskId?: string | null;
  updatingProjectId?: string | null;
  creatingTaskProjectId?: string | null;
  dueDateError?: string | null;
  taskStatusError?: string | null;
  targetDateError?: string | null;
  projectStatusError?: string | null;
  createTaskError?: string | null;
  onReorderProjects?(orderedIds: string[]): void;
  onReorderTasks?(orderedIds: string[]): void;
  onDueDateChange?(taskId: string, dueDate: string | null): void;
  onTaskStatusChange?(taskId: string, status: string): void;
  onTargetDateChange?(projectId: string, targetDate: string | null): void;
  onProjectStatusChange?(projectId: string, status: string): void;
  onCreateTask?(projectId: string, title: string, onSuccess?: () => void): void;
  onFieldChange<TField extends keyof PersonDetailFormValues>(
    field: TField,
    value: PersonDetailFormValues[TField]
  ): void;
  onDelete(): void;
}

export function PersonDetailView({
  form,
  saveState,
  personId,
  displayName,
  updatedAt,
  projectEntries,
  assignedTasks,
  projects,
  projectAreas,
  createProject,
  createTask,
  deleteError,
  isDeleting,
  isReorderingCollection = false,
  updatingTaskId = null,
  updatingProjectId = null,
  creatingTaskProjectId = null,
  dueDateError = null,
  taskStatusError = null,
  targetDateError = null,
  projectStatusError = null,
  createTaskError = null,
  onReorderProjects,
  onReorderTasks,
  onDueDateChange,
  onTaskStatusChange,
  onTargetDateChange,
  onProjectStatusChange,
  onCreateTask,
  onFieldChange,
  onDelete,
}: PersonDetailViewProps) {
  const hint = saveLabel(saveState);
  const { isMe, primaryClerkEmail } = useCurrentUserPerson();
  const isCurrentUser = isMe(personId);
  usePageBreadcrumb(displayName);

  const openTaskCount = assignedTasks.filter(
    (entry) =>
      entry.task.status !== "completed" && entry.task.status !== "archived"
  ).length;

  const workError =
    taskStatusError ??
    dueDateError ??
    projectStatusError ??
    targetDateError ??
    createTaskError;

  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <PageHeader
        dense
        title={
          <span className="inline-flex items-center gap-2">
            {displayName}
            {isCurrentUser ? <PersonMeBadge /> : null}
          </span>
        }
        meta={
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <span className="text-highlight">{openTaskCount} open</span>
            <span className="text-border">·</span>
            <span>{projectEntries.length} projects</span>
            <span className="text-border">·</span>
            <span className="normal-case tracking-normal">
              {new Date(updatedAt).toLocaleString()}
            </span>
            {hint ? (
              <>
                <span className="text-border">·</span>
                <span
                  className={cn(
                    saveState === "error" ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {hint}
                </span>
              </>
            ) : null}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <CreateTaskDialog
              projects={projects}
              open={createTask.isOpen}
              values={createTask.values}
              canSubmit={createTask.canSubmit}
              isSubmitting={createTask.isSubmitting}
              errorMessage={createTask.errorMessage}
              assigneeName={displayName}
              triggerVariant="default"
              onOpenChange={createTask.setIsOpen}
              onFieldChange={createTask.updateField}
              onSubmit={createTask.submit}
            />
            <InlineDeleteButton
              label={displayName}
              isDeleting={isDeleting}
              onDelete={onDelete}
            />
          </div>
        }
      />

      {deleteError ? (
        <p className="px-6 py-1.5 text-sm text-destructive">{deleteError}</p>
      ) : null}

      <div className="border-b border-border px-6 py-3">
        {isCurrentUser ? (
          <div className="mb-2.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-highlight">
            <PersonMeBadge compact />
            <span>
              Your profile
              {primaryClerkEmail ? (
                <span className="normal-case tracking-normal text-muted-foreground">
                  {" "}
                  · {primaryClerkEmail}
                </span>
              ) : null}
            </span>
          </div>
        ) : null}

        <div className="flex gap-3">
          <span
            className={cn(
              "mt-4 grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-border bg-muted/25 font-mono text-sm font-semibold text-foreground/85",
              isCurrentUser &&
                "person-me-avatar border-highlight/50 bg-highlight/10 text-highlight"
            )}
          >
            {displayName.charAt(0).toUpperCase()}
          </span>

          <div className="grid min-w-0 flex-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
            <CompactField label="Full name">
              <input
                value={form.fullName}
                onChange={(event) => onFieldChange("fullName", event.target.value)}
                className={fieldClass}
              />
            </CompactField>
            <CompactField label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) => onFieldChange("email", event.target.value)}
                placeholder="name@company.com"
                className={fieldClass}
              />
            </CompactField>
            <CompactField label="Title">
              <input
                value={form.title}
                onChange={(event) => onFieldChange("title", event.target.value)}
                placeholder="Role"
                className={fieldClass}
              />
            </CompactField>
            <CompactField label="Organization">
              <input
                value={form.organization}
                onChange={(event) => onFieldChange("organization", event.target.value)}
                placeholder="Org"
                className={fieldClass}
              />
            </CompactField>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 md:px-6">
        <PersonWorkSection
          projectEntries={projectEntries}
          tasks={assignedTasks}
          reorderEnabled={!isReorderingCollection}
          updatingTaskId={updatingTaskId}
          updatingProjectId={updatingProjectId}
          creatingTaskProjectId={creatingTaskProjectId}
          onReorderProjects={onReorderProjects}
          onReorderTasks={onReorderTasks}
          onDueDateChange={onDueDateChange}
          onTaskStatusChange={onTaskStatusChange}
          onTargetDateChange={onTargetDateChange}
          onProjectStatusChange={onProjectStatusChange}
          onCreateTask={onCreateTask}
          headerActions={
            <CreateProjectDialog
              areas={projectAreas}
              open={createProject.isOpen}
              values={createProject.values}
              canSubmit={createProject.canSubmit}
              isSubmitting={createProject.isSubmitting}
              errorMessage={createProject.errorMessage}
              linkPersonName={displayName}
              triggerVariant="outline"
              onOpenChange={createProject.setIsOpen}
              onFieldChange={createProject.updateField}
              onSubmit={createProject.submit}
            />
          }
        />
        {workError ? (
          <p className="mt-2 text-[12px] text-destructive">{workError}</p>
        ) : null}
      </div>
    </div>
  );
}
