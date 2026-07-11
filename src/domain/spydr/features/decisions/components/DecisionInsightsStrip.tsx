import { cn } from "@/lib/utils";
import type { DecisionInsights } from "@/domain/spydr/utils/decisionInsights";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";

interface DecisionInsightsStripProps {
  insights: DecisionInsights;
}

interface InsightMetric {
  id: string;
  label: string;
  value: number | string;
  hint?: string;
  tone?: "warn";
}

function buildMetrics(insights: DecisionInsights): InsightMetric[] {
  return [
    {
      id: "recorded",
      label: "Recorded",
      value: insights.total,
    },
    {
      id: "high-impact",
      label: "High impact",
      value: insights.highImpact,
      hint: insights.highImpact > 0 ? "needs attention" : undefined,
      tone: insights.highImpact > 0 ? "warn" : undefined,
    },
    {
      id: "recent",
      label: "Last 30 days",
      value: insights.recentCount,
      hint: insights.recentCount === 0 ? "no recent activity" : undefined,
    },
    {
      id: "projects",
      label: "Projects",
      value: insights.projectCount,
      hint:
        insights.latestDecidedAt && insights.total > 0
          ? `latest ${formatRelativeTime(insights.latestDecidedAt)}`
          : undefined,
    },
  ];
}

export function DecisionInsightsStrip({ insights }: DecisionInsightsStripProps) {
  const metrics = buildMetrics(insights);

  return (
    <div className="grid grid-cols-2 border-b border-border md:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="group relative border-r border-border px-6 py-5 transition-colors last:border-r-0 hover:bg-muted/15"
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-highlight/60 transition-transform duration-300 ease-out group-hover:scale-x-100"
          />
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {metric.label}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-semibold tracking-tight tabular-nums">
              {metric.value}
            </div>
            {metric.hint ? (
              <span
                className={cn(
                  "font-mono text-[11px]",
                  metric.tone === "warn"
                    ? "text-[hsl(var(--status-blocked))]"
                    : "text-muted-foreground"
                )}
              >
                {metric.hint}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
