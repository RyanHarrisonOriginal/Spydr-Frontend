import { cn } from "@/lib/utils";
import { CollectionPriorityRank } from "./CollectionPriorityRank";

interface CollectionDualRankProps {
  globalRank: number;
  personRank: number;
  className?: string;
}

export function CollectionDualRank({
  globalRank,
  personRank,
  className,
}: CollectionDualRankProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="inline-flex items-center gap-1">
        <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/70">
          G
        </span>
        <CollectionPriorityRank rank={globalRank} />
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="font-mono text-[8px] uppercase tracking-wider text-highlight/80">
          P
        </span>
        <CollectionPriorityRank
          rank={personRank}
          className="border-highlight/25 bg-highlight/8 text-highlight"
        />
      </span>
    </span>
  );
}
