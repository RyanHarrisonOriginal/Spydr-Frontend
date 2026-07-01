import { cn } from "@/lib/utils";

interface CollectionPriorityRankProps {
  rank: number | undefined;
  className?: string;
}

/** 1-based manual priority rank (#1 = top of list). */
export function CollectionPriorityRank({ rank, className }: CollectionPriorityRankProps) {
  if (rank == null) {
    return <span className={cn("font-mono text-[11px] text-muted-foreground/40", className)}>—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-[1.75rem] justify-center rounded border border-border/50 bg-muted/25 px-1 py-px font-mono text-[11px] tabular-nums text-muted-foreground",
        className
      )}
      title={`Priority rank ${rank}`}
    >
      {rank}
    </span>
  );
}
