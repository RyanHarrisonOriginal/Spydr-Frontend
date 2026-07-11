import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { PersonWorkTaskEntry } from "@/domain/spydr/utils/personWorkApi";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { ShowCompletedToggle } from "@/domain/spydr/features/shared/components/ShowCompletedToggle";
import {
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
} from "@/domain/spydr/features/projects/components/ProjectDetailSection";
import { TaskStatusSelect } from "@/domain/spydr/features/tasks/components/TaskStatusSelect";
import { TaskDueDateSelect } from "@/domain/spydr/features/tasks/components/TaskDueDateSelect";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionDualRank } from "@/domain/spydr/features/shared/components/CollectionDualRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";

interface PersonTasksSectionProps {
  tasks: PersonWorkTaskEntry[];
  reorderEnabled?: boolean;
  updatingTaskId?: string | null;
  onReorder?(orderedIds: string[]): void;
  onDueDateChange?(taskId: string, dueDate: string | null): void;
  headerActions?: ReactNode;
}

export function PersonTasksSection({
  tasks,
  reorderEnabled = false,
  updatingTaskId = null,
  onReorder,
  onDueDateChange,
  headerActions,
}: PersonTasksSectionProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const completedCount = useMemo(
    () => tasks.filter((entry) => isClosedCollectionStatus(entry.task.status)).length,
    [tasks]
  );

  const visibleTasks = useMemo(
    () =>
      showCompleted
        ? tasks
        : tasks.filter((entry) => !isClosedCollectionStatus(entry.task.status)),
    [tasks, showCompleted]
  );

  const openCount = tasks.filter(
    (entry) => !isClosedCollectionStatus(entry.task.status)
  ).length;

  const hint =
    tasks.length === 0
      ? "No assigned tasks"
      : showCompleted
        ? `${openCount} open · ${tasks.length} total · drag to set person rank`
        : completedCount > 0
          ? `${openCount} open · ${completedCount} completed hidden`
          : `${openCount} open · drag to set person rank`;

  return (
    <ProjectDetailSection>
      <ProjectDetailSectionHeader
        label="Tasks"
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
        {tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/80 px-4 py-8 text-center text-[13px] text-muted-foreground">
            No tasks are assigned to this person yet. Create a task above to assign one.
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/80 px-4 py-8 text-center text-[13px] text-muted-foreground">
            All assigned tasks are completed. Use &ldquo;Show completed&rdquo; above to
            view them.
          </div>
        ) : (
          <CollectionSortableList
            items={visibleTasks.map((entry) => ({ ...entry, id: entry.task.id }))}
            enabled={reorderEnabled}
            className="space-y-2"
            onReorder={(orderedIds) => onReorder?.(orderedIds)}
            renderItem={(entry, sortable) => (
              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 shadow-sm">
                {reorderEnabled ? (
                  <CollectionDragHandle {...sortable.dragHandleProps} />
                ) : null}
                <CollectionDualRank
                  globalRank={entry.globalRank}
                  personRank={entry.personRank}
                  className="shrink-0"
                />
                <TaskStatusSelect
                  value={entry.task.status}
                  disabled
                  className="w-[108px] shrink-0 opacity-90"
                  onChange={() => undefined}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/tasks/${entry.task.id}`}
                    className="block truncate text-[13px] text-foreground/90 transition-colors hover:text-highlight"
                  >
                    {entry.task.title}
                  </Link>
                  {entry.task.project ? (
                    <Link
                      to={`/projects/${entry.task.project.id}`}
                      className="mt-0.5 block truncate text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      {entry.task.project.title}
                    </Link>
                  ) : null}
                </div>
                <span className="w-[118px] shrink-0">
                  <TaskDueDateSelect
                    value={entry.task.details?.dueDate}
                    disabled={!onDueDateChange || updatingTaskId === entry.task.id}
                    className="w-full"
                    onChange={(dueDate) => onDueDateChange?.(entry.task.id, dueDate)}
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
