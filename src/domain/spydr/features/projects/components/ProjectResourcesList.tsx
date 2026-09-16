import type { ResourceNode, UpdateProjectChildInput } from "@/domain/spydr/utils/types";
import {
  ProjectDetailEmpty,
  ProjectDetailEntry,
} from "./ProjectDetailSection";
import { ProjectItemActions } from "./ProjectItemActions";

interface ProjectResourcesListProps {
  resources: ResourceNode[];
  onUpdate(childId: string, input: UpdateProjectChildInput): void;
  onDelete(childId: string): void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function ProjectResourcesList({
  resources,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: ProjectResourcesListProps) {
  if (resources.length === 0) {
    return (
      <ProjectDetailEmpty
        title="No resources linked yet."
        description="Files, links, and references will appear here when attached."
      />
    );
  }

  return (
    <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
      {resources.map((resource) => (
        <ProjectDetailEntry key={resource.id}>
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              {resource.details?.resourceType ?? "resource"}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px]">
              {resource.title}
            </span>
            <ProjectItemActions
              fieldSet="resource"
              values={{ title: resource.title, body: resource.body }}
              onSave={(input) => onUpdate(resource.id, input)}
              onDelete={() => onDelete(resource.id)}
              isSaving={isUpdating}
              isDeleting={isDeleting}
            />
          </div>
        </ProjectDetailEntry>
      ))}
    </ul>
  );
}
