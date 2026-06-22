import { ArrowUpRight, Paperclip } from "lucide-react";
import type { ResourceNode, UpdateProjectChildInput } from "@/domain/spydr/utils/types";
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
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card/30">
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Resources
        </span>
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {resources.length} linked
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {resources.length > 0 ? (
          <ul className="space-y-2">
            {resources.map((resource) => (
              <li
                key={resource.id}
                className="flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-2.5 py-2 row-hover"
              >
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
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-dashed border-border/70 bg-muted/10 px-3 py-6 text-center">
            <p className="text-[13px] text-muted-foreground">
              No resources linked yet.
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground/80">
              Files, links, and references will appear here when attached.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
