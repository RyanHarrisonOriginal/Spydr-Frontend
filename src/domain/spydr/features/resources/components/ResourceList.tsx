import { Bookmark, ExternalLink } from "lucide-react";
import type { ResourceNode } from "@/domain/spydr/utils/types";
import { EntityTag } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";

interface ResourceListProps {
  resources: ResourceNode[];
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onReorder?(orderedIds: string[]): void;
}

function getResourceSource(resource: ResourceNode): string {
  if (resource.details?.externalSource) return resource.details.externalSource;
  if (!resource.details?.url) return "internal";

  try {
    return new URL(resource.details.url).host;
  } catch {
    return resource.details.url;
  }
}

export function ResourceList({
  resources,
  getPriorityRank,
  reorderEnabled = false,
  onReorder,
}: ResourceListProps) {
  return (
    <CollectionSortableList
      items={resources}
      enabled={reorderEnabled}
      className="divide-y divide-border"
      onReorder={(orderedIds) => onReorder?.(orderedIds)}
      renderItem={(resource, sortable) => {
        const source = getResourceSource(resource);

        return (
          <div className="flex items-center gap-3 px-6 py-3 row-hover">
            {reorderEnabled ? (
              <CollectionDragHandle {...sortable.dragHandleProps} />
            ) : null}
            <CollectionPriorityRank rank={getPriorityRank(resource.id)} />
            <Bookmark className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-[13px]">{resource.title}</span>
            {resource.area && <EntityTag tag={resource.area} />}
            <span className="rounded bg-muted/60 px-1.5 py-px font-mono text-[10px] uppercase text-muted-foreground">
              {resource.details?.resourceType ?? "resource"}
            </span>
            <span className="max-w-[180px] truncate font-mono text-[11px] text-muted-foreground">
              {source}
            </span>
            {resource.details?.url && (
              <a
                href={resource.details.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Open ${resource.title}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        );
      }}
    />
  );
}
