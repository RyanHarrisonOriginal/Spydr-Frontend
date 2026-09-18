import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CollectionPriorityRankProps {
  rank: number | undefined;
  maxRank?: number;
  onRankChange?(rank: number): void;
  className?: string;
}

const rankClassName =
  "inline-flex h-[1.375rem] min-w-[1.75rem] justify-center rounded border border-border/20 bg-muted/15 px-1 py-px font-mono text-[11px] tabular-nums text-muted-foreground";

/** 1-based manual priority rank (#1 = top of list). */
export function CollectionPriorityRank({
  rank,
  maxRank,
  onRankChange,
  className,
}: CollectionPriorityRankProps) {
  const [draft, setDraft] = useState(rank == null ? "" : String(rank));

  useEffect(() => {
    setDraft(rank == null ? "" : String(rank));
  }, [rank]);

  if (rank == null) {
    return <span className={cn("font-mono text-[11px] text-muted-foreground/40", className)}>—</span>;
  }

  if (!onRankChange) {
    return (
      <span
        className={cn(rankClassName, className)}
        title={`Priority rank ${rank}`}
      >
        {rank}
      </span>
    );
  }

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isFinite(parsed)) {
      setDraft(String(rank));
      return;
    }
    const next = Math.min(Math.max(1, parsed), maxRank ?? Number.MAX_SAFE_INTEGER);
    setDraft(String(next));
    if (next !== rank) onRankChange(next);
  };

  return (
    <input
      aria-label="Priority rank"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft}
      title={`Priority rank ${rank}. Type a number to move this row.`}
      onChange={(event) => {
        setDraft(event.target.value.replace(/\D/g, "").slice(0, 4));
      }}
      onBlur={commit}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setDraft(String(rank));
          event.currentTarget.blur();
        }
      }}
      className={cn(
        rankClassName,
        "w-8 bg-transparent text-center outline-none hover:border-border/50 focus:border-highlight/40 focus:bg-background focus:text-foreground",
        className
      )}
    />
  );
}
