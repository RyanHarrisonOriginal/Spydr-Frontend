import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { sortedStatusEntries } from "@/domain/spydr/utils/dashboardModel";
import type { WorkspaceDashboardStatusCounts } from "@/domain/spydr/utils/workspaceDashboard";
import { taskStatusLabels, isTaskStatus } from "@/domain/spydr/utils/taskStatus";
import { cn } from "@/lib/utils";

interface DashboardStatusBreakdownProps {
  title: string;
  counts: WorkspaceDashboardStatusCounts;
  total: number;
  labelForStatus?: (status: string) => string;
}

function defaultLabel(status: string) {
  return isTaskStatus(status) ? taskStatusLabels[status] : status.replace(/_/g, " ");
}

export function DashboardStatusBreakdown({
  title,
  counts,
  total,
  labelForStatus = defaultLabel,
}: DashboardStatusBreakdownProps) {
  const entries = sortedStatusEntries(counts);
  const max = entries[0]?.count ?? 0;

  return (
    <div className="card-accent rounded-md border border-border bg-card">
      <div className="border-b border-border bg-muted/25 px-4 py-2.5">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/80">
          {title}
        </h2>
      </div>
      <div className="space-y-3 p-4">
        {entries.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No data yet.</p>
        ) : (
          entries.map((entry) => {
            const width = max > 0 ? Math.round((entry.count / max) * 100) : 0;
            const share = total > 0 ? Math.round((entry.count / total) * 100) : 0;

            return (
              <div key={entry.status} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="flex min-w-0 items-center gap-2">
                    <StatusDot status={entry.status} />
                    <span className="truncate capitalize">
                      {labelForStatus(entry.status)}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {entry.count}
                    <span className="text-muted-foreground/60"> · {share}%</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className={cn("h-full rounded-full bg-primary/70")}
                    style={{ width: `${width}%` }}
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
