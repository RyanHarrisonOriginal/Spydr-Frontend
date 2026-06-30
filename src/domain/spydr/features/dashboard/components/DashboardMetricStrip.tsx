import { cn } from "@/lib/utils";
import type { WorkspaceDashboardSummary } from "@/domain/spydr/utils/workspaceDashboard";
import { dashboardMetrics } from "@/domain/spydr/utils/dashboardModel";

interface DashboardMetricStripProps {
  summary: WorkspaceDashboardSummary;
}

export function DashboardMetricStrip({ summary }: DashboardMetricStripProps) {
  return (
    <div className="grid grid-cols-2 border-b border-border md:grid-cols-4">
      {dashboardMetrics.map((metric) => {
        const value = metric.getValue(summary);
        const hint = metric.hint?.(summary);

        return (
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
                {value}
              </div>
              {hint ? (
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    metric.tone === "warn"
                      ? "text-[hsl(var(--status-blocked))]"
                      : "text-muted-foreground"
                  )}
                >
                  {hint}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
