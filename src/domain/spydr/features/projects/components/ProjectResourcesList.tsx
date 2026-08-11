import { ArrowUpRight, Paperclip } from "lucide-react";
import type { ResourceNode, UpdateProjectChildInput } from "@/domain/spydr/utils/types";
import {
  ProjectDetailEmpty,
  ProjectDetailEntry,
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
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
  return (
    <ProjectDetailSection className="min-h-[360px]">
      <ProjectDetailSectionHeader
        icon={<Paperclip className="h-3.5 w-3.5" />}
        label="Resources"
        hint={`${resources.length} linked`}
      />

      <ProjectDetailSectionBody className="min-h-0 flex-1 gap-3 p-3">
        {resources.length > 0 ? (
          <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
            {resources.map((resource) => (
              <ProjectDetailEntry key={resource.id}>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded border border-border/60 bg-muted/30 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    {resource.details?.resourceType ?? "resource"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {resource.title}
                  </span>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground" />
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
        ) : (
          <ProjectDetailEmpty
            title="No resources linked yet."
            description="Files, links, and references will appear here when attached."
          />
        )}
      </ProjectDetailSectionBody>
    </ProjectDetailSection>
  );
}
