import { useMemo, useState } from "react";
import { ArchiveRestore, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  DecisionNode,
  IdeaNode,
  NoteNode,
  ProjectChildKind,
  ProjectDetailNode,
  ResourceNode,
  TaskNode,
} from "@/domain/spydr/utils/types";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import { cn } from "@/lib/utils";

interface DeletedEntry {
  id: string;
  kind: ProjectChildKind;
  label: string;
  detail?: string;
  deletedAt: string;
}

interface ProjectDeletedItemsProps {
  deleted: ProjectDetailNode["deleted"];
  onRestore: (kind: ProjectChildKind, childId: string) => void;
  isRestoring?: boolean;
  restoringId?: string | null;
  expanded?: boolean;
  onExpandedChange?(expanded: boolean): void;
}

export function getDeletedItemCount(deleted: ProjectDetailNode["deleted"]): number {
  return (
    deleted.tasks.length +
    deleted.decisions.length +
    deleted.ideas.length +
    deleted.notes.length +
    deleted.resources.length
  );
}

export const PROJECT_TRASH_SECTION_ID = "project-trash";

export function ProjectDeletedItems({
  deleted,
  onRestore,
  isRestoring = false,
  restoringId = null,
  expanded: expandedProp,
  onExpandedChange,
}: ProjectDeletedItemsProps) {
  const [expandedInternal, setExpandedInternal] = useState(false);
  const expanded = expandedProp ?? expandedInternal;
  const setExpanded = onExpandedChange ?? setExpandedInternal;

  const entries = useMemo(
    () => collectDeletedEntries(deleted),
    [deleted]
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <section
      id={PROJECT_TRASH_SECTION_ID}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1.5 border-b border-border/60 bg-muted/20 px-4 py-2.5 text-left transition-colors hover:bg-muted/30"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        <Trash2 className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/80">
          Trash
        </span>
        {!expanded && (
          <span className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">
            restore deleted items
          </span>
        )}
        {expanded && <span className="min-w-0 flex-1" />}
        <span className="shrink-0 rounded-full border border-border/60 bg-background px-1.5 py-px font-mono text-[9px] font-semibold tabular-nums leading-none text-muted-foreground">
          {entries.length}
        </span>
      </button>

      {expanded && (
        <>
          <p className="border-b border-border/40 px-4 py-2 text-[10px] text-muted-foreground">
            Tasks, notes, decisions, ideas, and resources
          </p>
          <ul className="max-h-44 divide-y divide-border/50 overflow-y-auto">
          {entries.map((entry) => {
            const restoring = isRestoring && restoringId === entry.id;
            return (
              <li
                key={`${entry.kind}-${entry.id}`}
                className="flex items-center gap-1.5 px-4 py-2"
              >
                <span className="shrink-0 rounded-md bg-muted/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                  {entry.kind}
                </span>
                <p className="min-w-0 flex-1 truncate text-[12px]">{entry.label}</p>
                <time
                  className="hidden shrink-0 font-mono text-[9px] text-muted-foreground md:block"
                  dateTime={entry.deletedAt}
                  title={formatShortDate(entry.deletedAt)}
                >
                  {formatRelativeTime(entry.deletedAt)}
                </time>
                <Button
                  type="button"
                  size="sm"
                  className="h-6 shrink-0 gap-1 px-1.5 text-[10px]"
                  disabled={isRestoring}
                  onClick={() => onRestore(entry.kind, entry.id)}
                >
                  <ArchiveRestore className="h-2.5 w-2.5" />
                  {restoring ? "…" : "Restore"}
                </Button>
              </li>
            );
          })}
          </ul>
        </>
      )}
    </section>
  );
}

function collectDeletedEntries(
  deleted: ProjectDetailNode["deleted"]
): DeletedEntry[] {
  const mapNode = (
    kind: ProjectChildKind,
    node: TaskNode | NoteNode | DecisionNode | IdeaNode | ResourceNode
  ): DeletedEntry => ({
    id: node.id,
    kind,
    label: node.title,
    detail:
      kind === "decision"
        ? (node as DecisionNode).details?.rationale || (node as DecisionNode).body
        : node.body || undefined,
    deletedAt: node.deletedAt ?? node.updatedAt,
  });

  return [
    ...deleted.tasks.map((node) => mapNode("task", node)),
    ...deleted.decisions.map((node) => mapNode("decision", node)),
    ...deleted.ideas.map((node) => mapNode("idea", node)),
    ...deleted.notes.map((node) => mapNode("note", node)),
    ...deleted.resources.map((node) => mapNode("resource", node)),
  ].sort(
    (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
  );
}
