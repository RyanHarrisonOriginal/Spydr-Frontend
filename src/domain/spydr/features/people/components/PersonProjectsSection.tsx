import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { PersonWorkProjectEntry } from "@/domain/spydr/utils/personWorkApi";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import {
  isPersonOwnedProject,
} from "@/domain/spydr/utils/personWork";
import { projectPersonaLabels } from "@/domain/spydr/utils/projectPersonas";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { ShowCompletedToggle } from "@/domain/spydr/features/shared/components/ShowCompletedToggle";
import { ProjectStatusSelect } from "@/domain/spydr/features/projects/components/ProjectStatusSelect";
import { ProjectTargetDateSelect } from "@/domain/spydr/features/projects/components/ProjectTargetDateSelect";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionDualRank } from "@/domain/spydr/features/shared/components/CollectionDualRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import {
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
} from "@/domain/spydr/features/projects/components/ProjectDetailSection";
import { cn } from "@/lib/utils";

interface PersonProjectsSectionProps {
  entries: PersonWorkProjectEntry[];
  reorderEnabled?: boolean;
  updatingProjectId?: string | null;
  onReorder?(orderedIds: string[]): void;
  onTargetDateChange?(projectId: string, targetDate: string | null): void;
  onStatusChange?(projectId: string, status: string): void;
  headerActions?: ReactNode;
  className?: string;
}

function OpenTaskCount({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums",
        count > 0 ? "text-highlight" : "text-muted-foreground/70"
      )}
      title={`${count} open task${count === 1 ? "" : "s"} assigned to this person`}
    >
      {count} open
    </span>
  );
}

export function PersonProjectsSection({
  entries,
  reorderEnabled = false,
  updatingProjectId = null,
  onReorder,
  onTargetDateChange,
  onStatusChange,
  headerActions,
  className,
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

  const ownedCount = useMemo(
    () => entries.filter((entry) => isPersonOwnedProject(entry.roles)).length,
    [entries]
  );

  const activeCount = entries.length - completedCount;
  const openAcrossProjects = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.openTaskCount, 0),
    [entries]
  );

  const hint =
    entries.length === 0
      ? "No projects in view"
      : `${ownedCount} owned · ${openAcrossProjects} open tasks · ${
          showCompleted
            ? `${entries.length} total`
            : completedCount > 0
              ? `${activeCount} active`
              : "drag to rank"
        }`;

  return (
    <ProjectDetailSection className={className}>
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
      <ProjectDetailSectionBody className="gap-1.5 p-2.5">
        {entries.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground">
            No projects yet. Create one they own, or assign them tasks on an
            existing project to surface it here.
          </div>
        ) : visibleEntries.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground">
            All linked projects are completed. Use &ldquo;Show completed&rdquo; above to
            view them.
          </div>
        ) : (
          <CollectionSortableList
            items={visibleEntries.map((entry) => ({ ...entry, id: entry.project.id }))}
            enabled={reorderEnabled}
            className="space-y-1"
            onReorder={(orderedIds) => onReorder?.(orderedIds)}
            renderItem={(entry, sortable) => {
              const owned = isPersonOwnedProject(entry.roles);
              const busy = updatingProjectId === entry.project.id;

              return (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-sm border bg-background px-2.5 py-1.5",
                    owned
                      ? "border-border/80"
                      : "border-border/60 border-l-2 border-l-border"
                  )}
                >
                  {reorderEnabled ? (
                    <CollectionDragHandle {...sortable.dragHandleProps} />
                  ) : null}
                  <CollectionDualRank
                    globalRank={entry.globalRank}
                    personRank={entry.personRank}
                    className="shrink-0"
                  />

                  {owned && onStatusChange ? (
                    <ProjectStatusSelect
                      value={entry.project.status}
                      disabled={busy}
                      className="w-[100px] shrink-0"
                      onChange={(status) =>
                        onStatusChange(entry.project.id, status)
                      }
                    />
                  ) : (
                    <span className="flex w-[100px] shrink-0 items-center gap-1.5 px-1">
                      <StatusDot status={entry.project.status} className="shrink-0" />
                      <span className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {entry.project.status.replace(/_/g, " ")}
                      </span>
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <Link
                        to={`/projects/${entry.project.id}`}
                        className="block min-w-0 truncate text-[13px] font-medium text-foreground/90 transition-colors hover:text-highlight"
                      >
                        {entry.project.title}
                      </Link>
                      {owned ? (
                        <span className="shrink-0 rounded-sm border border-highlight/25 bg-highlight/8 px-1 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-highlight">
                          Owned
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                      {entry.project.area ? (
                        <span className="truncate text-[11px] text-muted-foreground">
                          {entry.project.area}
                        </span>
                      ) : null}
                      {entry.roles.length > 0 ? (
                        <span className="flex flex-wrap gap-1">
                          {entry.roles
                            .filter((role) => role !== "assignee")
                            .map((role) => (
                              <span
                                key={role}
                                className="rounded-sm border border-border/70 bg-muted/20 px-1 py-px font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
                              >
                                {projectPersonaLabels[role]}
                              </span>
                            ))}
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/80">
                          Via tasks
                        </span>
                      )}
                    </div>
                  </div>

                  <OpenTaskCount count={entry.openTaskCount} />

                  <span className="w-[108px] shrink-0">
                    <ProjectTargetDateSelect
                      value={entry.project.details?.targetDate}
                      disabled={!onTargetDateChange || busy}
                      className="w-full"
                      onChange={(targetDate) =>
                        onTargetDateChange?.(entry.project.id, targetDate)
                      }
                    />
                  </span>
                </div>
              );
            }}
          />
        )}
      </ProjectDetailSectionBody>
    </ProjectDetailSection>
  );
}
