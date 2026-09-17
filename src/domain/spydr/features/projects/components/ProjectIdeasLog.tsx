import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  IdeaNode,
  ProjectNode,
  UpdateProjectChildInput,
} from "@/domain/spydr/utils/types";
import { EntityTransformMenu } from "@/domain/spydr/features/shared/components/EntityTransformMenu";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import type { ProjectIdeaFormValues } from "../hooks/useProjectDetailPage";
import {
  ProjectDetailEmpty,
  ProjectDetailEntry,
  ProjectDetailInlineError,
  detailQuietInputClassName,
} from "./ProjectDetailSection";
import { ProjectItemActions } from "./ProjectItemActions";

interface ProjectIdeasLogProps {
  ideas: IdeaNode[];
  projects: ProjectNode[];
  projectId: string;
  form: ProjectIdeaFormValues;
  canAdd: boolean;
  isAdding: boolean;
  error: string | null;
  onFieldChange<TField extends keyof ProjectIdeaFormValues>(
    field: TField,
    value: ProjectIdeaFormValues[TField]
  ): void;
  onAdd(): void;
  onUpdate(childId: string, input: UpdateProjectChildInput): void;
  onDelete(childId: string): void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function ProjectIdeasLog({
  ideas,
  projects,
  projectId,
  form,
  canAdd,
  isAdding,
  error,
  onFieldChange,
  onAdd,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: ProjectIdeasLogProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd();
        }}
      >
        <input
          value={form.title}
          onChange={(event) => onFieldChange("title", event.target.value)}
          placeholder="Capture an idea..."
          className={detailQuietInputClassName}
        />
        <Button type="submit" className="h-8 rounded-md px-3 text-[12px]" disabled={!canAdd}>
          <Plus className="h-3.5 w-3.5" />
          {isAdding ? "Adding..." : "Add"}
        </Button>
      </form>
      {error ? <ProjectDetailInlineError>{error}</ProjectDetailInlineError> : null}
      {ideas.length > 0 ? (
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {ideas.map((idea) => (
            <ProjectDetailEntry key={idea.id}>
              <div className="flex items-center gap-2">
                <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                  {idea.title}
                </h3>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {formatRelativeTime(idea.updatedAt)}
                </span>
                <ProjectItemActions
                  fieldSet="idea"
                  values={{ title: idea.title, body: idea.body }}
                  onSave={(input) => onUpdate(idea.id, input)}
                  onDelete={() => onDelete(idea.id)}
                  isSaving={isUpdating}
                  isDeleting={isDeleting}
                />
                <EntityTransformMenu
                  nodeId={idea.id}
                  sourceType="idea"
                  sourceTitle={idea.title}
                  projects={projects}
                  defaultProjectId={projectId}
                  compact
                />
              </div>
              {idea.body ? (
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                  {idea.body}
                </p>
              ) : null}
            </ProjectDetailEntry>
          ))}
        </ul>
      ) : (
        <ProjectDetailEmpty title="No ideas linked yet." />
      )}
    </div>
  );
}
