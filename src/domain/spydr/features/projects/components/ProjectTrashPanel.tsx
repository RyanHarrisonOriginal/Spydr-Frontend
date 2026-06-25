import { useState } from "react";
import { ArchiveRestore, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectNode } from "@/domain/spydr/utils/types";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import { cn } from "@/lib/utils";

export const PROJECTS_TRASH_SECTION_ID = "projects-trash";

interface ProjectTrashPanelProps {
  projects: ProjectNode[];
  isLoading?: boolean;
  onRestore(projectId: string): void;
  isRestoring?: boolean;
  restoringId?: string | null;
  error?: string | null;
  expanded?: boolean;
  onExpandedChange?(expanded: boolean): void;
}

export function ProjectTrashPanel({
  projects,
  isLoading = false,
  onRestore,
  isRestoring = false,
  restoringId = null,
  error = null,
  expanded: expandedProp,
  onExpandedChange,
}: ProjectTrashPanelProps) {
  const [expandedInternal, setExpandedInternal] = useState(false);
  const expanded = expandedProp ?? expandedInternal;
  const setExpanded = onExpandedChange ?? setExpandedInternal;

  if (!isLoading && projects.length === 0) {
    return null;
  }

  return (
    <section
      id={PROJECTS_TRASH_SECTION_ID}
      className="mx-4 mb-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
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
            restore deleted projects
          </span>
        )}
        {expanded && <span className="min-w-0 flex-1" />}
        <span className="shrink-0 rounded-full border border-border/60 bg-background px-1.5 py-px font-mono text-[9px] font-semibold tabular-nums leading-none text-muted-foreground">
          {isLoading ? "…" : projects.length}
        </span>
      </button>

      {expanded && (
        <>
          <p className="border-b border-border/40 px-4 py-2 text-[10px] text-muted-foreground">
            Deleted projects can be restored here
          </p>
          {error ? (
            <p className="border-b border-destructive/20 bg-destructive/5 px-4 py-2 text-[11px] text-destructive">
              {error}
            </p>
          ) : null}
          <ul className="max-h-44 divide-y divide-border/50 overflow-y-auto">
            {isLoading ? (
              <li className="px-4 py-3 text-[12px] text-muted-foreground">Loading trash…</li>
            ) : (
              projects.map((project) => {
                const restoring = isRestoring && restoringId === project.id;
                return (
                  <li
                    key={project.id}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <p className="min-w-0 flex-1 truncate text-[12px] font-medium">
                      {project.title}
                    </p>
                    <time
                      className="hidden shrink-0 font-mono text-[9px] text-muted-foreground sm:block"
                      dateTime={project.deletedAt ?? project.updatedAt}
                      title={formatShortDate(project.deletedAt ?? project.updatedAt)}
                    >
                      {formatRelativeTime(project.deletedAt ?? project.updatedAt)}
                    </time>
                    <Button
                      type="button"
                      size="sm"
                      className="h-6 shrink-0 gap-1 px-1.5 text-[10px]"
                      disabled={isRestoring}
                      onClick={() => onRestore(project.id)}
                    >
                      <ArchiveRestore className="h-2.5 w-2.5" />
                      {restoring ? "…" : "Restore"}
                    </Button>
                  </li>
                );
              })
            )}
          </ul>
        </>
      )}
    </section>
  );
}

interface ProjectsTrashButtonProps {
  count: number;
  className?: string;
  onClick(): void;
}

export function ProjectsTrashButton({
  count,
  className,
  onClick,
}: ProjectsTrashButtonProps) {
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 text-[12px] transition-colors hover:bg-muted/60",
        className
      )}
    >
      <Trash2 className="h-3.5 w-3.5" />
      Trash
      <span className="rounded-full border border-border/60 bg-background px-1.5 py-px font-mono text-[9px] font-semibold tabular-nums leading-none text-muted-foreground">
        {count}
      </span>
    </button>
  );
}
