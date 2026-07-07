import { AreaColorSwatch } from "@/domain/spydr/features/projects/components/AreaColorSwatch";
import { sortedAreaSummaries } from "@/domain/spydr/utils/dashboardModel";
import { hslColorCss } from "@/domain/spydr/utils/projectAreaColors";
import type { WorkspaceDashboardAreaSummary } from "@/domain/spydr/utils/workspaceDashboard";

interface DashboardAreaSummaryChartProps {
  summaries?: WorkspaceDashboardAreaSummary[];
  totalProjects: number;
}

export function DashboardAreaSummaryChart({
  summaries = [],
  totalProjects,
}: DashboardAreaSummaryChartProps) {
  const entries = sortedAreaSummaries(summaries).filter((entry) => entry.projects > 0);
  const max = entries[0]?.projects ?? 0;

  return (
    <div className="card-accent rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/25 px-4 py-2.5">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/80">
          Projects by area
        </h2>
      </div>
      <div className="space-y-3 p-4">
        {entries.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No projects assigned to areas yet.</p>
        ) : (
          entries.map((entry) => {
            const width = max > 0 ? Math.round((entry.projects / max) * 100) : 0;
            const share =
              totalProjects > 0 ? Math.round((entry.projects / totalProjects) * 100) : 0;

            return (
              <div key={entry.id ?? `area:${entry.name}`} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="flex min-w-0 items-center gap-2">
                    <AreaColorSwatch color={entry.color} className="h-2.5 w-2.5" />
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {entry.projects}
                    <span className="text-muted-foreground/60"> · {share}%</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${width}%`,
                      backgroundColor: hslColorCss(entry.color),
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
