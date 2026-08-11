import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import { ProjectListFieldSelect } from "@/domain/spydr/features/projects/components/ProjectListFieldSelect";
import type {
  ActiveNoteProposalAttachment,
  ActiveNoteProposalOperation,
  SpydrObjectType,
} from "@/domain/spydr/utils/activeNoteTypes";
import { SUPPORTED_OBJECT_TYPES } from "@/domain/spydr/utils/activeNoteTypes";
import { objectTypeLabel } from "../utils/proposalPresentation";
import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { isOpenTask } from "@/domain/spydr/utils/personWork";

const CREATABLE_OBJECT_TYPES: readonly SpydrObjectType[] = [
  "project",
  "task",
  "note",
  "idea",
  "decision",
  "goal",
] as const;

interface ActiveNoteSuggestionControlsProps {
  operation: ActiveNoteProposalOperation;
  projects: ProjectNode[];
  tasks: TaskNode[];
  disabled?: boolean;
  onObjectTypeChange(objectType: SpydrObjectType): void;
  onProjectChange(projectId: string | null): void;
  onAttachmentChange(attachment: ActiveNoteProposalAttachment | null): void;
}

function tasksForProject(tasks: TaskNode[], projectId: string | null): TaskNode[] {
  if (!projectId) return [];
  return tasks
    .filter((task) => task.project?.id === projectId && isOpenTask(task))
    .sort(
      (left, right) =>
        (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
        left.title.localeCompare(right.title)
    );
}

export function ActiveNoteSuggestionControls({
  operation,
  projects,
  tasks,
  disabled = false,
  onObjectTypeChange,
  onProjectChange,
  onAttachmentChange,
}: ActiveNoteSuggestionControlsProps) {
  const objectType = operation.objectType ?? "note";
  const supportsProject =
    objectType === "task" ||
    objectType === "note" ||
    objectType === "decision" ||
    objectType === "idea" ||
    objectType === "goal";
  const supportsTaskLink = objectType === "note";
  const projectId = operation.selectedProjectId ?? null;
  const projectTasks = tasksForProject(tasks, projectId);
  const attachmentTaskId =
    operation.attachment?.type === "task" ? operation.attachment.id ?? null : null;

  const linkModeOptions = [
    { value: "standalone", label: "Project note" },
    { value: "task", label: "Attach to task" },
  ];
  const linkMode = attachmentTaskId ? "task" : "standalone";

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <ProjectListFieldSelect
        value={objectType}
        options={CREATABLE_OBJECT_TYPES.map((type) => ({
          value: type,
          label: objectTypeLabel(type),
        }))}
        onChange={(next) => {
          const typed = next as SpydrObjectType;
          if (SUPPORTED_OBJECT_TYPES.includes(typed)) {
            onObjectTypeChange(typed);
          }
        }}
        disabled={disabled}
        ariaLabel="Create as"
        menuLabel="Type"
        placeholder="Type"
        emptyValue=""
        triggerClassName="h-8 w-full border-border/80"
        labelClassName="text-[12px] font-medium"
      />

      {supportsProject ? (
        <ProjectSelect
          projects={projects}
          value={projectId ?? ""}
          onChange={onProjectChange}
          allowUnassigned={objectType !== "task"}
          disabled={disabled}
          placeholder={objectType === "task" ? "Project" : "Project (optional)"}
          compact
        />
      ) : null}

      {supportsTaskLink && projectId ? (
        <>
          <ProjectListFieldSelect
            value={linkMode}
            options={linkModeOptions}
            onChange={(next) => {
              if (next === "standalone") {
                onAttachmentChange(null);
                return;
              }
              const firstTask = projectTasks[0];
              if (firstTask) {
                onAttachmentChange({ type: "task", id: firstTask.id, ref: null });
              }
            }}
            disabled={disabled}
            ariaLabel="Note placement"
            menuLabel="Placement"
            placeholder="Placement"
            emptyValue="standalone"
            triggerClassName="h-8 w-full border-border/80 sm:col-span-2"
            labelClassName="text-[12px] font-medium"
          />
          {linkMode === "task" ? (
            <ProjectListFieldSelect
              value={attachmentTaskId ?? ""}
              options={[
                ...(projectTasks.length === 0
                  ? [{ value: "", label: "No open tasks" }]
                  : []),
                ...projectTasks.map((task) => ({
                  value: task.id,
                  label: task.title,
                })),
              ]}
              onChange={(next) => {
                if (!next) return;
                onAttachmentChange({ type: "task", id: next, ref: null });
              }}
              disabled={disabled || projectTasks.length === 0}
              ariaLabel="Task"
              menuLabel="Task"
              placeholder="Select task"
              emptyValue=""
              triggerClassName="h-8 w-full border-border/80 sm:col-span-2"
              labelClassName="text-[12px] font-medium"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
