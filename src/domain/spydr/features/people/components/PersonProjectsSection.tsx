import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { PersonWorkProjectEntry } from "@/domain/spydr/utils/personWorkApi";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { projectPersonaLabels } from "@/domain/spydr/utils/projectPersonas";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { ShowCompletedToggle } from "@/domain/spydr/features/shared/components/ShowCompletedToggle";
import { ProjectTargetDateSelect } from "@/domain/spydr/features/projects/components/ProjectTargetDateSelect";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionDualRank } from "@/domain/spydr/features/shared/components/CollectionDualRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import {
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
} from "@/domain/spydr/features/projects/components/ProjectDetailSection";

interface PersonProjectsSectionProps {
  entries: PersonWorkProjectEntry[];
  reorderEnabled?: boolean;
  updatingProjectId?: string | null;
  onReorder?(orderedIds: string[]): void;
  onTargetDateChange?(projectId: string, targetDate: string | null): void;
  headerActions?: ReactNode;
}

export function PersonProjectsSection({
  entries,
  reorderEnabled = false,
  updatingProjectId = null,
  onReorder,
  onTargetDateChange,
  headerActions,
}: PersonProjectsSectionProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const completedCount = useMemo(
    () => entries.filter((entry) => isClosedCollectionStatus(entry.project.status)).length,
    [entries]
  );

  const visibleEntries = useMemo(
    () =>
      showCompleted
        ? entries
        : entries.filter((entry) => !isClosedCollectionStatus(entry.project.status)),
    [entries, showCompleted]
  );

  const activeCount = entries.length - completedCount;

  const hint =
    entries.length === 0
      ? "No project roles assigned"
      : showCompleted
        ? `${activeCount} active · ${entries.length} total · drag to set person rank`
        : completedCount > 0
          ? `${activeCount} active · ${completedCount} completed hidden`
          : `${entries.length} linked · drag to set person rank`;

  return (
    <ProjectDetailSection>
      <ProjectDetailSectionHeader
        label="Projects"
        actions={
          <>
            <ShowCompletedToggle
              showCompleted={showCompleted}
              completedCount={completedCount}
              onChange={setShowCompleted}
            />
            {headerActions}
          </>
        }
        hint={hint}
      />
      <ProjectDetailSectionBody>
        {entries.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/80 px-4 py-8 text-center text-[13px] text-muted-foreground">
            This person is not linked to any projects yet. Create a project above or
            assign them as requester, assignee, sponsor, or reviewer on an existing
            project.
          </div>
        ) : visibleEntries.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/80 px-4 py-8 text-center text-[13px] text-muted-foreground">
            All linked projects are completed. Use &ldquo;Show completed&rdquo; above to
            view them.
          </div>
        ) : (
          <CollectionSortableList
            items={visibleEntries.map((entry) => ({ ...entry, id: entry.project.id }))}
            enabled={reorderEnabled}
            className="space-y-2"
            onReorder={(orderedIds) => onReorder?.(orderedIds)}
            renderItem={(entry, sortable) => (
              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2.5 shadow-sm">
                {reorderEnabled ? (
                  <CollectionDragHandle {...sortable.dragHandleProps} />
                ) : null}
                <CollectionDualRank
                  globalRank={entry.globalRank}
                  personRank={entry.personRank}
                  className="shrink-0"
                />
                <StatusDot status={entry.project.status} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/projects/${entry.project.id}`}
                    className="block truncate text-[13px] font-medium text-foreground/90 transition-colors hover:text-highlight"
                  >
                    {entry.project.title}
                  </Link>
                  {entry.project.area ? (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {entry.project.area}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {entry.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded border border-border/70 bg-muted/30 px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                    >
                      {projectPersonaLabels[role]}
                    </span>
                  ))}
                </div>
                <span className="w-[118px] shrink-0">
                  <ProjectTargetDateSelect
                    value={entry.project.details?.targetDate}
                    disabled={
                      !onTargetDateChange || updatingProjectId === entry.project.id
                    }
                    className="w-full"
                    onChange={(targetDate) =>
                      onTargetDateChange?.(entry.project.id, targetDate)
                    }
                  />
                </span>
              </div>
            )}
          />
        )}
      </ProjectDetailSectionBody>
    </ProjectDetailSection>
  );
}
