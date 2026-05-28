import type { DecisionNode } from "@/domain/spydr/utils/types";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import { cn } from "@/lib/utils";

interface DecisionTimelineProps {
  decisions: DecisionNode[];
}

const impactColor: Record<string, string> = {
  high: "bg-[hsl(var(--status-blocked))]",
  medium: "bg-[hsl(var(--status-doing))]",
  low: "bg-[hsl(var(--status-todo))]",
};

export function DecisionTimeline({ decisions }: DecisionTimelineProps) {
  return (
    <ol className="relative ml-6 border-l border-border">
      {decisions.map((decision) => {
        const impact = decision.details?.impact ?? "medium";
        const rationale = decision.details?.rationale || decision.body;

        return (
          <li key={decision.id} className="relative px-6 py-5 row-hover">
            <span
              className={cn(
                "absolute -left-[5px] top-7 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                impactColor[impact] ?? "bg-muted-foreground"
              )}
            />
            <div className="flex items-center gap-3">
              <h2 className="text-[14px] font-semibold">{decision.title}</h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {impact} impact
              </span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                {formatRelativeTime(decision.details?.decidedAt ?? decision.updatedAt)}
              </span>
            </div>
            {rationale && (
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                {rationale}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
